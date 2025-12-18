<?php
/**
 * API REST - Asignaciones de Boletos
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once MODELS_PATH . '/Asignacion.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$asignacion = new Asignacion();

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Obtener asignación por ID (hoja completa con sus 8 boletos)
                $result = $asignacion->obtenerPorId($_GET['id']);
                jsonResponse(true, 'Asignación encontrada', $result);
            } elseif (isset($_GET['codigo_qr'])) {
                // Buscar boleto por código QR
                $result = $asignacion->buscarPorCodigoQR($_GET['codigo_qr']);
                if ($result) {
                    jsonResponse(true, 'Boleto encontrado', $result);
                } else {
                    jsonResponse(false, 'Boleto no encontrado');
                }
            } elseif (isset($_GET['estadisticas'])) {
                // Obtener estadísticas
                $filtros = [
                    'vendedor_id' => $_GET['vendedor_id'] ?? null,
                    'evento_id' => $_GET['evento_id'] ?? null
                ];
                $result = $asignacion->obtenerEstadisticas($filtros);
                jsonResponse(true, 'Estadísticas obtenidas', $result);
            } elseif (isset($_GET['boletos_hoja'])) {
                // Obtener boletos de una hoja específica
                $result = $asignacion->obtenerBoletosHoja($_GET['boletos_hoja']);
                jsonResponse(true, 'Boletos obtenidos', $result);
            } else {
                // Obtener todas las asignaciones con filtros
                $filtros = [
                    'vendedor_id' => $_GET['vendedor_id'] ?? null,
                    'evento_id' => $_GET['evento_id'] ?? null,
                    'estado' => $_GET['estado'] ?? null
                ];
                $result = $asignacion->obtenerTodas($filtros);
                jsonResponse(true, 'Asignaciones obtenidas', ['asignaciones' => $result]);
            }
            break;

        case 'POST':
            // Crear nueva asignación (generar hojas de boletos)
            $input = json_decode(file_get_contents('php://input'), true);

            if (isset($input['marcar_vendido'])) {
                // Marcar un boleto individual como vendido
                $compradorData = [
                    'nombre' => $input['comprador_nombre'] ?? null,
                    'telefono' => $input['comprador_telefono'] ?? null
                ];
                $result = $asignacion->marcarVendido($input['codigo_qr'], $compradorData);
                jsonResponse(true, 'Boleto marcado como vendido', $result);
            } else {
                // Crear asignación nueva
                $result = $asignacion->crear($input);
                jsonResponse(true, 'Asignación creada exitosamente', $result);
            }
            break;

        case 'PUT':
        case 'PATCH':
            // Actualizar estado de boleto
            $input = json_decode(file_get_contents('php://input'), true);

            if (isset($input['codigo_qr']) && isset($input['vendido'])) {
                $compradorData = [
                    'nombre' => $input['comprador_nombre'] ?? null,
                    'telefono' => $input['comprador_telefono'] ?? null
                ];
                $result = $asignacion->marcarVendido($input['codigo_qr'], $compradorData);
                jsonResponse(true, 'Boleto actualizado', $result);
            } else {
                throw new Exception('Datos insuficientes para actualizar');
            }
            break;

        default:
            http_response_code(405);
            jsonResponse(false, 'Método no permitido');
    }
} catch (Exception $e) {
    http_response_code(400);
    jsonResponse(false, $e->getMessage());
}
