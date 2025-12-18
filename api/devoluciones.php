<?php
/**
 * API REST - Devoluciones
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once MODELS_PATH . '/Devolucion.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$devolucion = new Devolucion();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Obtener devolución por ID
                $result = $devolucion->obtenerPorId($_GET['id']);
                jsonResponse(true, 'Devolución encontrada', $result);
            } elseif (isset($_GET['verificar'])) {
                // Verificar si una hoja puede ser devuelta
                $result = $devolucion->puedeDevolver($_GET['verificar']);
                jsonResponse(true, 'Verificación completada', $result);
            } elseif (isset($_GET['estadisticas'])) {
                // Obtener estadísticas
                $filtros = [
                    'evento_id' => $_GET['evento_id'] ?? null,
                    'fecha_desde' => $_GET['fecha_desde'] ?? null,
                    'fecha_hasta' => $_GET['fecha_hasta'] ?? null
                ];
                $result = $devolucion->obtenerEstadisticas($filtros);
                jsonResponse(true, 'Estadísticas obtenidas', $result);
            } else {
                // Obtener todas las devoluciones con filtros
                $filtros = [
                    'vendedor_id' => $_GET['vendedor_id'] ?? null,
                    'evento_id' => $_GET['evento_id'] ?? null,
                    'fecha_desde' => $_GET['fecha_desde'] ?? null,
                    'fecha_hasta' => $_GET['fecha_hasta'] ?? null
                ];
                $result = $devolucion->obtenerTodas($filtros);
                jsonResponse(true, 'Devoluciones obtenidas', ['devoluciones' => $result]);
            }
            break;

        case 'POST':
            // Registrar nueva devolución
            $input = json_decode(file_get_contents('php://input'), true);
            $result = $devolucion->registrar($input);
            jsonResponse(true, 'Devolución registrada exitosamente', $result);
            break;

        default:
            http_response_code(405);
            jsonResponse(false, 'Método no permitido');
    }
} catch (Exception $e) {
    http_response_code(400);
    jsonResponse(false, $e->getMessage());
}
