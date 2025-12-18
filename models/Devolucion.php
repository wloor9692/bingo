<?php
/**
 * Modelo Devolucion
 * Gestión de devoluciones de boletos no vendidos
 */

class Devolucion {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Registrar devolución
     */
    public function registrar($data) {
        $errors = $this->validar($data);
        if (!empty($errors)) {
            throw new Exception(implode(', ', $errors));
        }

        try {
            $this->conn->beginTransaction();

            // Usar stored procedure para registrar devolución
            $sql = "CALL sp_registrar_devolucion(:codigo_hoja, :recibido_por)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':codigo_hoja' => $data['codigo_hoja'],
                ':recibido_por' => $data['recibido_por'] ?? 1
            ]);

            $this->conn->commit();

            // Obtener la devolución registrada
            return $this->obtenerPorCodigoHoja($data['codigo_hoja']);
        } catch (PDOException $e) {
            $this->conn->rollBack();
            logError('Error al registrar devolución: ' . $e->getMessage());
            throw new Exception('Error al registrar devolución: ' . $e->getMessage());
        }
    }

    /**
     * Obtener todas las devoluciones
     */
    public function obtenerTodas($filtros = []) {
        try {
            $sql = "SELECT d.*,
                    ab.codigo_hoja,
                    v.nombre_completo as vendedor_nombre,
                    v.codigo as vendedor_codigo,
                    e.nombre as evento_nombre,
                    e.fecha_evento
                    FROM devoluciones d
                    INNER JOIN asignacion_boletos ab ON d.asignacion_id = ab.id
                    INNER JOIN vendedores v ON ab.vendedor_id = v.id
                    INNER JOIN eventos e ON ab.evento_id = e.id
                    WHERE 1=1";

            $params = [];

            if (!empty($filtros['vendedor_id'])) {
                $sql .= " AND ab.vendedor_id = :vendedor_id";
                $params[':vendedor_id'] = $filtros['vendedor_id'];
            }

            if (!empty($filtros['evento_id'])) {
                $sql .= " AND ab.evento_id = :evento_id";
                $params[':evento_id'] = $filtros['evento_id'];
            }

            if (!empty($filtros['fecha_desde'])) {
                $sql .= " AND d.fecha_devolucion >= :fecha_desde";
                $params[':fecha_desde'] = $filtros['fecha_desde'];
            }

            if (!empty($filtros['fecha_hasta'])) {
                $sql .= " AND d.fecha_devolucion <= :fecha_hasta";
                $params[':fecha_hasta'] = $filtros['fecha_hasta'];
            }

            $sql .= " ORDER BY d.fecha_devolucion DESC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            logError('Error al obtener devoluciones: ' . $e->getMessage());
            throw new Exception('Error al obtener devoluciones');
        }
    }

    /**
     * Obtener devolución por ID
     */
    public function obtenerPorId($id) {
        try {
            $sql = "SELECT d.*,
                    ab.codigo_hoja,
                    ab.vendedor_id,
                    ab.evento_id,
                    v.nombre_completo as vendedor_nombre,
                    e.nombre as evento_nombre,
                    e.precio_boleto
                    FROM devoluciones d
                    INNER JOIN asignacion_boletos ab ON d.asignacion_id = ab.id
                    INNER JOIN vendedores v ON ab.vendedor_id = v.id
                    INNER JOIN eventos e ON ab.evento_id = e.id
                    WHERE d.id = :id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            $devolucion = $stmt->fetch();

            if (!$devolucion) {
                throw new Exception('Devolución no encontrada');
            }

            return $devolucion;
        } catch (PDOException $e) {
            logError('Error al obtener devolución: ' . $e->getMessage());
            throw new Exception('Error al obtener devolución');
        }
    }

    /**
     * Obtener devolución por código de hoja
     */
    public function obtenerPorCodigoHoja($codigoHoja) {
        try {
            $sql = "SELECT d.*
                    FROM devoluciones d
                    INNER JOIN asignacion_boletos ab ON d.asignacion_id = ab.id
                    WHERE ab.codigo_hoja = :codigo_hoja";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':codigo_hoja' => $codigoHoja]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            logError('Error al obtener devolución: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Verificar si una hoja puede ser devuelta
     */
    public function puedeDevolver($codigoHoja) {
        try {
            // Obtener información de la hoja
            $sql = "SELECT ab.*, e.estado as estado_evento,
                    COUNT(bd.id) as total_boletos,
                    SUM(CASE WHEN bd.vendido = 1 THEN 1 ELSE 0 END) as boletos_vendidos
                    FROM asignacion_boletos ab
                    INNER JOIN eventos e ON ab.evento_id = e.id
                    LEFT JOIN boletos_detalle bd ON ab.id = bd.asignacion_id
                    WHERE ab.codigo_hoja = :codigo_hoja
                    GROUP BY ab.id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':codigo_hoja' => $codigoHoja]);
            $hoja = $stmt->fetch();

            if (!$hoja) {
                return ['puede' => false, 'razon' => 'Hoja no encontrada'];
            }

            // Verificar si ya fue devuelta
            if ($hoja['estado'] == 'devuelto') {
                return ['puede' => false, 'razon' => 'Esta hoja ya fue devuelta'];
            }

            // Verificar si todos los boletos están vendidos
            if ($hoja['total_boletos'] == $hoja['boletos_vendidos']) {
                return ['puede' => false, 'razon' => 'Todos los boletos de esta hoja están vendidos'];
            }

            // Verificar estado del evento
            if ($hoja['estado_evento'] == 'finalizado' || $hoja['estado_evento'] == 'en_curso') {
                return ['puede' => false, 'razon' => 'El evento ya finalizó o está en curso'];
            }

            return [
                'puede' => true,
                'hoja' => $hoja,
                'boletos_vendidos' => $hoja['boletos_vendidos'],
                'boletos_devueltos' => $hoja['total_boletos'] - $hoja['boletos_vendidos']
            ];
        } catch (PDOException $e) {
            logError('Error al verificar devolución: ' . $e->getMessage());
            return ['puede' => false, 'razon' => 'Error al verificar'];
        }
    }

    /**
     * Obtener estadísticas de devoluciones
     */
    public function obtenerEstadisticas($filtros = []) {
        try {
            $sql = "SELECT
                    COUNT(DISTINCT d.id) as total_devoluciones,
                    SUM(d.boletos_devueltos) as total_boletos_devueltos,
                    SUM(d.boletos_vendidos) as total_boletos_vendidos,
                    COUNT(DISTINCT ab.vendedor_id) as vendedores_devolvieron
                    FROM devoluciones d
                    INNER JOIN asignacion_boletos ab ON d.asignacion_id = ab.id
                    WHERE 1=1";

            $params = [];

            if (!empty($filtros['evento_id'])) {
                $sql .= " AND ab.evento_id = :evento_id";
                $params[':evento_id'] = $filtros['evento_id'];
            }

            if (!empty($filtros['fecha_desde'])) {
                $sql .= " AND d.fecha_devolucion >= :fecha_desde";
                $params[':fecha_desde'] = $filtros['fecha_desde'];
            }

            if (!empty($filtros['fecha_hasta'])) {
                $sql .= " AND d.fecha_devolucion <= :fecha_hasta";
                $params[':fecha_hasta'] = $filtros['fecha_hasta'];
            }

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetch();
        } catch (PDOException $e) {
            logError('Error al obtener estadísticas: ' . $e->getMessage());
            throw new Exception('Error al obtener estadísticas');
        }
    }

    /**
     * Validar datos
     */
    private function validar($data) {
        $errors = [];

        if (empty($data['codigo_hoja'])) {
            $errors[] = 'El código de hoja es requerido';
        }

        return $errors;
    }
}
