# Sistema de BINGO Profesional - PHP + MySQL

## 🎯 Tecnologías

- **Backend**: PHP 7.4+ (POO con MVC)
- **Base de Datos**: MySQL 5.7+ / MariaDB
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Servidor**: Apache con mod_rewrite
- **Generación PDF**: TCPDF o FPDF
- **Códigos QR**: PHP QR Code
- **Tiempo Real**: WebSockets con Ratchet PHP

---

## 📁 Estructura del Proyecto

```
bingo/
├── config/
│   ├── database.php          # Conexión MySQL
│   └── config.php            # Configuraciones generales
├── models/                   # Modelos (POO)
│   ├── Database.php          # Clase base de BD
│   ├── Vendedor.php
│   ├── Evento.php
│   ├── Boleto.php
│   ├── Figura.php
│   ├── Asignacion.php
│   ├── Devolucion.php
│   └── Juego.php
├── controllers/              # Controladores
│   ├── VendedorController.php
│   ├── EventoController.php
│   ├── BoletoController.php
│   ├── FiguraController.php
│   ├── AsignacionController.php
│   ├── DevolucionController.php
│   └── JuegoController.php
├── api/                      # API REST en PHP
│   ├── vendedores.php
│   ├── eventos.php
│   ├── boletos.php
│   ├── figuras.php
│   ├── asignaciones.php
│   ├── devoluciones.php
│   └── juego.php
├── views/                    # Vistas HTML/PHP
│   ├── index.php
│   ├── vendedores.php
│   ├── eventos.php
│   ├── boletos.php
│   ├── juego.php
│   └── reportes.php
├── public/                   # Recursos públicos
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── api.js
│   │   ├── vendedores.js
│   │   ├── eventos.js
│   │   └── juego.js
│   └── img/
├── includes/                 # Archivos comunes
│   ├── header.php
│   ├── footer.php
│   └── functions.php
├── lib/                      # Librerías externas
│   ├── tcpdf/               # Para PDFs
│   ├── phpqrcode/           # Para QR
│   └── ratchet/             # Para WebSockets
├── sql/                      # Scripts SQL
│   ├── schema.sql           # Crear tablas
│   ├── data.sql             # Datos iniciales
│   └── migrations/          # Migraciones
├── uploads/                  # Archivos subidos
│   └── comprobantes/
├── pdfs/                     # PDFs generados
│   └── boletos/
├── logs/                     # Logs del sistema
├── .htaccess                # Configuración Apache
├── index.php                # Punto de entrada
└── README_PHP.md            # Esta guía
```

---

## 🗄️ Base de Datos MySQL

### Crear Base de Datos

```sql
CREATE DATABASE bingo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bingo_db;
```

### Tablas Principales

Ver archivo: `sql/schema.sql`

---

## 🚀 Instalación

### 1. Requisitos

- Apache 2.4+
- PHP 7.4+ con extensiones:
  - pdo_mysql
  - gd (para QR y PDFs)
  - mbstring
  - json
- MySQL 5.7+ o MariaDB 10.3+

### 2. Verificar Extensiones PHP

```bash
php -m | grep -E 'pdo_mysql|gd|mbstring|json'
```

### 3. Clonar/Copiar Proyecto

```bash
# En la carpeta de Apache (Windows: C:\xampp\htdocs\)
# Linux: /var/www/html/
cd /ruta/a/apache/
git clone <repo> bingo
cd bingo
```

### 4. Configurar Base de Datos

Editar `config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'bingo_db');
define('DB_USER', 'root');
define('DB_PASS', 'tu_password');
```

### 5. Importar Base de Datos

```bash
mysql -u root -p < sql/schema.sql
mysql -u root -p bingo_db < sql/data.sql
```

O desde phpMyAdmin:
1. Crear base de datos `bingo_db`
2. Importar `sql/schema.sql`
3. Importar `sql/data.sql`

### 6. Configurar Apache

**Linux (.htaccess ya incluido)**:
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

**Windows (XAMPP)**:
- Verificar que mod_rewrite esté habilitado en httpd.conf

### 7. Permisos (Linux)

```bash
sudo chown -R www-data:www-data bingo/
sudo chmod -R 755 bingo/
sudo chmod -R 777 bingo/uploads/
sudo chmod -R 777 bingo/pdfs/
sudo chmod -R 777 bingo/logs/
```

### 8. Acceder

```
http://localhost/bingo
```

---

## 🔧 Configuración

### config/config.php

```php
<?php
// Configuración general
define('SITE_URL', 'http://localhost/bingo');
define('SITE_NAME', 'Sistema de BINGO');

// Configuración de boletos
define('BOLETOS_POR_HOJA', 8);
define('BOLILLAS_TOTAL', 90);

// Rutas
define('ROOT_PATH', __DIR__ . '/..');
define('UPLOAD_PATH', ROOT_PATH . '/uploads');
define('PDF_PATH', ROOT_PATH . '/pdfs');
```

---

## 📡 API REST

Todas las APIs devuelven JSON.

### Formato de Respuesta

```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { /* datos */ }
}
```

### Endpoints

#### Vendedores

```
GET    /api/vendedores.php              # Listar todos
POST   /api/vendedores.php              # Crear
GET    /api/vendedores.php?id=1         # Obtener por ID
GET    /api/vendedores.php?codigo=V001  # Por código
PUT    /api/vendedores.php?id=1         # Actualizar
DELETE /api/vendedores.php?id=1         # Eliminar
```

#### Eventos

```
GET    /api/eventos.php                 # Listar
POST   /api/eventos.php                 # Crear
GET    /api/eventos.php?id=1            # Obtener
PUT    /api/eventos.php?id=1            # Actualizar
POST   /api/eventos.php?action=cerrar&id=1  # Cerrar ventas
```

#### Boletos

```
GET    /api/boletos.php?evento_id=1     # Por evento
POST   /api/boletos.php?action=generar  # Generar
GET    /api/boletos.php?qr=CODIGO       # Por QR
POST   /api/boletos.php?action=vender   # Vender
```

---

## 🎨 Frontend

### JavaScript Modular

```javascript
// public/js/api.js - Cliente API
class API {
  static async get(endpoint) {
    const response = await fetch(`/api/${endpoint}.php`);
    return await response.json();
  }

  static async post(endpoint, data) {
    const response = await fetch(`/api/${endpoint}.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
}

// Uso
const vendedores = await API.get('vendedores');
```

---

## 🖨️ Generación de PDFs con QR

### Librería: TCPDF

```php
require_once 'lib/tcpdf/tcpdf.php';
require_once 'lib/phpqrcode/qrlib.php';

class PDFBoletos {
  public function generarHoja($asignacionId) {
    $pdf = new TCPDF();
    // ... generar 8 boletos
    // ... agregar QR individual
    // ... agregar QR de hoja
    $pdf->Output('boletos.pdf', 'D');
  }
}
```

---

## 🎮 Juego en Tiempo Real

### Opción 1: AJAX Polling (Más simple)

```javascript
// Actualizar cada 2 segundos
setInterval(async () => {
  const estado = await API.get('juego?action=estado');
  actualizarTablero(estado.data);
}, 2000);
```

### Opción 2: WebSockets con Ratchet

```php
// Servidor WebSocket
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

$server = IoServer::factory(
  new HttpServer(
    new WsServer(
      new JuegoWebSocket()
    )
  ),
  8080
);

$server->run();
```

```javascript
// Cliente
const ws = new WebSocket('ws://localhost:8080');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'bolilla_cantada') {
    marcarBolilla(data.numero);
  }
};
```

---

## 🔐 Seguridad

### Prevenir SQL Injection

```php
// Usar PDO con prepared statements
$stmt = $db->prepare("SELECT * FROM vendedores WHERE id = :id");
$stmt->bindParam(':id', $id, PDO::PARAM_INT);
$stmt->execute();
```

### Prevenir XSS

```php
echo htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
```

### Validación de Entrada

```php
function validarVendedor($data) {
  $errors = [];

  if (empty($data['codigo'])) {
    $errors[] = 'Código es obligatorio';
  }

  if (empty($data['nombre'])) {
    $errors[] = 'Nombre es obligatorio';
  }

  return $errors;
}
```

---

## 📊 Modelo de Datos

### Clase Base

```php
class Database {
  private static $instance = null;
  private $conn;

  private function __construct() {
    $this->conn = new PDO(
      "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME,
      DB_USER,
      DB_PASS
    );
    $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  }

  public static function getInstance() {
    if (!self::$instance) {
      self::$instance = new Database();
    }
    return self::$instance;
  }

  public function getConnection() {
    return $this->conn;
  }
}
```

### Modelo Vendedor

```php
class Vendedor {
  private $db;

  public function __construct() {
    $this->db = Database::getInstance()->getConnection();
  }

  public function crear($data) {
    $sql = "INSERT INTO vendedores (codigo, nombre_completo, telefono, email)
            VALUES (:codigo, :nombre, :telefono, :email)";
    $stmt = $this->db->prepare($sql);
    // ... bind params y execute
  }

  public function obtenerTodos() {
    $sql = "SELECT * FROM vendedores ORDER BY nombre_completo";
    $stmt = $this->db->prepare($sql);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
}
```

---

## 🧪 Testing

### Probar API

```bash
# Crear vendedor
curl -X POST http://localhost/bingo/api/vendedores.php \
  -H "Content-Type: application/json" \
  -d '{"codigo":"V001","nombre_completo":"Juan Perez"}'

# Listar vendedores
curl http://localhost/bingo/api/vendedores.php
```

---

## 📝 Logs

```php
// includes/functions.php
function logAction($message, $type = 'INFO') {
  $log = date('Y-m-d H:i:s') . " [$type] $message\n";
  file_put_contents(__DIR__ . '/../logs/app.log', $log, FILE_APPEND);
}

// Uso
logAction('Vendedor creado: V001', 'INFO');
logAction('Error al conectar BD', 'ERROR');
```

---

## 🔄 Migraciones

```php
// sql/migrations/001_add_vendedores.sql
ALTER TABLE vendedores ADD COLUMN direccion VARCHAR(500);
```

---

## 📦 Librerías Recomendadas

1. **TCPDF** - Generación de PDFs
   ```bash
   composer require tecnickcom/tcpdf
   ```

2. **PHP QR Code** - Códigos QR
   ```bash
   # Descargar de: https://phpqrcode.sourceforge.net/
   ```

3. **Ratchet** - WebSockets (opcional)
   ```bash
   composer require cboden/ratchet
   ```

---

## 🚀 Despliegue en Producción

1. Cambiar credenciales de BD
2. Activar HTTPS
3. Configurar permisos restrictivos
4. Habilitar logs de errores PHP
5. Optimizar consultas SQL (índices)
6. Cachear resultados frecuentes

---

## 🆘 Troubleshooting

### Error: Cannot connect to database

```bash
# Verificar servicio MySQL
sudo systemctl status mysql

# Probar conexión
mysql -u root -p
```

### Error: .htaccess not working

```apache
# En httpd.conf o apache2.conf
<Directory /var/www/html>
    AllowOverride All
</Directory>
```

### Error: QR no se genera

```bash
# Verificar extensión GD
php -m | grep gd

# Instalar si falta
sudo apt-get install php-gd
sudo systemctl restart apache2
```

---

**Próximo paso**: Crear el esquema MySQL completo
