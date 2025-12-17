# Guía de Instalación - Sistema de Gestión de Rifas

## Requisitos del Sistema

### Software Necesario

- **Node.js** versión 14 o superior
- **PostgreSQL** versión 12 o superior
- **npm** (incluido con Node.js)
- **Git** (opcional, para clonar el repositorio)

### Sistemas Operativos Soportados

- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu 20.04+, Debian, CentOS, etc.)

---

## Instalación Paso a Paso

### 1. Instalar Node.js

#### Windows
1. Descargar desde https://nodejs.org/
2. Ejecutar el instalador
3. Verificar instalación:
```bash
node --version
npm --version
```

#### macOS
```bash
# Con Homebrew
brew install node

# Verificar
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar
node --version
npm --version
```

### 2. Instalar PostgreSQL

#### Windows
1. Descargar desde https://www.postgresql.org/download/windows/
2. Ejecutar el instalador
3. Durante la instalación:
   - Establecer contraseña para usuario `postgres`
   - Puerto por defecto: 5432
   - Recordar estos datos para la configuración

#### macOS
```bash
# Con Homebrew
brew install postgresql@14
brew services start postgresql@14

# Verificar
psql --version
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar
psql --version
```

### 3. Configurar PostgreSQL

#### Crear Usuario y Base de Datos

**Windows/macOS:**
```bash
# Acceder a PostgreSQL
psql -U postgres

# En el prompt de PostgreSQL:
CREATE DATABASE rifa_db;
CREATE USER rifa_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE rifa_db TO rifa_user;
\q
```

**Linux:**
```bash
# Cambiar a usuario postgres
sudo -u postgres psql

# Crear base de datos y usuario
CREATE DATABASE rifa_db;
CREATE USER rifa_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE rifa_db TO rifa_user;
\q
```

### 4. Descargar el Proyecto

#### Opción A: Clonar con Git
```bash
git clone <url-del-repositorio>
cd bingo
```

#### Opción B: Descargar ZIP
1. Descargar el archivo ZIP del proyecto
2. Extraer en una carpeta
3. Abrir terminal/cmd en esa carpeta

### 5. Instalar Dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias:
- Express.js (servidor web)
- PostgreSQL driver
- Dotenv (variables de entorno)
- Y más...

### 6. Configurar Variables de Entorno

```bash
# Crear archivo .env desde el ejemplo
cp .env.example .env
```

**Windows (cmd):**
```cmd
copy .env.example .env
```

Editar el archivo `.env` con tus datos:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración de Base de Datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rifa_db
DB_USER=rifa_user
DB_PASSWORD=tu_password_seguro

# Seguridad
JWT_SECRET=cambiar_por_clave_aleatoria_segura
JWT_EXPIRES_IN=24h

# Configuración de la aplicación
TICKETS_PER_RAFFLE=100
CURRENCY=MXN
```

**IMPORTANTE**:
- Cambia `DB_PASSWORD` por la contraseña que estableciste
- Cambia `JWT_SECRET` por una cadena aleatoria segura

### 7. Inicializar la Base de Datos

```bash
npm run init-db
```

Este comando:
- Crea todas las tablas necesarias
- Configura índices para rendimiento
- Crea triggers automáticos
- Prepara el sistema para su uso

Deberías ver:
```
🔄 Iniciando creación de tablas...
✅ Tabla "rifas" creada
✅ Tabla "boletos" creada
✅ Tabla "numeros_ganadores" creada
✅ Tabla "ventas_diarias" creada
✅ Tabla "entregas_premios" creada
✅ Tabla "usuarios" creada
✅ Tabla "auditoria" creada
✅ Triggers creados
🎉 ¡Base de datos inicializada correctamente!
```

### 8. Iniciar el Servidor

#### Modo Desarrollo (con auto-reload)
```bash
npm run dev
```

#### Modo Producción
```bash
npm start
```

Deberías ver:
```
🎰 ====================================
   Sistema de Gestión de Rifas
   ====================================
   🚀 Servidor corriendo en: http://localhost:3000
   🌍 Entorno: development
   📊 Base de datos: rifa_db
   ====================================
```

### 9. Acceder a la Aplicación

Abrir navegador web y visitar:
```
http://localhost:3000
```

---

## Verificación de Instalación

### 1. Probar la API

```bash
curl http://localhost:3000/api/health
```

Debería responder:
```json
{
  "status": "OK",
  "message": "Sistema de Rifas funcionando correctamente",
  "timestamp": "2024-12-17T..."
}
```

### 2. Probar la Interfaz Web

1. Abrir http://localhost:3000 en el navegador
2. Deberías ver la interfaz del sistema
3. Intentar crear una rifa de prueba

---

## Solución de Problemas Comunes

### Error: "Cannot connect to database"

**Causa**: PostgreSQL no está corriendo o credenciales incorrectas

**Solución**:
```bash
# Verificar que PostgreSQL esté corriendo
# Windows
# Buscar "Servicios" y verificar que PostgreSQL esté iniciado

# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Verificar credenciales en .env
cat .env | grep DB_
```

### Error: "Port 3000 already in use"

**Causa**: Otro proceso está usando el puerto 3000

**Solución**:
```bash
# Cambiar el puerto en .env
PORT=3001

# O matar el proceso que usa el puerto
# Windows
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# macOS/Linux
lsof -ti:3000 | xargs kill
```

### Error: "Module not found"

**Causa**: Dependencias no instaladas correctamente

**Solución**:
```bash
# Borrar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error al inicializar base de datos

**Causa**: Usuario sin permisos o base de datos ya inicializada

**Solución**:
```bash
# Reconectar a PostgreSQL y dar permisos
psql -U postgres -d rifa_db

# Otorgar todos los permisos
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO rifa_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO rifa_user;
\q

# Intentar nuevamente
npm run init-db
```

### La interfaz web no carga

**Causa**: Problema con archivos estáticos

**Solución**:
1. Verificar que existe la carpeta `public/`
2. Verificar que existen los archivos:
   - `public/index.html`
   - `public/css/styles.css`
   - `public/js/app.js`
   - `public/js/api.js`
3. Reiniciar el servidor

---

## Configuración para Producción

### 1. Variables de Entorno

Crear archivo `.env.production`:
```env
NODE_ENV=production
PORT=80
DB_HOST=tu-servidor-db.com
DB_NAME=rifa_db_prod
DB_USER=rifa_user
DB_PASSWORD=password_super_seguro
JWT_SECRET=clave_aleatoria_muy_segura_minimo_32_caracteres
```

### 2. Usar PM2 para mantener el servidor corriendo

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicación
pm2 start server.js --name "sistema-rifas"

# Configurar para que inicie con el sistema
pm2 startup
pm2 save

# Ver logs
pm2 logs sistema-rifas

# Reiniciar
pm2 restart sistema-rifas
```

### 3. Configurar Nginx (opcional)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Habilitar HTTPS con Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

### 5. Configurar Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Respaldos de Base de Datos

### Crear Respaldo

```bash
# Respaldo completo
pg_dump -U rifa_user rifa_db > backup_$(date +%Y%m%d).sql

# Respaldo comprimido
pg_dump -U rifa_user rifa_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restaurar Respaldo

```bash
# Desde archivo SQL
psql -U rifa_user rifa_db < backup_20241217.sql

# Desde archivo comprimido
gunzip -c backup_20241217.sql.gz | psql -U rifa_user rifa_db
```

### Automatizar Respaldos (Linux/macOS)

Crear script `backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/ruta/a/respaldos"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U rifa_user rifa_db | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Eliminar respaldos antiguos (más de 30 días)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
```

Agregar a crontab:
```bash
# Editar crontab
crontab -e

# Agregar línea (respaldo diario a las 2 AM)
0 2 * * * /ruta/a/backup.sh
```

---

## Actualización del Sistema

### Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas
npm update

# Actualizar una específica
npm install express@latest
```

### Actualizar Código

```bash
git pull origin main
npm install
npm run init-db  # Solo si hay cambios en la estructura de DB
pm2 restart sistema-rifas
```

---

## Desinstalación

### 1. Detener el Servidor

```bash
# Si está con npm
Ctrl + C

# Si está con PM2
pm2 delete sistema-rifas
```

### 2. Eliminar Base de Datos

```bash
psql -U postgres
DROP DATABASE rifa_db;
DROP USER rifa_user;
\q
```

### 3. Eliminar Archivos del Proyecto

```bash
cd ..
rm -rf bingo
```

---

## Soporte y Ayuda

Si encuentras problemas durante la instalación:

1. Revisa esta guía nuevamente
2. Verifica los logs del servidor
3. Verifica los logs de PostgreSQL
4. Consulta la documentación de:
   - [Node.js](https://nodejs.org/docs/)
   - [PostgreSQL](https://www.postgresql.org/docs/)
5. Crea un issue en el repositorio con:
   - Sistema operativo
   - Versiones de Node.js y PostgreSQL
   - Mensaje de error completo
   - Pasos que seguiste

---

## Checklist de Instalación

- [ ] Node.js instalado (v14+)
- [ ] PostgreSQL instalado (v12+)
- [ ] Base de datos `rifa_db` creada
- [ ] Usuario de base de datos creado
- [ ] Proyecto descargado/clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env` configurado
- [ ] Base de datos inicializada (`npm run init-db`)
- [ ] Servidor iniciado (`npm start`)
- [ ] Interfaz web accesible en http://localhost:3000
- [ ] API respondiendo en http://localhost:3000/api/health

---

**¡Felicidades!** Si completaste todos los pasos, tu sistema de gestión de rifas está listo para usar.

Consulta `GUIA_USO.md` para aprender a usar el sistema.
