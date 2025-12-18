<?php
/**
 * Configuración General del Sistema
 * Sistema de BINGO Profesional
 */

// Configuración del sitio
define('SITE_NAME', 'Sistema de BINGO Profesional');
define('SITE_URL', 'http://localhost/bingo');
define('SITE_VERSION', '2.0.0');

// Rutas del sistema
define('ROOT_PATH', dirname(__DIR__));
define('CONFIG_PATH', ROOT_PATH . '/config');
define('MODELS_PATH', ROOT_PATH . '/models');
define('CONTROLLERS_PATH', ROOT_PATH . '/controllers');
define('VIEWS_PATH', ROOT_PATH . '/views');
define('API_PATH', ROOT_PATH . '/api');
define('PUBLIC_PATH', ROOT_PATH . '/public');
define('UPLOAD_PATH', ROOT_PATH . '/uploads');
define('PDF_PATH', ROOT_PATH . '/pdfs');
define('LOG_PATH', ROOT_PATH . '/logs');
define('LIB_PATH', ROOT_PATH . '/lib');

// URLs públicas
define('PUBLIC_URL', SITE_URL . '/public');
define('CSS_URL', PUBLIC_URL . '/css');
define('JS_URL', PUBLIC_URL . '/js');
define('IMG_URL', PUBLIC_URL . '/img');

// Configuración de BINGO
define('BOLETOS_POR_HOJA', 8);
define('BOLILLAS_TOTAL', 90);
define('NUMEROS_POR_CARTILLA', 15);  // Cartilla estándar de bingo

// Configuración de boletos
define('CARTILLA_FILAS', 3);
define('CARTILLA_COLUMNAS', 9);
define('NUMEROS_POR_FILA', 5);

// Rango de números por columna (bingo 90 bolillas)
$GLOBALS['RANGO_COLUMNAS'] = [
    0 => [1, 9],    // Columna 1: 1-9
    1 => [10, 19],  // Columna 2: 10-19
    2 => [20, 29],  // Columna 3: 20-29
    3 => [30, 39],  // Columna 4: 30-39
    4 => [40, 49],  // Columna 5: 40-49
    5 => [50, 59],  // Columna 6: 50-59
    6 => [60, 69],  // Columna 7: 60-69
    7 => [70, 79],  // Columna 8: 70-79
    8 => [80, 90],  // Columna 9: 80-90
];

// Configuración de sesión
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
session_start();

// Zona horaria
date_default_timezone_set('America/Mexico_City');

// Configuración de errores
if ($_SERVER['SERVER_NAME'] === 'localhost') {
    // Desarrollo
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    define('DEBUG_MODE', true);
} else {
    // Producción
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', LOG_PATH . '/php_errors.log');
    define('DEBUG_MODE', false);
}

// Configuración de subida de archivos
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5 MB
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif']);

// Configuración de PDFs
define('PDF_ORIENTATION', 'P');  // Portrait
define('PDF_UNIT', 'mm');
define('PDF_FORMAT', 'A4');

// Configuración de comisiones (ejemplo)
define('COMISION_VENDEDOR_PORCENTAJE', 10); // 10%

/**
 * Autoload de clases
 */
spl_autoload_register(function ($class) {
    $paths = [
        MODELS_PATH . '/' . $class . '.php',
        CONTROLLERS_PATH . '/' . $class . '.php',
    ];

    foreach ($paths as $file) {
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

/**
 * Función helper para debug
 */
function dd($var) {
    if (DEBUG_MODE) {
        echo '<pre>';
        var_dump($var);
        echo '</pre>';
        die();
    }
}

/**
 * Función helper para verificar autenticación
 */
function isAuthenticated() {
    return isset($_SESSION['usuario_id']);
}

/**
 * Función helper para obtener usuario actual
 */
function getCurrentUser() {
    return $_SESSION['usuario'] ?? null;
}

/**
 * Función helper para verificar rol
 */
function hasRole($rol) {
    return isset($_SESSION['usuario_rol']) && $_SESSION['usuario_rol'] === $rol;
}

/**
 * Función helper para redirect
 */
function redirect($url) {
    header("Location: " . SITE_URL . $url);
    exit;
}
