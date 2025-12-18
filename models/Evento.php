<?php
/**
 * Modelo Evento
 * Gestión de eventos de BINGO
 */

class Evento {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Crear nuevo evento
     */
    public function crear($data) {
        // Validar datos
        $errors = $this->validar($data);
        if (!empty($errors)) {
            throw new Exception(implode(', ', $errors));
        }

        try {
            $sql = "INSERT INTO eventos (nombre, descripcion, fecha_evento, precio_boleto, premio_total, estado)
                    VALUES (:nombre, :descripcion, :fecha_evento, :precio_boleto, :premio_total, :estado)";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':nombre' => $data['nombre'],
                ':descripcion' => $data['descripcion'] ?? null,
                ':fecha_evento' => $data['fecha_evento'],
                ':precio_boleto' => $data['precio_boleto'],
                ':premio_total' => $data['premio_total'],
                ':estado' => $data['estado'] ?? 'pendiente'
            ]);

            $eventoId = $this->conn->lastInsertId();

            // Asociar figuras si se enviaron
            if (!empty($data['figuras'])) {
                $this->asociarFiguras($eventoId, $data['figuras']);
            }

            return $this->obtenerPorId($eventoId);
        } catch (PDOException $e) {
            logError('Error al crear evento: ' . $e->getMessage());
            throw new Exception('Error al crear evento');
        }
    }

    /**
     * Obtener todos los eventos
     */
    public function obtenerTodos($filtros = []) {
        try {
            $sql = "SELECT e.*,
                    COUNT(DISTINCT ab.id) as total_boletos,
                    COUNT(DISTINCT CASE WHEN ab.estado = 'vendido' THEN ab.id END) as boletos_vendidos,
                    COUNT(DISTINCT ef.figura_id) as total_figuras
                    FROM eventos e
                    LEFT JOIN asignacion_boletos ab ON e.id = ab.evento_id
                    LEFT JOIN evento_figuras ef ON e.id = ef.evento_id
                    WHERE 1=1";

            $params = [];

            if (!empty($filtros['estado'])) {
                $sql .= " AND e.estado = :estado";
                $params[':estado'] = $filtros['estado'];
            }

            if (!empty($filtros['fecha_desde'])) {
                $sql .= " AND e.fecha_evento >= :fecha_desde";
                $params[':fecha_desde'] = $filtros['fecha_desde'];
            }

            if (!empty($filtros['fecha_hasta'])) {
                $sql .= " AND e.fecha_evento <= :fecha_hasta";
                $params[':fecha_hasta'] = $filtros['fecha_hasta'];
            }

            $sql .= " GROUP BY e.id ORDER BY e.fecha_evento DESC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            logError('Error al obtener eventos: ' . $e->getMessage());
            throw new Exception('Error al obtener eventos');
        }
    }

    /**
     * Obtener evento por ID
     */
    public function obtenerPorId($id) {
        try {
            $sql = "SELECT e.*,
                    COUNT(DISTINCT ab.id) as total_boletos,
                    COUNT(DISTINCT CASE WHEN ab.estado = 'vendido' THEN ab.id END) as boletos_vendidos,
                    SUM(CASE WHEN ab.estado = 'vendido' THEN e.precio_boleto ELSE 0 END) as ingresos
                    FROM eventos e
                    LEFT JOIN asignacion_boletos ab ON e.id = ab.evento_id
                    WHERE e.id = :id
                    GROUP BY e.id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            $evento = $stmt->fetch();

            if (!$evento) {
                throw new Exception('Evento no encontrado');
            }

            // Obtener figuras asociadas
            $evento['figuras'] = $this->obtenerFiguras($id);

            return $evento;
        } catch (PDOException $e) {
            logError('Error al obtener evento: ' . $e->getMessage());
            throw new Exception('Error al obtener evento');
        }
    }

    /**
     * Actualizar evento
     */
    public function actualizar($id, $data) {
        // Validar que existe
        $this->obtenerPorId($id);

        // Validar datos
        $errors = $this->validar($data);
        if (!empty($errors)) {
            throw new Exception(implode(', ', $errors));
        }

        try {
            $sql = "UPDATE eventos
                    SET nombre = :nombre,
                        descripcion = :descripcion,
                        fecha_evento = :fecha_evento,
                        precio_boleto = :precio_boleto,
                        premio_total = :premio_total,
                        estado = :estado
                    WHERE id = :id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':nombre' => $data['nombre'],
                ':descripcion' => $data['descripcion'] ?? null,
                ':fecha_evento' => $data['fecha_evento'],
                ':precio_boleto' => $data['precio_boleto'],
                ':premio_total' => $data['premio_total'],
                ':estado' => $data['estado']
            ]);

            // Actualizar figuras si se enviaron
            if (isset($data['figuras'])) {
                $this->actualizarFiguras($id, $data['figuras']);
            }

            return $this->obtenerPorId($id);
        } catch (PDOException $e) {
            logError('Error al actualizar evento: ' . $e->getMessage());
            throw new Exception('Error al actualizar evento');
        }
    }

    /**
     * Cambiar estado del evento
     */
    public function cambiarEstado($id, $estado) {
        $estadosValidos = ['pendiente', 'activo', 'en_curso', 'finalizado', 'cancelado'];

        if (!in_array($estado, $estadosValidos)) {
            throw new Exception('Estado no válido');
        }

        try {
            $sql = "UPDATE eventos SET estado = :estado WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id, ':estado' => $estado]);

            return $this->obtenerPorId($id);
        } catch (PDOException $e) {
            logError('Error al cambiar estado: ' . $e->getMessage());
            throw new Exception('Error al cambiar estado');
        }
    }

    /**
     * Eliminar evento
     */
    public function eliminar($id) {
        // Verificar que no tenga boletos vendidos
        $evento = $this->obtenerPorId($id);

        if ($evento['boletos_vendidos'] > 0) {
            throw new Exception('No se puede eliminar un evento con boletos vendidos');
        }

        try {
            // Eliminar figuras asociadas
            $sql = "DELETE FROM evento_figuras WHERE evento_id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);

            // Eliminar evento
            $sql = "DELETE FROM eventos WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute([':id' => $id]);
        } catch (PDOException $e) {
            logError('Error al eliminar evento: ' . $e->getMessage());
            throw new Exception('Error al eliminar evento');
        }
    }

    /**
     * Asociar figuras al evento
     */
    private function asociarFiguras($eventoId, $figuras) {
        try {
            $sql = "INSERT INTO evento_figuras (evento_id, figura_id, premio, orden)
                    VALUES (:evento_id, :figura_id, :premio, :orden)";
            $stmt = $this->conn->prepare($sql);

            foreach ($figuras as $index => $figura) {
                $stmt->execute([
                    ':evento_id' => $eventoId,
                    ':figura_id' => $figura['figura_id'],
                    ':premio' => $figura['premio'] ?? 0,
                    ':orden' => $figura['orden'] ?? ($index + 1)
                ]);
            }
        } catch (PDOException $e) {
            logError('Error al asociar figuras: ' . $e->getMessage());
            throw new Exception('Error al asociar figuras');
        }
    }

    /**
     * Actualizar figuras del evento
     */
    private function actualizarFiguras($eventoId, $figuras) {
        try {
            // Eliminar figuras existentes
            $sql = "DELETE FROM evento_figuras WHERE evento_id = :evento_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':evento_id' => $eventoId]);

            // Insertar nuevas figuras
            if (!empty($figuras)) {
                $this->asociarFiguras($eventoId, $figuras);
            }
        } catch (PDOException $e) {
            logError('Error al actualizar figuras: ' . $e->getMessage());
            throw new Exception('Error al actualizar figuras');
        }
    }

    /**
     * Obtener figuras del evento
     */
    public function obtenerFiguras($eventoId) {
        try {
            $sql = "SELECT ef.*, f.nombre as figura_nombre, f.descripcion as figura_descripcion
                    FROM evento_figuras ef
                    INNER JOIN figuras f ON ef.figura_id = f.id
                    WHERE ef.evento_id = :evento_id
                    ORDER BY ef.orden ASC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':evento_id' => $eventoId]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            logError('Error al obtener figuras: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener estadísticas del evento
     */
    public function obtenerEstadisticas($id) {
        try {
            $sql = "SELECT
                    COUNT(DISTINCT ab.id) as total_boletos,
                    COUNT(DISTINCT CASE WHEN ab.estado = 'asignado' THEN ab.id END) as boletos_asignados,
                    COUNT(DISTINCT CASE WHEN ab.estado = 'vendido' THEN ab.id END) as boletos_vendidos,
                    COUNT(DISTINCT CASE WHEN ab.estado = 'devuelto' THEN ab.id END) as boletos_devueltos,
                    COUNT(DISTINCT ab.vendedor_id) as vendedores_activos,
                    SUM(CASE WHEN ab.estado = 'vendido' THEN e.precio_boleto ELSE 0 END) as ingresos_totales,
                    e.premio_total,
                    (SUM(CASE WHEN ab.estado = 'vendido' THEN e.precio_boleto ELSE 0 END) - e.premio_total) as ganancia_neta
                    FROM eventos e
                    LEFT JOIN asignacion_boletos ab ON e.id = ab.evento_id
                    WHERE e.id = :id
                    GROUP BY e.id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            logError('Error al obtener estadísticas: ' . $e->getMessage());
            throw new Exception('Error al obtener estadísticas');
        }
    }

    /**
     * Validar datos del evento
     */
    private function validar($data) {
        $errors = [];

        if (empty($data['nombre'])) {
            $errors[] = 'El nombre es requerido';
        }

        if (empty($data['fecha_evento'])) {
            $errors[] = 'La fecha del evento es requerida';
        }

        if (empty($data['precio_boleto']) || $data['precio_boleto'] <= 0) {
            $errors[] = 'El precio del boleto debe ser mayor a 0';
        }

        if (empty($data['premio_total']) || $data['premio_total'] <= 0) {
            $errors[] = 'El premio total debe ser mayor a 0';
        }

        return $errors;
    }
}
