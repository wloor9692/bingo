# Sistema Profesional de BINGO v2.0

## 🎯 Descripción

Sistema web completo para la gestión profesional de juegos de bingo con:

- ✅ **Gestión de Vendedores** - Control completo de vendedores con códigos únicos
- 🎫 **Asignación de Boletería** - Asignar rangos de boletos a vendedores
- 📦 **Devoluciones** - Registro de boletos vendidos y no vendidos
- 🖨️ **Impresión con QR** - PDFs con 8 boletos por hoja y códigos QR
- 🎲 **Figuras de Bingo** - Crear y gestionar figuras personalizadas
- 📅 **Eventos Diarios** - Crear eventos con múltiples figuras
- 🎮 **Juego en Tiempo Real** - Tablero con validación automática de ganadores
- 🌐 **Apache + WebSockets** - Configurado para producción

---

## 📊 Estado del Proyecto

### ✅ Completado

1. **Configuración Apache** - Proxy reverse con soporte WebSocket
2. **Base de Datos** - Esquema completo con 13 tablas
3. **Módulo de Vendedores** - CRUD completo con estadísticas
4. **Documentación** - Guías completas de instalación y uso

### 🚧 En Desarrollo

- Módulo de Asignación de Boletos
- Módulo de Devoluciones
- Módulo de Figuras
- Módulo de Eventos
- Generador de PDFs con QR
- Módulo de Juego en Tiempo Real
- Interfaz de Tablero

---

## 🏗️ Arquitectura

```
bingo/
├── config/                 # Configuración BD
├── modules/               # Módulos del sistema
│   ├── vendedores/       # ✅ Gestión de vendedores
│   ├── asignaciones/     # 🚧 Asignación de boletos
│   ├── devoluciones/     # 🚧 Control de devoluciones
│   ├── figuras/          # 🚧 Figuras de bingo
│   ├── eventos/          # 🚧 Eventos diarios
│   ├── impresion/        # 🚧 PDFs con QR
│   ├── juego/            # 🚧 Juego en tiempo real
│   └── validacion/       # 🚧 Validación automática
├── public/               # Frontend
├── scripts/              # Scripts de utilidad
│   ├── init-database.js
│   └── update-database-bingo.js
└── server.js             # Servidor principal

```

---

## 🗄️ Base de Datos

### Tablas Principales

1. **vendedores** - Información de vendedores
2. **eventos** - Eventos diarios de bingo
3. **figuras** - Figuras/patrones de bingo
4. **evento_figuras** - Relación eventos-figuras
5. **asignacion_boletos** - Boletos asignados a vendedores
6. **boletos_detalle** - Cada boleto individual con QR
7. **devoluciones** - Registro de devoluciones
8. **juego_sesiones** - Sesiones de juego activas
9. **bolillas_cantadas** - Bolillas cantadas en juego
10. **ganadores_bingo** - Ganadores detectados

---

## 🚀 Instalación Rápida

### 1. Instalar Dependencias

```bash
npm install
```

Nuevas dependencias:
- `socket.io` - WebSockets para juego en tiempo real
- `qrcode` - Generación de códigos QR
- `pdfkit` - Generación de PDFs
- `canvas` - Renderizado de cartillas

### 2. Actualizar Base de Datos

```bash
# Crear tablas básicas (si es primera vez)
npm run init-db

# Actualizar con tablas de BINGO
npm run update-db-bingo
```

### 3. Configurar Apache

Ver: `APACHE_CONFIG.md`

```bash
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers
sudo a2ensite bingo.conf
sudo systemctl restart apache2
```

### 4. Iniciar Aplicación

```bash
# Desarrollo
npm run dev

# Producción con PM2
pm2 start server.js --name bingo
pm2 save
```

---

## 📡 API - Vendedores

### Endpoints Disponibles

```http
POST   /api/vendedores                  # Crear vendedor
GET    /api/vendedores                  # Listar todos
GET    /api/vendedores/:id              # Obtener por ID
GET    /api/vendedores/codigo/:codigo   # Buscar por código
PUT    /api/vendedores/:id              # Actualizar
PATCH  /api/vendedores/:id/estado       # Activar/Desactivar
GET    /api/vendedores/:id/estadisticas # Estadísticas
DELETE /api/vendedores/:id              # Eliminar
```

### Ejemplo: Crear Vendedor

```bash
curl -X POST http://localhost:3000/api/vendedores \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "VND001",
    "nombre_completo": "Juan Pérez",
    "telefono": "555-1234",
    "email": "juan@example.com"
  }'
```

### Respuesta

```json
{
  "success": true,
  "message": "Vendedor creado exitosamente",
  "data": {
    "id": 1,
    "codigo": "VND001",
    "nombre_completo": "Juan Pérez",
    "telefono": "555-1234",
    "email": "juan@example.com",
    "activo": true,
    "created_at": "2024-12-17T..."
  }
}
```

---

## 🎫 Flujo del Sistema

### 1. Preparación
- [ ] Crear vendedores
- [ ] Crear figuras de bingo
- [ ] Crear evento del día
- [ ] Asignar figuras al evento

### 2. Asignación
- [ ] Asignar boletos a vendedores
- [ ] Generar códigos QR
- [ ] Imprimir PDFs (8 boletos/hoja)
- [ ] Entregar a vendedores

### 3. Ventas
- [ ] Vendedores escanean QR para vender
- [ ] Registrar nombre del cliente
- [ ] Marcar como vendido

### 4. Devolución
- [ ] Vendedores devuelven boletos no vendidos
- [ ] Sistema valida: vendidos + no vendidos = total
- [ ] Calcular comisiones

### 5. Cierre
- [ ] Admin cierra ventas del evento
- [ ] Habilitar módulo de juego

### 6. Juego
- [ ] Iniciar sesión de juego
- [ ] Cantar bolillas (1-90)
- [ ] Sistema valida automáticamente
- [ ] Alerta de ganadores
- [ ] Entregar premios

---

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Servidor
PORT=3000
NODE_ENV=production

# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rifa_db
DB_USER=postgres
DB_PASSWORD=tu_password

# Seguridad
JWT_SECRET=clave_super_secreta

# Configuración de Bingo
BOLETOS_POR_HOJA=8
BOLILLAS_TOTAL=90
```

---

## 📖 Documentación

- **README.md** - Información general
- **README_BINGO.md** (este archivo) - Sistema de BINGO
- **SISTEMA_BINGO_COMPLETO.md** - Documentación técnica completa
- **APACHE_CONFIG.md** - Configuración de Apache
- **INSTALL.md** - Instalación paso a paso
- **GUIA_USO.md** - Manual de usuario
- **API_DOCUMENTATION.md** - API REST completa

---

## 🎯 Próximos Módulos

### Alta Prioridad
1. **Asignaciones** - Asignar boletos a vendedores
2. **Impresión** - PDFs con códigos QR
3. **Eventos** - Crear eventos diarios

### Media Prioridad
4. **Devoluciones** - Registro de devoluciones
5. **Figuras** - Gestión de figuras

### Baja Prioridad
6. **Juego** - Tablero en tiempo real
7. **Validación** - Detección automática de ganadores

---

## 🐛 Troubleshooting

### Error: Cannot connect to database

```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar credenciales en .env
cat .env | grep DB_
```

### Error: Module 'socket.io' not found

```bash
npm install
```

### Apache no arranca

```bash
# Verificar módulos
sudo apache2ctl -M | grep proxy

# Habilitar módulos
sudo a2enmod proxy proxy_http proxy_wstunnel
sudo systemctl restart apache2
```

---

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades:

1. Revisar documentación completa en `SISTEMA_BINGO_COMPLETO.md`
2. Verificar logs: `pm2 logs bingo`
3. Crear issue con detalles completos

---

## 📜 Licencia

MIT

---

## 🎉 Estado Actual

**Versión**: 2.0.0
**Módulos Completados**: 1/10
**Progreso General**: 20%

### Módulo de Vendedores ✅ 100%
- CRUD completo
- Validaciones
- Estadísticas
- API funcional

### Próximo: Asignación de Boletos 🚧 0%

---

**Última actualización**: Diciembre 2024
