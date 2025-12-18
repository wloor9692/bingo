<?php
/**
 * API REST - Juego de BINGO
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once MODELS_PATH . '/Juego.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$juego = new Juego();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['sesion_id'])) {
                // Obtener información completa de la sesión
                $result = $juego->obtenerSesion($_GET['sesion_id']);
                jsonResponse(true, 'Sesión encontrada', $result);
            } elseif (isset($_GET['estado']) && isset($_GET['sesion_id'])) {
                // Obtener estado completo del juego (para actualizaciones en tiempo real)
                $result = $juego->obtenerEstadoJuego($_GET['sesion_id']);
                jsonResponse(true, 'Estado del juego obtenido', $result);
            } elseif (isset($_GET['bolas']) && isset($_GET['sesion_id'])) {
                // Obtener bolas cantadas
                $result = $juego->obtenerBolasCantadas($_GET['sesion_id']);
                jsonResponse(true, 'Bolas cantadas obtenidas', $result);
            } elseif (isset($_GET['ganadores']) && isset($_GET['sesion_id'])) {
                // Obtener ganadores
                $result = $juego->obtenerGanadores($_GET['sesion_id']);
                jsonResponse(true, 'Ganadores obtenidos', $result);
            } elseif (isset($_GET['sesion_activa']) && isset($_GET['evento_id'])) {
                // Obtener sesión activa de un evento
                $result = $juego->obtenerSesionActiva($_GET['evento_id']);
                if ($result) {
                    jsonResponse(true, 'Sesión activa encontrada', $result);
                } else {
                    jsonResponse(false, 'No hay sesión activa');
                }
            } else {
                throw new Exception('Parámetros insuficientes');
            }
            break;

        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);

            if (isset($input['accion'])) {
                switch ($input['accion']) {
                    case 'iniciar':
                        // Iniciar nueva sesión de juego
                        if (!isset($input['evento_id'])) {
                            throw new Exception('evento_id es requerido');
                        }
                        $result = $juego->iniciarSesion(
                            $input['evento_id'],
                            $input['iniciado_por'] ?? 1
                        );
                        jsonResponse(true, 'Sesión de juego iniciada', $result);
                        break;

                    case 'cantar':
                        // Cantar una bolilla/número
                        if (!isset($input['sesion_id']) || !isset($input['numero'])) {
                            throw new Exception('sesion_id y numero son requeridos');
                        }
                        $result = $juego->cantarBolilla(
                            $input['sesion_id'],
                            $input['numero']
                        );
                        jsonResponse(true, 'Bolilla cantada: ' . $input['numero'], $result);
                        break;

                    case 'validar':
                        // Validar ganador
                        if (!isset($input['sesion_id']) || !isset($input['codigo_qr']) || !isset($input['figura_id'])) {
                            throw new Exception('sesion_id, codigo_qr y figura_id son requeridos');
                        }
                        $result = $juego->validarGanador(
                            $input['sesion_id'],
                            $input['codigo_qr'],
                            $input['figura_id']
                        );
                        jsonResponse($result['ganador'], $result['mensaje'], $result);
                        break;

                    case 'finalizar':
                        // Finalizar sesión
                        if (!isset($input['sesion_id'])) {
                            throw new Exception('sesion_id es requerido');
                        }
                        $result = $juego->finalizarSesion($input['sesion_id']);
                        jsonResponse(true, 'Sesión finalizada', $result);
                        break;

                    default:
                        throw new Exception('Acción no válida');
                }
            } else {
                throw new Exception('Acción es requerida');
            }
            break;

        case 'PUT':
            // Finalizar sesión (alternativa a POST con accion=finalizar)
            if (!isset($_GET['sesion_id'])) {
                throw new Exception('sesion_id es requerido');
            }
            $result = $juego->finalizarSesion($_GET['sesion_id']);
            jsonResponse(true, 'Sesión finalizada', $result);
            break;

        default:
            http_response_code(405);
            jsonResponse(false, 'Método no permitido');
    }
} catch (Exception $e) {
    http_response_code(400);
    jsonResponse(false, $e->getMessage());
}
