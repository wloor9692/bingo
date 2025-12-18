<?php
/**
 * API REST - Eventos
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once MODELS_PATH . '/Evento.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$evento = new Evento();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Obtener un evento por ID
                $result = $evento->obtenerPorId($_GET['id']);
                jsonResponse(true, 'Evento encontrado', $result);
            } elseif (isset($_GET['estadisticas']) && isset($_GET['evento_id'])) {
                // Obtener estadísticas de un evento
                $result = $evento->obtenerEstadisticas($_GET['evento_id']);
                jsonResponse(true, 'Estadísticas obtenidas', $result);
            } elseif (isset($_GET['figuras']) && isset($_GET['evento_id'])) {
                // Obtener figuras de un evento
                $result = $evento->obtenerFiguras($_GET['evento_id']);
                jsonResponse(true, 'Figuras obtenidas', $result);
            } else {
                // Obtener todos con filtros
                $filtros = [
                    'estado' => $_GET['estado'] ?? null,
                    'fecha_desde' => $_GET['fecha_desde'] ?? null,
                    'fecha_hasta' => $_GET['fecha_hasta'] ?? null
                ];
                $result = $evento->obtenerTodos($filtros);
                jsonResponse(true, 'Eventos obtenidos', ['eventos' => $result]);
            }
            break;

        case 'POST':
            // Crear nuevo evento
            $input = json_decode(file_get_contents('php://input'), true);
            $result = $evento->crear($input);
            jsonResponse(true, 'Evento creado exitosamente', $result);
            break;

        case 'PUT':
        case 'PATCH':
            // Actualizar evento
            if (!isset($_GET['id'])) {
                throw new Exception('ID del evento es requerido');
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (isset($input['estado']) && !isset($input['nombre'])) {
                // Solo cambiar estado
                $result = $evento->cambiarEstado($_GET['id'], $input['estado']);
                jsonResponse(true, 'Estado actualizado', $result);
            } else {
                // Actualizar completo
                $result = $evento->actualizar($_GET['id'], $input);
                jsonResponse(true, 'Evento actualizado exitosamente', $result);
            }
            break;

        case 'DELETE':
            // Eliminar evento
            if (!isset($_GET['id'])) {
                throw new Exception('ID del evento es requerido');
            }

            $evento->eliminar($_GET['id']);
            jsonResponse(true, 'Evento eliminado exitosamente');
            break;

        default:
            http_response_code(405);
            jsonResponse(false, 'Método no permitido');
    }
} catch (Exception $e) {
    http_response_code(400);
    jsonResponse(false, $e->getMessage());
}
