<?php
/**
 * Modelo Asignacion
 * Gestión de asignación de boletos a vendedores
 */

class Asignacion {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Crear nueva asignación
     */
    public function crear($data) {
        $errors = $this->validar($data);
        if (!empty($errors)) {
            throw new Exception(implode(', ', $errors));
        }

        try {
            $this->conn->beginTransaction();

            // Generar boletos usando el stored procedure
            $sql = "CALL sp_generar_boletos(:evento_id, :vendedor_id, :cantidad_hojas, :asignado_por)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':evento_id' => $data['evento_id'],
                ':vendedor_id' => $data['vendedor_id'],
                ':cantidad_hojas' => $data['cantidad_hojas'],
                ':asignado_por' => $data['asignado_por'] ?? 1
            ]);

            $this->conn->commit();

            // Obtener las asignaciones creadas
            return $this->obtenerPorVendedorEvento($data['vendedor_id'], $data['evento_id']);
        } catch (PDOException $e) {
            $this->conn->rollBack();
            logError('Error al crear asignación: ' . $e->getMessage());
            throw new Exception('Error al crear asignación: ' . $e->getMessage());
        }
    }

    /**
     * Obtener todas las asignaciones
     */
    public function obtenerTodas($filtros = []) {
        try {
            $sql = "SELECT ab.*,
                    v.nombre_completo as vendedor_nombre,
                    v.codigo as vendedor_codigo,
                    e.nombre as evento_nombre,
                    e.fecha_evento,
                    e.precio_boleto,
                    COUNT(bd.id) as total_boletos_hoja
                    FROM asignacion_boletos ab
                    INNER JOIN vendedores v ON ab.vendedor_id = v.id
                    INNER JOIN eventos e ON ab.evento_id = e.id
                    LEFT JOIN boletos_detalle bd ON ab.id = bd.asignacion_id
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

            if (!empty($filtros['estado'])) {
                $sql .= " AND ab.estado = :estado";
                $params[':estado'] = $filtros['estado'];
            }

            $sql .= " GROUP BY ab.id ORDER BY ab.created_at DESC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            logError('Error al obtener asignaciones: ' . $e->getMessage());
            throw new Exception('Error al obtener asignaciones');
        }
    }

    /**
     * Obtener asignación por ID
     */
    public function obtenerPorId($id) {
        try {
            $sql = "SELECT ab.*,
                    v.nombre_completo as vendedor_nombre,
                    v.codigo as vendedor_codigo,
                    e.nombre as evento_nombre,
                    e.fecha_evento,
                    e.precio_boleto
                    FROM asignacion_boletos ab
                    INNER JOIN vendedores v ON ab.vendedor_id = v.id
                    INNER JOIN eventos e ON ab.evento_id = e.id
                    WHERE ab.id = :id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            $asignacion = $stmt->fetch();

            if (!$asignacion) {
                throw new Exception('Asignación no encontrada');
            }

            // Obtener boletos detalle de esta hoja
            $asignacion['boletos'] = $this->obtenerBoletosHoja($id);

            return $asignacion;
        } catch (PDOException $e) {
            logError('Error al obtener asignación: ' . $e->getMessage());
            throw new Exception('Error al obtener asignación');
        }
    }

    /**
     * Obtener boletos de una hoja
     */
    public function obtenerBoletosHoja($asignacionId) {
        try {
            $sql = "SELECT * FROM boletos_detalle
                    WHERE asignacion_id = :asignacion_id
                    ORDER BY numero_boleto_hoja ASC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':asignacion_id' => $asignacionId]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            logError('Error al obtener boletos: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener asignaciones por vendedor y evento
     */
    public function obtenerPorVendedorEvento($vendedorId, $eventoId) {
        return $this->obtenerTodas([
            'vendedor_id' => $vendedorId,
            'evento_id' => $eventoId
        ]);
    }

    /**
     * Marcar boleto como vendido
     */
    public function marcarVendido($codigo, $compradorData = null) {
        try {
            $this->conn->beginTransaction();

            // Buscar el boleto individual
            $sql = "SELECT bd.*, ab.evento_id, ab.vendedor_id
                    FROM boletos_detalle bd
                    INNER JOIN asignacion_boletos ab ON bd.asignacion_id = ab.id
                    WHERE bd.codigo_qr = :codigo";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':codigo' => $codigo]);
            $boleto = $stmt->fetch();

            if (!$boleto) {
                throw new Exception('Boleto no encontrado');
            }

            if ($boleto['vendido'] == 1) {
                throw new Exception('Este boleto ya fue vendido');
            }

            // Marcar boleto como vendido
            $sql = "UPDATE boletos_detalle
                    SET vendido = 1,
                        comprador_nombre = :comprador_nombre,
                        comprador_telefono = :comprador_telefono,
                        fecha_venta = NOW()
                    WHERE id = :id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':id' => $boleto['id'],
                ':comprador_nombre' => $compradorData['nombre'] ?? null,
                ':comprador_telefono' => $compradorData['telefono'] ?? null
            ]);

            // Verificar si todos los boletos de la hoja están vendidos
            $sql = "SELECT COUNT(*) as total, SUM(vendido) as vendidos
                    FROM boletos_detalle
                    WHERE asignacion_id = :asignacion_id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':asignacion_id' => $boleto['asignacion_id']]);
            $stats = $stmt->fetch();

            // Si todos están vendidos, actualizar estado de la hoja
            if ($stats['total'] == $stats['vendidos']) {
                $sql = "UPDATE asignacion_boletos
                        SET estado = 'vendido'
                        WHERE id = :id";
                $stmt = $this->conn->prepare($sql);
                $stmt->execute([':id' => $boleto['asignacion_id']]);
            }

            $this->conn->commit();

            return $this->obtenerBoletoDetalle($boleto['id']);
        } catch (PDOException $e) {
            $this->conn->rollBack();
            logError('Error al marcar vendido: ' . $e->getMessage());
            throw new Exception('Error al marcar vendido');
        }
    }

    /**
     * Obtener detalle de un boleto individual
     */
    public function obtenerBoletoDetalle($id) {
        try {
            $sql = "SELECT bd.*,
                    ab.vendedor_id,
                    ab.evento_id,
                    v.nombre_completo as vendedor_nombre,
                    e.nombre as evento_nombre,
                    e.precio_boleto
                    FROM boletos_detalle bd
                    INNER JOIN asignacion_boletos ab ON bd.asignacion_id = ab.id
                    INNER JOIN vendedores v ON ab.vendedor_id = v.id
                    INNER JOIN eventos e ON ab.evento_id = e.id
                    WHERE bd.id = :id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            logError('Error al obtener detalle: ' . $e->getMessage());
            throw new Exception('Error al obtener detalle');
        }
    }

    /**
     * Buscar boleto por código QR
     */
    public function buscarPorCodigoQR($codigo) {
        try {
            $sql = "SELECT bd.*,
                    ab.vendedor_id,
                    ab.evento_id,
                    ab.codigo_hoja,
                    v.nombre_completo as vendedor_nombre,
                    e.nombre as evento_nombre,
                    e.precio_boleto,
                    e.fecha_evento
                    FROM boletos_detalle bd
                    INNER JOIN asignacion_boletos ab ON bd.asignacion_id = ab.id
                    INNER JOIN vendedores v ON ab.vendedor_id = v.id
                    INNER JOIN eventos e ON ab.evento_id = e.id
                    WHERE bd.codigo_qr = :codigo OR ab.codigo_hoja = :codigo";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':codigo' => $codigo]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            logError('Error al buscar boleto: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener estadísticas de asignaciones
     */
    public function obtenerEstadisticas($filtros = []) {
        try {
            $sql = "SELECT
                    COUNT(DISTINCT ab.id) as total_hojas,
                    COUNT(DISTINCT bd.id) as total_boletos,
                    SUM(CASE WHEN bd.vendido = 1 THEN 1 ELSE 0 END) as boletos_vendidos,
                    SUM(CASE WHEN bd.vendido = 0 THEN 1 ELSE 0 END) as boletos_disponibles,
                    SUM(CASE WHEN bd.vendido = 1 THEN e.precio_boleto ELSE 0 END) as ingresos_totales
                    FROM asignacion_boletos ab
                    INNER JOIN boletos_detalle bd ON ab.id = bd.asignacion_id
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

        if (empty($data['evento_id'])) {
            $errors[] = 'El evento es requerido';
        }

        if (empty($data['vendedor_id'])) {
            $errors[] = 'El vendedor es requerido';
        }

        if (empty($data['cantidad_hojas']) || $data['cantidad_hojas'] <= 0) {
            $errors[] = 'La cantidad de hojas debe ser mayor a 0';
        }

        return $errors;
    }
}
