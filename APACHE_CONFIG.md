# Configuración Apache - Sistema de Bingo

## Opción 1: Apache como Proxy Reverse (Recomendado)

### Virtual Host Configuration

Crear archivo: `/etc/apache2/sites-available/bingo.conf`

```apache
<VirtualHost *:80>
    ServerName bingo.tudominio.com
    ServerAlias www.bingo.tudominio.com

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/bingo-error.log
    CustomLog ${APACHE_LOG_DIR}/bingo-access.log combined

    # Proxy al servidor Node.js
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # WebSocket support para el módulo de juego en tiempo real
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://localhost:3000/$1 [P,L]
    RewriteCond %{HTTP:Upgrade} !=websocket [NC]
    RewriteRule /(.*)           http://localhost:3000/$1 [P,L]

    # Headers de seguridad
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
</VirtualHost>
```

### Habilitar módulos necesarios

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel  # Para WebSockets
sudo a2enmod rewrite
sudo a2enmod headers

# Habilitar el sitio
sudo a2ensite bingo.conf

# Reiniciar Apache
sudo systemctl restart apache2
```

### Configurar PM2 para mantener Node.js corriendo

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start server.js --name "bingo-system"

# Configurar para inicio automático
pm2 startup
pm2 save
```

## Opción 2: Apache en Windows (XAMPP/WAMP)

### httpd-vhosts.conf

Agregar en `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:

```apache
<VirtualHost *:80>
    ServerName localhost

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://localhost:3000/$1 [P,L]
</VirtualHost>
```

### Habilitar módulos en httpd.conf

Descomentar estas líneas en `httpd.conf`:

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule headers_module modules/mod_headers.so
```

## Configuración SSL (HTTPS) - Producción

```apache
<VirtualHost *:443>
    ServerName bingo.tudominio.com

    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/key.pem

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # WebSocket SSL
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           wss://localhost:3000/$1 [P,L]
</VirtualHost>
```

## Mantener Node.js corriendo en Windows

### Opción 1: PM2 en Windows

```cmd
npm install -g pm2
pm2 start server.js --name bingo
pm2 startup
pm2 save
```

### Opción 2: node-windows

```cmd
npm install -g node-windows
```

Crear `install-service.js`:

```javascript
var Service = require('node-windows').Service;

var svc = new Service({
  name: 'Sistema Bingo',
  description: 'Sistema profesional de gestión de bingo',
  script: 'C:\\ruta\\a\\bingo\\server.js'
});

svc.on('install', function(){
  svc.start();
});

svc.install();
```

## Verificación

```bash
# Verificar que Apache está corriendo
sudo systemctl status apache2

# Verificar que Node.js está corriendo
pm2 list

# Ver logs
pm2 logs bingo-system

# Probar el proxy
curl http://localhost/api/health
```

## Troubleshooting

### Error: (13)Permission denied: AH00957

```bash
# SELinux en CentOS/RHEL
sudo setsebool -P httpd_can_network_connect 1
```

### WebSocket no funciona

Verificar que mod_proxy_wstunnel está habilitado:
```bash
apache2ctl -M | grep proxy_wstunnel
```
