<?php
/**
 * Modelo: Vendedor
 * Gestión de vendedores del sistema de BINGO
 */

require_once __DIR__ . '/../config/database.php';

class Vendedor {
    private $db;
    private $table = 'vendedores';

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Crear vendedor
     */
    public function crear($data) {
        try {
            // Validar datos
            $errors = $this->validar($data);
            if (!empty($errors)) {
                throw new Exception(implode(', ', $errors));
            }

            // Verificar si el código ya existe
            if ($this->existeCodigo($data['codigo'])) {
                throw new Exception("El código {$data['codigo']} ya está en uso");
            }

            $sql = "INSERT INTO {$this->table} (codigo, nombre_completo, telefono, email, direccion, activo)
                    VALUES (:codigo, :nombre, :telefono, :email, :direccion, 1)";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':codigo' => strtoupper($data['codigo']),
                ':nombre' => $data['nombre_completo'],
                ':telefono' => $data['telefono'] ?? null,
                ':email' => $data['email'] ?? null,
                ':direccion' => $data['direccion'] ?? null
            ]);

            $id = $this->db->lastInsertId();
            return $this->obtenerPorId($id);

        } catch (Exception $e) {
            logError("Error al crear vendedor: " . $e->getMessage(), $data);
            throw $e;
        }
    }

    /**
     * Obtener todos los vendedores
     */
    public function obtenerTodos($activo = null) {
        try {
            $sql = "SELECT * FROM {$this->table}";

            if ($activo !== null) {
                $sql .= " WHERE activo = :activo";
            }

            $sql .= " ORDER BY nombre_completo ASC";

            $stmt = $this->db->prepare($sql);

            if ($activo !== null) {
                $stmt->execute([':activo' => $activo ? 1 : 0]);
            } else {
                $stmt->execute();
            }

            return $stmt->fetchAll();

        } catch (Exception $e) {
            logError("Error al obtener vendedores: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener vendedor por ID
     */
    public function obtenerPorId($id) {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);

            return $stmt->fetch();

        } catch (Exception $e) {
            logError("Error al obtener vendedor por ID: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener vendedor por código
     */
    public function obtenerPorCodigo($codigo) {
        try {
            $sql = "SELECT * FROM {$this->table} WHERE codigo = :codigo";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':codigo' => strtoupper($codigo)]);

            return $stmt->fetch();

        } catch (Exception $e) {
            logError("Error al obtener vendedor por código: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Actualizar vendedor
     */
    public function actualizar($id, $data) {
        try {
            // Verificar que existe
            $vendedor = $this->obtenerPorId($id);
            if (!$vendedor) {
                throw new Exception("Vendedor no encontrado");
            }

            // Si se cambia el código, verificar que no exista
            if (isset($data['codigo']) && $data['codigo'] != $vendedor['codigo']) {
                if ($this->existeCodigo($data['codigo'])) {
                    throw new Exception("El código {$data['codigo']} ya está en uso");
                }
            }

            $sql = "UPDATE {$this->table} SET ";
            $campos = [];
            $params = [':id' => $id];

            if (isset($data['codigo'])) {
                $campos[] = "codigo = :codigo";
                $params[':codigo'] = strtoupper($data['codigo']);
            }
            if (isset($data['nombre_completo'])) {
                $campos[] = "nombre_completo = :nombre";
                $params[':nombre'] = $data['nombre_completo'];
            }
            if (isset($data['telefono'])) {
                $campos[] = "telefono = :telefono";
                $params[':telefono'] = $data['telefono'];
            }
            if (isset($data['email'])) {
                $campos[] = "email = :email";
                $params[':email'] = $data['email'];
            }
            if (isset($data['direccion'])) {
                $campos[] = "direccion = :direccion";
                $params[':direccion'] = $data['direccion'];
            }

            $sql .= implode(', ', $campos) . " WHERE id = :id";

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            return $this->obtenerPorId($id);

        } catch (Exception $e) {
            logError("Error al actualizar vendedor: " . $e->getMessage(), $data);
            throw $e;
        }
    }

    /**
     * Cambiar estado activo/inactivo
     */
    public function cambiarEstado($id, $activo) {
        try {
            $sql = "UPDATE {$this->table} SET activo = :activo WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':activo' => $activo ? 1 : 0,
                ':id' => $id
            ]);

            return $this->obtenerPorId($id);

        } catch (Exception $e) {
            logError("Error al cambiar estado de vendedor: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Eliminar vendedor
     */
    public function eliminar($id) {
        try {
            // Verificar si tiene asignaciones
            $sql = "SELECT COUNT(*) as total FROM asignacion_boletos WHERE vendedor_id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $result = $stmt->fetch();

            if ($result['total'] > 0) {
                throw new Exception("No se puede eliminar un vendedor con asignaciones de boletos");
            }

            $sql = "DELETE FROM {$this->table} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([':id' => $id]);

        } catch (Exception $e) {
            logError("Error al eliminar vendedor: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Obtener estadísticas del vendedor
     */
    public function obtenerEstadisticas($id, $eventoId = null) {
        try {
            $sql = "SELECT * FROM v_estadisticas_vendedores WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);

            $stats = $stmt->fetch();

            if ($eventoId) {
                // Estadísticas específicas del evento
                $sql = "SELECT
                    COUNT(DISTINCT a.id) as asignaciones_evento,
                    COALESCE(SUM(a.cantidad), 0) as boletos_asignados_evento,
                    COUNT(CASE WHEN b.estado = 'vendido' THEN 1 END) as vendidos_evento,
                    COALESCE(SUM(b.precio_venta), 0) as ingresos_evento
                FROM asignacion_boletos a
                LEFT JOIN boletos_detalle b ON a.id = b.asignacion_id
                WHERE a.vendedor_id = :id AND a.evento_id = :evento_id
                GROUP BY a.vendedor_id";

                $stmt = $this->db->prepare($sql);
                $stmt->execute([
                    ':id' => $id,
                    ':evento_id' => $eventoId
                ]);

                $statsEvento = $stmt->fetch();
                $stats['evento'] = $statsEvento ?: [];
            }

            return $stats;

        } catch (Exception $e) {
            logError("Error al obtener estadísticas: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Verificar si existe un código
     */
    private function existeCodigo($codigo) {
        $sql = "SELECT COUNT(*) as total FROM {$this->table} WHERE codigo = :codigo";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':codigo' => strtoupper($codigo)]);
        $result = $stmt->fetch();

        return $result['total'] > 0;
    }

    /**
     * Validar datos del vendedor
     */
    private function validar($data) {
        $errors = [];

        if (empty($data['codigo'])) {
            $errors[] = 'El código es obligatorio';
        } elseif (strlen($data['codigo']) > 50) {
            $errors[] = 'El código no puede tener más de 50 caracteres';
        }

        if (empty($data['nombre_completo'])) {
            $errors[] = 'El nombre completo es obligatorio';
        } elseif (strlen($data['nombre_completo']) > 255) {
            $errors[] = 'El nombre no puede tener más de 255 caracteres';
        }

        if (!empty($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'El email no es válido';
        }

        return $errors;
    }
}
