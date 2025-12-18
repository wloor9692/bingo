# Instalación - Sistema de BINGO en PHP + MySQL

## ✅ Requisitos del Sistema

- **Apache** 2.4+ con mod_rewrite
- **PHP** 7.4+ con extensiones:
  - pdo_mysql
  - gd
  - mbstring
  - json
- **MySQL** 5.7+ o **MariaDB** 10.3+

---

## 🚀 Instalación Paso a Paso

### 1. Verificar Requisitos

#### Windows (XAMPP)
```cmd
# Abrir XAMPP Control Panel
# Iniciar Apache y MySQL
```

#### Linux (Ubuntu/Debian)
```bash
# Instalar Apache, PHP y MySQL
sudo apt update
sudo apt install apache2 php libapache2-mod-php mysql-server
sudo apt install php-mysql php-gd php-mbstring php-json

# Verificar versión de PHP
php -v

# Verificar extensiones
php -m | grep -E 'pdo_mysql|gd|mbstring|json'
```

### 2. Clonar/Descargar Proyecto

#### Opción A: Git
```bash
cd /var/www/html  # Linux
# o
cd C:\xampp\htdocs  # Windows

git clone <url-repositorio> bingo
cd bingo
```

#### Opción B: Manual
- Descargar ZIP
- Extraer en `/var/www/html/bingo` (Linux) o `C:\xampp\htdocs\bingo` (Windows)

### 3. Crear Base de Datos

#### Opción A: Línea de comandos
```bash
# Acceder a MySQL
mysql -u root -p

# Ejecutar script
source /ruta/a/bingo/sql/schema.sql

# O directamente
mysql -u root -p < /ruta/a/bingo/sql/schema.sql
```

#### Opción B: phpMyAdmin
1. Abrir http://localhost/phpmyadmin
2. Click en "Importar"
3. Seleccionar archivo `sql/schema.sql`
4. Click en "Continuar"

### 4. Configurar Conexión a Base de Datos

Editar `config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'bingo_db');
define('DB_USER', 'root');
define('DB_PASS', 'tu_password_aqui');  // Cambiar
```

### 5. Configurar Permisos (Solo Linux)

```bash
# Dar permisos a Apache
sudo chown -R www-data:www-data /var/www/html/bingo
sudo chmod -R 755 /var/www/html/bingo

# Permisos de escritura para uploads y logs
sudo chmod -R 777 /var/www/html/bingo/uploads
sudo chmod -R 777 /var/www/html/bingo/pdfs
sudo chmod -R 777 /var/www/html/bingo/logs

# Crear carpetas si no existen
mkdir -p uploads pdfs logs
```

### 6. Habilitar mod_rewrite (Apache)

#### Linux
```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

#### Windows (XAMPP)
- Verificar en `httpd.conf` que la línea esté descomentada:
  ```apache
  LoadModule rewrite_module modules/mod_rewrite.so
  ```

### 7. Probar Instalación

Abrir navegador y visitar:
```
http://localhost/bingo
```

Deberías ver la pantalla principal del sistema.

---

## 🔧 Configuración Avanzada

### Virtual Host (Recomendado para desarrollo)

#### Linux

Crear archivo `/etc/apache2/sites-available/bingo.conf`:

```apache
<VirtualHost *:80>
    ServerName bingo.local
    ServerAlias www.bingo.local

    DocumentRoot /var/www/html/bingo
    <Directory /var/www/html/bingo>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/bingo-error.log
    CustomLog ${APACHE_LOG_DIR}/bingo-access.log combined
</VirtualHost>
```

Activar:
```bash
sudo a2ensite bingo.conf
sudo systemctl reload apache2

# Agregar al hosts
echo "127.0.0.1 bingo.local" | sudo tee -a /etc/hosts
```

Acceder: `http://bingo.local`

#### Windows (XAMPP)

Editar `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:

```apache
<VirtualHost *:80>
    ServerName bingo.local
    DocumentRoot "C:/xampp/htdocs/bingo"
    <Directory "C:/xampp/htdocs/bingo">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

Editar `C:\Windows\System32\drivers\etc\hosts` (como Administrador):
```
127.0.0.1 bingo.local
```

Reiniciar Apache desde XAMPP Control Panel.

---

## 📝 Configuración Inicial

### 1. Login Inicial

Usuario por defecto (creado en schema.sql):
- **Usuario**: admin
- **Contraseña**: admin123

**⚠️ IMPORTANTE**: Cambiar contraseña inmediatamente después del primer login.

### 2. Cambiar Contraseña Admin

Acceder a phpMyAdmin o ejecutar:

```sql
UPDATE usuarios
SET password_hash = '$2y$10$[TU_NUEVO_HASH]'
WHERE username = 'admin';
```

Para generar hash:
```php
<?php
echo password_hash('nueva_contraseña', PASSWORD_DEFAULT);
?>
```

### 3. Configurar Parámetros

Editar `config/config.php`:

```php
// Zona horaria
date_default_timezone_set('America/Mexico_City');

// Boletos por hoja
define('BOLETOS_POR_HOJA', 8);

// Comisión de vendedores
define('COMISION_VENDEDOR_PORCENTAJE', 10);
```

---

## 🧪 Probar Funcionalidades

### 1. Probar API de Vendedores

```bash
# Listar vendedores
curl http://localhost/bingo/api/vendedores.php

# Crear vendedor
curl -X POST http://localhost/bingo/api/vendedores.php \
  -H "Content-Type: application/json" \
  -d '{"codigo":"V001","nombre_completo":"Juan Perez","telefono":"555-1234"}'
```

### 2. Verificar Base de Datos

```sql
-- Ver tablas creadas
SHOW TABLES FROM bingo_db;

-- Ver figuras predefinidas
SELECT * FROM figuras;

-- Ver usuario admin
SELECT * FROM usuarios;
```

---

## 🔐 Seguridad

### Producción

1. **Cambiar credenciales de BD**
2. **Deshabilitar display_errors**
   ```php
   ini_set('display_errors', 0);
   ```
3. **Activar HTTPS**
4. **Cambiar usuario admin**
5. **Establecer permisos restrictivos**

---

## 📦 Librerías Necesarias

### TCPDF (Para PDFs)

```bash
# Con composer
composer require tecnickcom/tcpdf

# O descargar manualmente
# https://github.com/tecnickcom/TCPDF
# Extraer en lib/tcpdf/
```

### PHP QR Code (Para códigos QR)

```bash
# Descargar de https://phpqrcode.sourceforge.net/
# Extraer en lib/phpqrcode/
```

---

## 🆘 Solución de Problemas

### Error: Cannot connect to database

```bash
# Verificar MySQL
sudo systemctl status mysql  # Linux
# o revisar XAMPP Control Panel en Windows

# Verificar credenciales en config/database.php
```

### Error: .htaccess not found

El archivo `.htaccess` debe estar en la raíz del proyecto. Si no existe, créalo:

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

### Error: Permission denied (uploads/)

```bash
sudo chmod -R 777 uploads pdfs logs
```

### Error: Call to undefined function imagecreate()

```bash
# Instalar extensión GD
sudo apt-get install php-gd
sudo systemctl restart apache2
```

---

## 📊 Verificar Instalación

Visita: `http://localhost/bingo/test.php`

Crear `test.php` en la raíz:

```php
<?php
require_once 'config/database.php';
require_once 'config/config.php';

echo "<h1>Test de Instalación - Sistema BINGO</h1>";

// Test conexión BD
try {
    $db = Database::getInstance()->getConnection();
    echo "✅ Conexión a base de datos: OK<br>";
} catch (Exception $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "<br>";
}

// Test extensiones PHP
$extensiones = ['pdo_mysql', 'gd', 'mbstring', 'json'];
foreach ($extensiones as $ext) {
    if (extension_loaded($ext)) {
        echo "✅ Extensión $ext: OK<br>";
    } else {
        echo "❌ Extensión $ext: NO INSTALADA<br>";
    }
}

// Test permisos
$dirs = ['uploads', 'pdfs', 'logs'];
foreach ($dirs as $dir) {
    if (is_writable($dir)) {
        echo "✅ Permisos en /$dir: OK<br>";
    } else {
        echo "❌ Permisos en /$dir: SIN PERMISOS DE ESCRITURA<br>";
    }
}

// Test de tablas
try {
    $db = Database::getInstance()->getConnection();
    $tables = $db->query("SHOW TABLES FROM bingo_db")->fetchAll();
    echo "✅ Tablas encontradas: " . count($tables) . "<br>";
} catch (Exception $e) {
    echo "❌ Error al listar tablas<br>";
}

echo "<br><strong>Si todos los tests están en verde, ¡la instalación es exitosa!</strong>";
?>
```

---

## ✅ Checklist de Instalación

- [ ] Apache instalado y corriendo
- [ ] PHP 7.4+ instalado
- [ ] MySQL instalado y corriendo
- [ ] Extensiones PHP instaladas (pdo_mysql, gd, mbstring, json)
- [ ] Base de datos `bingo_db` creada
- [ ] Tablas importadas desde `schema.sql`
- [ ] `config/database.php` configurado
- [ ] Permisos establecidos (Linux)
- [ ] mod_rewrite habilitado
- [ ] Acceso a http://localhost/bingo funcionando
- [ ] API de vendedores responde
- [ ] Login con usuario admin funciona

---

¡Instalación completada! Consulta `README_PHP.md` para la documentación completa del sistema.
