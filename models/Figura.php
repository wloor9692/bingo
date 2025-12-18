<?php
/**
 * Modelo Figura
 * Gestión de figuras/patrones de BINGO
 */

class Figura {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Obtener todas las figuras
     */
    public function obtenerTodas($activo = null) {
        try {
            $sql = "SELECT * FROM figuras WHERE 1=1";
            $params = [];

            if ($activo !== null) {
                $sql .= " AND activo = :activo";
                $params[':activo'] = $activo;
            }

            $sql .= " ORDER BY nombre ASC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            logError('Error al obtener figuras: ' . $e->getMessage());
            throw new Exception('Error al obtener figuras');
        }
    }

    /**
     * Obtener figura por ID
     */
    public function obtenerPorId($id) {
        try {
            $sql = "SELECT * FROM figuras WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            $figura = $stmt->fetch();

            if (!$figura) {
                throw new Exception('Figura no encontrada');
            }

            return $figura;
        } catch (PDOException $e) {
            logError('Error al obtener figura: ' . $e->getMessage());
            throw new Exception('Error al obtener figura');
        }
    }

    /**
     * Crear nueva figura
     */
    public function crear($data) {
        $errors = $this->validar($data);
        if (!empty($errors)) {
            throw new Exception(implode(', ', $errors));
        }

        try {
            $sql = "INSERT INTO figuras (nombre, descripcion, patron_json, activo)
                    VALUES (:nombre, :descripcion, :patron_json, :activo)";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':nombre' => $data['nombre'],
                ':descripcion' => $data['descripcion'] ?? null,
                ':patron_json' => $data['patron_json'],
                ':activo' => $data['activo'] ?? 1
            ]);

            $id = $this->conn->lastInsertId();
            return $this->obtenerPorId($id);
        } catch (PDOException $e) {
            logError('Error al crear figura: ' . $e->getMessage());
            throw new Exception('Error al crear figura');
        }
    }

    /**
     * Actualizar figura
     */
    public function actualizar($id, $data) {
        $this->obtenerPorId($id);

        $errors = $this->validar($data);
        if (!empty($errors)) {
            throw new Exception(implode(', ', $errors));
        }

        try {
            $sql = "UPDATE figuras
                    SET nombre = :nombre,
                        descripcion = :descripcion,
                        patron_json = :patron_json,
                        activo = :activo
                    WHERE id = :id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':nombre' => $data['nombre'],
                ':descripcion' => $data['descripcion'],
                ':patron_json' => $data['patron_json'],
                ':activo' => $data['activo']
            ]);

            return $this->obtenerPorId($id);
        } catch (PDOException $e) {
            logError('Error al actualizar figura: ' . $e->getMessage());
            throw new Exception('Error al actualizar figura');
        }
    }

    /**
     * Cambiar estado
     */
    public function cambiarEstado($id, $activo) {
        try {
            $sql = "UPDATE figuras SET activo = :activo WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id, ':activo' => $activo]);
            return $this->obtenerPorId($id);
        } catch (PDOException $e) {
            logError('Error al cambiar estado: ' . $e->getMessage());
            throw new Exception('Error al cambiar estado');
        }
    }

    /**
     * Eliminar figura
     */
    public function eliminar($id) {
        try {
            // Verificar que no esté en uso
            $sql = "SELECT COUNT(*) as count FROM evento_figuras WHERE figura_id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            $result = $stmt->fetch();

            if ($result['count'] > 0) {
                throw new Exception('No se puede eliminar una figura que está en uso');
            }

            $sql = "DELETE FROM figuras WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([':id' => $id]);
        } catch (PDOException $e) {
            logError('Error al eliminar figura: ' . $e->getMessage());
            throw new Exception('Error al eliminar figura');
        }
    }

    /**
     * Validar patrón de la figura
     */
    public function validarPatron($boletoNumeros, $bolasCantadas, $patronJson) {
        try {
            $patron = json_decode($patronJson, true);
            if (!$patron) {
                return false;
            }

            $numeros = json_decode($boletoNumeros, true);
            if (!$numeros) {
                return false;
            }

            // Convertir patrón a posiciones (row, col)
            foreach ($patron as $posicion) {
                $row = $posicion['row'];
                $col = $posicion['col'];

                // Verificar que esa posición tenga un número
                if (!isset($numeros[$row][$col])) {
                    return false;
                }

                $numero = $numeros[$row][$col];

                // Verificar que ese número haya sido cantado
                if (!in_array($numero, $bolasCantadas)) {
                    return false;
                }
            }

            return true;
        } catch (Exception $e) {
            logError('Error al validar patrón: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Validar datos
     */
    private function validar($data) {
        $errors = [];

        if (empty($data['nombre'])) {
            $errors[] = 'El nombre es requerido';
        }

        if (empty($data['patron_json'])) {
            $errors[] = 'El patrón es requerido';
        } else {
            $patron = json_decode($data['patron_json'], true);
            if (!$patron) {
                $errors[] = 'El patrón JSON no es válido';
            }
        }

        return $errors;
    }
}
