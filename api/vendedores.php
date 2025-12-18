<?php
/**
 * API REST - Vendedores
 * Gestión completa de vendedores
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Vendedor.php';

// Manejar OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Instanciar modelo
$vendedor = new Vendedor();

// Obtener método HTTP
$method = $_SERVER['REQUEST_METHOD'];

// Obtener datos del body (para POST, PUT, PATCH)
$input = json_decode(file_get_contents('php://input'), true);

try {
    switch ($method) {
        case 'GET':
            // Obtener vendedores
            if (isset($_GET['id'])) {
                // Obtener por ID
                $result = $vendedor->obtenerPorId($_GET['id']);

                if ($result) {
                    jsonResponse(true, 'Vendedor encontrado', $result);
                } else {
                    http_response_code(404);
                    jsonResponse(false, 'Vendedor no encontrado');
                }

            } elseif (isset($_GET['codigo'])) {
                // Obtener por código
                $result = $vendedor->obtenerPorCodigo($_GET['codigo']);

                if ($result) {
                    jsonResponse(true, 'Vendedor encontrado', $result);
                } else {
                    http_response_code(404);
                    jsonResponse(false, 'Vendedor no encontrado');
                }

            } elseif (isset($_GET['estadisticas']) && isset($_GET['id'])) {
                // Obtener estadísticas
                $eventoId = $_GET['evento_id'] ?? null;
                $result = $vendedor->obtenerEstadisticas($_GET['id'], $eventoId);

                jsonResponse(true, 'Estadísticas obtenidas', $result);

            } else {
                // Listar todos
                $activo = isset($_GET['activo']) ? ($_GET['activo'] === 'true' || $_GET['activo'] === '1') : null;
                $result = $vendedor->obtenerTodos($activo);

                jsonResponse(true, 'Vendedores obtenidos', [
                    'vendedores' => $result,
                    'total' => count($result)
                ]);
            }
            break;

        case 'POST':
            // Crear vendedor
            if (empty($input)) {
                http_response_code(400);
                jsonResponse(false, 'Datos no proporcionados');
            }

            $result = $vendedor->crear($input);

            http_response_code(201);
            jsonResponse(true, 'Vendedor creado exitosamente', $result);
            break;

        case 'PUT':
            // Actualizar vendedor
            if (!isset($_GET['id'])) {
                http_response_code(400);
                jsonResponse(false, 'ID no proporcionado');
            }

            if (empty($input)) {
                http_response_code(400);
                jsonResponse(false, 'Datos no proporcionados');
            }

            $result = $vendedor->actualizar($_GET['id'], $input);

            if ($result) {
                jsonResponse(true, 'Vendedor actualizado exitosamente', $result);
            } else {
                http_response_code(404);
                jsonResponse(false, 'Vendedor no encontrado');
            }
            break;

        case 'PATCH':
            // Cambiar estado
            if (!isset($_GET['id'])) {
                http_response_code(400);
                jsonResponse(false, 'ID no proporcionado');
            }

            if (!isset($input['activo'])) {
                http_response_code(400);
                jsonResponse(false, 'Estado no proporcionado');
            }

            $result = $vendedor->cambiarEstado($_GET['id'], $input['activo']);

            if ($result) {
                $mensaje = $input['activo'] ? 'Vendedor activado' : 'Vendedor desactivado';
                jsonResponse(true, $mensaje, $result);
            } else {
                http_response_code(404);
                jsonResponse(false, 'Vendedor no encontrado');
            }
            break;

        case 'DELETE':
            // Eliminar vendedor
            if (!isset($_GET['id'])) {
                http_response_code(400);
                jsonResponse(false, 'ID no proporcionado');
            }

            $result = $vendedor->eliminar($_GET['id']);

            if ($result) {
                jsonResponse(true, 'Vendedor eliminado exitosamente');
            } else {
                http_response_code(404);
                jsonResponse(false, 'Vendedor no encontrado o no se pudo eliminar');
            }
            break;

        default:
            http_response_code(405);
            jsonResponse(false, 'Método no permitido');
            break;
    }

} catch (Exception $e) {
    http_response_code(500);
    jsonResponse(false, $e->getMessage());
}
