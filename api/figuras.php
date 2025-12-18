<?php
/**
 * API REST - Figuras
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once MODELS_PATH . '/Figura.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$figura = new Figura();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Obtener una figura por ID
                $result = $figura->obtenerPorId($_GET['id']);
                jsonResponse(true, 'Figura encontrada', $result);
            } else {
                // Obtener todas las figuras
                $activo = isset($_GET['activo']) ? (int)$_GET['activo'] : null;
                $result = $figura->obtenerTodas($activo);
                jsonResponse(true, 'Figuras obtenidas', ['figuras' => $result]);
            }
            break;

        case 'POST':
            // Crear nueva figura
            $input = json_decode(file_get_contents('php://input'), true);
            $result = $figura->crear($input);
            jsonResponse(true, 'Figura creada exitosamente', $result);
            break;

        case 'PUT':
        case 'PATCH':
            // Actualizar figura
            if (!isset($_GET['id'])) {
                throw new Exception('ID de la figura es requerido');
            }

            $input = json_decode(file_get_contents('php://input'), true);

            if (isset($input['activo']) && count($input) == 1) {
                // Solo cambiar estado
                $result = $figura->cambiarEstado($_GET['id'], $input['activo']);
                jsonResponse(true, 'Estado actualizado', $result);
            } else {
                // Actualizar completo
                $result = $figura->actualizar($_GET['id'], $input);
                jsonResponse(true, 'Figura actualizada exitosamente', $result);
            }
            break;

        case 'DELETE':
            // Eliminar figura
            if (!isset($_GET['id'])) {
                throw new Exception('ID de la figura es requerido');
            }

            $figura->eliminar($_GET['id']);
            jsonResponse(true, 'Figura eliminada exitosamente');
            break;

        default:
            http_response_code(405);
            jsonResponse(false, 'Método no permitido');
    }
} catch (Exception $e) {
    http_response_code(400);
    jsonResponse(false, $e->getMessage());
}
