<?php
/**
 * Sistema de BINGO Profesional
 * Punto de entrada principal
 *
 * Este archivo maneja todas las rutas y renderiza las vistas correspondientes
 */

// Cargar configuración
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// Obtener la ruta solicitada
$request_uri = $_SERVER['REQUEST_URI'];
$script_name = dirname($_SERVER['SCRIPT_NAME']);
$route = str_replace($script_name, '', $request_uri);
$route = strtok($route, '?'); // Remover query string

// Limpiar la ruta
$route = trim($route, '/');
if (empty($route)) {
    $route = 'home';
}

// Función para renderizar vista
function renderView($view, $data = []) {
    extract($data);

    // Buffer de salida
    ob_start();

    // Incluir header
    include __DIR__ . '/views/partials/header.php';

    // Incluir vista específica
    $viewFile = __DIR__ . '/views/' . $view . '.php';
    if (file_exists($viewFile)) {
        include $viewFile;
    } else {
        include __DIR__ . '/views/404.php';
    }

    // Incluir footer
    include __DIR__ . '/views/partials/footer.php';

    // Enviar buffer
    ob_end_flush();
}

// Router simple
switch ($route) {
    case 'home':
    case '':
        renderView('home', ['title' => 'Dashboard']);
        break;

    case 'vendedores':
        renderView('vendedores', ['title' => 'Vendedores']);
        break;

    case 'eventos':
        renderView('eventos', ['title' => 'Eventos']);
        break;

    case 'boletos':
        renderView('boletos', ['title' => 'Boletos']);
        break;

    case 'figuras':
        renderView('figuras', ['title' => 'Figuras']);
        break;

    case 'asignaciones':
        renderView('asignaciones', ['title' => 'Asignación de Boletería']);
        break;

    case 'devoluciones':
        renderView('devoluciones', ['title' => 'Devoluciones']);
        break;

    case 'juego':
        renderView('juego', ['title' => 'Juego de Bingo']);
        break;

    case 'reportes':
        renderView('reportes', ['title' => 'Reportes']);
        break;

    case 'login':
        renderView('login', ['title' => 'Iniciar Sesión']);
        break;

    case 'logout':
        session_destroy();
        header('Location: ' . SITE_URL . '/login');
        exit;
        break;

    default:
        http_response_code(404);
        renderView('404', ['title' => 'Página No Encontrada']);
        break;
}
