<?php
/**
 * Modelo Juego
 * Gestión del juego de BINGO en tiempo real
 */

class Juego {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = Database::getInstance();
        $this->conn = $this->db->getConnection();
    }

    /**
     * Iniciar sesión de juego
     */
    public function iniciarSesion($eventoId, $iniciadoPor) {
        try {
            // Verificar que el evento existe y está activo
            $sql = "SELECT * FROM eventos WHERE id = :id AND estado = 'activo'";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $eventoId]);
            $evento = $stmt->fetch();

            if (!$evento) {
                throw new Exception('Evento no encontrado o no está activo');
            }

            // Verificar que no haya una sesión activa para este evento
            $sql = "SELECT * FROM juego_sesiones WHERE evento_id = :evento_id AND estado = 'en_curso'";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':evento_id' => $eventoId]);
            $sesionActiva = $stmt->fetch();

            if ($sesionActiva) {
                throw new Exception('Ya existe una sesión activa para este evento');
            }

            $this->conn->beginTransaction();

            // Crear sesión
            $sql = "INSERT INTO juego_sesiones (evento_id, iniciado_por, estado)
                    VALUES (:evento_id, :iniciado_por, 'en_curso')";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':evento_id' => $eventoId,
                ':iniciado_por' => $iniciadoPor
            ]);

            $sesionId = $this->conn->lastInsertId();

            // Cambiar estado del evento
            $sql = "UPDATE eventos SET estado = 'en_curso' WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $eventoId]);

            $this->conn->commit();

            return $this->obtenerSesion($sesionId);
        } catch (PDOException $e) {
            $this->conn->rollBack();
            logError('Error al iniciar sesión: ' . $e->getMessage());
            throw new Exception('Error al iniciar sesión');
        }
    }

    /**
     * Cantar bolilla (número)
     */
    public function cantarBolilla($sesionId, $numero) {
        try {
            // Verificar que la sesión existe y está en curso
            $sesion = $this->obtenerSesion($sesionId);

            if ($sesion['estado'] != 'en_curso') {
                throw new Exception('La sesión no está activa');
            }

            // Validar número (1-90 para BINGO)
            if ($numero < 1 || $numero > BOLILLAS_TOTAL) {
                throw new Exception('Número inválido. Debe estar entre 1 y ' . BOLILLAS_TOTAL);
            }

            // Verificar que no se haya cantado antes
            $sql = "SELECT * FROM bolillas_cantadas WHERE sesion_id = :sesion_id AND numero = :numero";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':sesion_id' => $sesionId, ':numero' => $numero]);

            if ($stmt->fetch()) {
                throw new Exception('Este número ya fue cantado');
            }

            // Registrar bolilla cantada
            $sql = "INSERT INTO bolillas_cantadas (sesion_id, numero, orden)
                    SELECT :sesion_id, :numero, COALESCE(MAX(orden), 0) + 1
                    FROM bolillas_cantadas WHERE sesion_id = :sesion_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':sesion_id' => $sesionId,
                ':numero' => $numero
            ]);

            return $this->obtenerBolasCantadas($sesionId);
        } catch (PDOException $e) {
            logError('Error al cantar bolilla: ' . $e->getMessage());
            throw new Exception('Error al cantar bolilla');
        }
    }

    /**
     * Validar ganador
     */
    public function validarGanador($sesionId, $codigoQR, $figuraId) {
        try {
            $this->conn->beginTransaction();

            // Obtener sesión
            $sesion = $this->obtenerSesion($sesionId);

            if ($sesion['estado'] != 'en_curso') {
                throw new Exception('La sesión no está activa');
            }

            // Verificar que la figura está en el evento
            $sql = "SELECT ef.*, f.patron_json, f.nombre as figura_nombre
                    FROM evento_figuras ef
                    INNER JOIN figuras f ON ef.figura_id = f.id
                    WHERE ef.evento_id = :evento_id AND ef.figura_id = :figura_id AND ef.ganado = 0";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':evento_id' => $sesion['evento_id'],
                ':figura_id' => $figuraId
            ]);
            $eventoFigura = $stmt->fetch();

            if (!$eventoFigura) {
                throw new Exception('Figura no encontrada en este evento o ya fue ganada');
            }

            // Buscar el boleto
            $sql = "SELECT bd.*, ab.evento_id
                    FROM boletos_detalle bd
                    INNER JOIN asignacion_boletos ab ON bd.asignacion_id = ab.id
                    WHERE bd.codigo_qr = :codigo AND bd.vendido = 1 AND ab.evento_id = :evento_id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':codigo' => $codigoQR,
                ':evento_id' => $sesion['evento_id']
            ]);
            $boleto = $stmt->fetch();

            if (!$boleto) {
                throw new Exception('Boleto no encontrado, no vendido o no pertenece a este evento');
            }

            // Obtener bolas cantadas
            $bolasCantadas = $this->obtenerBolasCantadas($sesionId);
            $numerosBolasCantadas = array_column($bolasCantadas, 'numero');

            // Validar el patrón
            require_once MODELS_PATH . '/Figura.php';
            $figuraModel = new Figura();

            $esGanador = $figuraModel->validarPatron(
                $boleto['numeros_json'],
                $numerosBolasCantadas,
                $eventoFigura['patron_json']
            );

            if (!$esGanador) {
                $this->conn->rollBack();
                return [
                    'ganador' => false,
                    'mensaje' => 'El boleto no cumple con el patrón de la figura'
                ];
            }

            // Registrar ganador
            $sql = "INSERT INTO ganadores_bingo
                    (sesion_id, boleto_id, figura_id, premio, validado_por)
                    VALUES (:sesion_id, :boleto_id, :figura_id, :premio, :validado_por)";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([
                ':sesion_id' => $sesionId,
                ':boleto_id' => $boleto['id'],
                ':figura_id' => $figuraId,
                ':premio' => $eventoFigura['premio'],
                ':validado_por' => 1 // TODO: obtener usuario actual
            ]);

            // Marcar figura como ganada
            $sql = "UPDATE evento_figuras SET ganado = 1 WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $eventoFigura['id']]);

            $this->conn->commit();

            return [
                'ganador' => true,
                'mensaje' => '¡BINGO! Ganador validado',
                'figura' => $eventoFigura['figura_nombre'],
                'premio' => $eventoFigura['premio'],
                'boleto' => $boleto
            ];
        } catch (PDOException $e) {
            $this->conn->rollBack();
            logError('Error al validar ganador: ' . $e->getMessage());
            throw new Exception('Error al validar ganador');
        }
    }

    /**
     * Finalizar sesión
     */
    public function finalizarSesion($sesionId) {
        try {
            $this->conn->beginTransaction();

            $sesion = $this->obtenerSesion($sesionId);

            // Actualizar sesión
            $sql = "UPDATE juego_sesiones
                    SET estado = 'finalizado',
                        fecha_fin = NOW()
                    WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $sesionId]);

            // Actualizar evento
            $sql = "UPDATE eventos SET estado = 'finalizado' WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $sesion['evento_id']]);

            $this->conn->commit();

            return $this->obtenerSesion($sesionId);
        } catch (PDOException $e) {
            $this->conn->rollBack();
            logError('Error al finalizar sesión: ' . $e->getMessage());
            throw new Exception('Error al finalizar sesión');
        }
    }

    /**
     * Obtener sesión
     */
    public function obtenerSesion($id) {
        try {
            $sql = "SELECT js.*,
                    e.nombre as evento_nombre,
                    e.fecha_evento,
                    COUNT(DISTINCT bc.id) as total_bolas_cantadas,
                    COUNT(DISTINCT gb.id) as total_ganadores
                    FROM juego_sesiones js
                    INNER JOIN eventos e ON js.evento_id = e.id
                    LEFT JOIN bolillas_cantadas bc ON js.id = bc.sesion_id
                    LEFT JOIN ganadores_bingo gb ON js.id = gb.sesion_id
                    WHERE js.id = :id
                    GROUP BY js.id";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':id' => $id]);
            $sesion = $stmt->fetch();

            if (!$sesion) {
                throw new Exception('Sesión no encontrada');
            }

            return $sesion;
        } catch (PDOException $e) {
            logError('Error al obtener sesión: ' . $e->getMessage());
            throw new Exception('Error al obtener sesión');
        }
    }

    /**
     * Obtener sesión activa de un evento
     */
    public function obtenerSesionActiva($eventoId) {
        try {
            $sql = "SELECT * FROM juego_sesiones
                    WHERE evento_id = :evento_id AND estado = 'en_curso'
                    ORDER BY fecha_inicio DESC LIMIT 1";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':evento_id' => $eventoId]);
            return $stmt->fetch();
        } catch (PDOException $e) {
            logError('Error al obtener sesión activa: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Obtener bolas cantadas
     */
    public function obtenerBolasCantadas($sesionId) {
        try {
            $sql = "SELECT * FROM bolillas_cantadas
                    WHERE sesion_id = :sesion_id
                    ORDER BY orden ASC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':sesion_id' => $sesionId]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            logError('Error al obtener bolas cantadas: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener ganadores de una sesión
     */
    public function obtenerGanadores($sesionId) {
        try {
            $sql = "SELECT gb.*,
                    f.nombre as figura_nombre,
                    bd.codigo_qr,
                    bd.comprador_nombre,
                    ab.vendedor_id,
                    v.nombre_completo as vendedor_nombre
                    FROM ganadores_bingo gb
                    INNER JOIN figuras f ON gb.figura_id = f.id
                    INNER JOIN boletos_detalle bd ON gb.boleto_id = bd.id
                    INNER JOIN asignacion_boletos ab ON bd.asignacion_id = ab.id
                    INNER JOIN vendedores v ON ab.vendedor_id = v.id
                    WHERE gb.sesion_id = :sesion_id
                    ORDER BY gb.fecha_ganador ASC";

            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':sesion_id' => $sesionId]);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            logError('Error al obtener ganadores: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Obtener estado completo del juego
     */
    public function obtenerEstadoJuego($sesionId) {
        try {
            $sesion = $this->obtenerSesion($sesionId);
            $bolasCantadas = $this->obtenerBolasCantadas($sesionId);
            $ganadores = $this->obtenerGanadores($sesionId);

            // Obtener figuras del evento
            $sql = "SELECT ef.*, f.nombre as figura_nombre
                    FROM evento_figuras ef
                    INNER JOIN figuras f ON ef.figura_id = f.id
                    WHERE ef.evento_id = :evento_id
                    ORDER BY ef.orden ASC";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute([':evento_id' => $sesion['evento_id']]);
            $figuras = $stmt->fetchAll();

            return [
                'sesion' => $sesion,
                'bolas_cantadas' => $bolasCantadas,
                'ganadores' => $ganadores,
                'figuras' => $figuras,
                'ultima_bola' => !empty($bolasCantadas) ? end($bolasCantadas)['numero'] : null
            ];
        } catch (Exception $e) {
            logError('Error al obtener estado: ' . $e->getMessage());
            throw new Exception('Error al obtener estado del juego');
        }
    }
}
