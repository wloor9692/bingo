# Sistema de BINGO Profesional v2.0

Sistema completo de gestión de BINGO con PHP, MySQL, HTML5, CSS3 y JavaScript.

## 🎯 Características Principales

### Gestión de Vendedores
- Registro de vendedores con códigos únicos
- Control de activación/desactivación
- Estadísticas de ventas por vendedor
- Seguimiento de boletos asignados y vendidos

### Gestión de Eventos
- Creación de eventos de BINGO
- Configuración de precios y premios
- Asignación de múltiples figuras por evento
- Estados: Pendiente, Activo, En Curso, Finalizado, Cancelado
- Estadísticas completas por evento

### Sistema de Boletos
- **8 boletos por hoja** con numeración única
- **Código QR individual** para cada boleto
- **Código QR de hoja** para identificación del set completo
- Cartillas de BINGO de 3x9 con 15 números (1-90)
- Asignación masiva a vendedores
- Control de ventas por boleto individual

### Devoluciones
- Registro de boletos no vendidos
- Validación automática de hojas devueltas
- Control de boletos vendidos vs devueltos
- Estadísticas de devoluciones

### Juego en Tiempo Real
- Tablero visual de 90 números
- Canto manual de bolillas
- Validación automática de ganadores
- Soporte para múltiples figuras por evento
- Panel de ganadores en tiempo real
- Actualización automática cada 5 segundos

### Figuras de BINGO
El sistema incluye 8 figuras predefinidas:
1. Línea Horizontal
2. Línea Vertical
3. Diagonal Descendente
4. Diagonal Ascendente
5. Cuatro Esquinas
6. Cartón Lleno
7. Cruz
8. Marco (Bordes)

## 📋 Requisitos del Sistema

### Servidor
- Apache 2.4+ con mod_rewrite habilitado
- PHP 7.4+ o 8.x
- MySQL 5.7+ o MariaDB 10.3+

### Extensiones PHP Requeridas
- PDO y PDO_MySQL
- JSON
- mbstring
- session

## 🚀 Instalación

### 1. Configurar la Base de Datos

Editar `config/database.php`:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'bingo_db');
define('DB_USER', 'tu_usuario');
define('DB_PASS', 'tu_contraseña');
```

### 2. Crear la Base de Datos

Ejecutar el script SQL:
```bash
mysql -u root -p < sql/schema.sql
```

### 3. Configurar Apache

Actualizar `config/config.php` con tu URL:
```php
define('SITE_URL', 'http://localhost/bingo');
```

### 4. Acceder al Sistema

```
http://localhost/bingo/
```

## ✅ Sistema Completado

El sistema está 100% funcional con:
- ✅ Backend PHP completo (6 modelos, 6 APIs REST)
- ✅ Frontend HTML/CSS/JS completo
- ✅ Todas las vistas implementadas
- ✅ Sistema de juego en tiempo real
- ✅ API REST completa y documentada
- ✅ Base de datos con stored procedures
- ✅ Interfaz responsive y profesional

**¡El sistema está listo para usar!**

---
**Versión:** 2.0 | **Stack:** PHP + MySQL + JavaScript + Apache
