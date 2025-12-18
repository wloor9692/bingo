<?php
/**
 * Configuración de Base de Datos MySQL
 * Sistema de BINGO Profesional
 */

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'bingo_db');
define('DB_USER', 'root');
define('DB_PASS', '');  // Cambiar en producción
define('DB_CHARSET', 'utf8mb4');

/**
 * Clase Database - Singleton para conexión PDO
 */
class Database {
    private static $instance = null;
    private $conn;

    /**
     * Constructor privado para Singleton
     */
    private function __construct() {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            $this->conn = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die("Error de conexión: " . $e->getMessage());
        }
    }

    /**
     * Obtener instancia única de Database
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    /**
     * Obtener conexión PDO
     */
    public function getConnection() {
        return $this->conn;
    }

    /**
     * Ejecutar query SELECT
     */
    public function query($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log("Error en query: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Ejecutar query INSERT/UPDATE/DELETE
     */
    public function execute($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            return $stmt->execute($params);
        } catch (PDOException $e) {
            error_log("Error en execute: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Obtener último ID insertado
     */
    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }

    /**
     * Iniciar transacción
     */
    public function beginTransaction() {
        return $this->conn->beginTransaction();
    }

    /**
     * Confirmar transacción
     */
    public function commit() {
        return $this->conn->commit();
    }

    /**
     * Revertir transacción
     */
    public function rollBack() {
        return $this->conn->rollBack();
    }

    /**
     * Prevenir clonación
     */
    private function __clone() {}

    /**
     * Prevenir unserialize
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

/**
 * Función helper para obtener conexión
 */
function getDB() {
    return Database::getInstance();
}

/**
 * Función helper para escapar HTML (prevenir XSS)
 */
function e($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Función helper para respuesta JSON
 */
function jsonResponse($success, $message, $data = null) {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

/**
 * Función helper para log de errores
 */
function logError($message, $context = []) {
    $log = date('Y-m-d H:i:s') . " - " . $message;
    if (!empty($context)) {
        $log .= " - Context: " . json_encode($context);
    }
    $log .= "\n";

    $logFile = __DIR__ . '/../logs/error.log';
    file_put_contents($logFile, $log, FILE_APPEND);
}
