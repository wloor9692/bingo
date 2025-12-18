# Sistema Profesional de BINGO - Documentación Completa

## Descripción General

Sistema web profesional para gestión completa de juegos de bingo con:
- Gestión de vendedores y asignación de boletería
- Impresión de boletos con códigos QR
- Control de ventas y devoluciones
- Creación de figuras y eventos
- Módulo de juego en tiempo real con validación automática
- Configurado para Apache con WebSockets

---

## Arquitectura del Sistema

### Backend
- **Node.js + Express.js** con arquitectura modular
- **Socket.IO** para juego en tiempo real
- **PostgreSQL** con transacciones y triggers
- **Apache** como proxy reverse

### Frontend
- HTML5, CSS3, JavaScript
- WebSockets para tablero en tiempo real
- Interfaz responsiva

---

## Módulos del Sistema

### 1. Módulo de Vendedores ✅
**Ubicación**: `modules/vendedores/`

**Funcionalidades**:
- CRUD completo de vendedores
- Código único por vendedor
- Estado activo/inactivo
- Estadísticas de vend por vendedor
- Validaciones de unicidad

**Endpoints**:
```
POST   /api/vendedores              # Crear vendedor
GET    /api/vendedores              # Listar todos
GET    /api/vendedores/:id          # Obtener por ID
GET    /api/vendedores/codigo/:codigo  # Buscar por código
PUT    /api/vendedores/:id          # Actualizar
PATCH  /api/vendedores/:id/estado   # Activar/Desactivar
GET    /api/vendedores/:id/estadisticas  # Estadísticas
DELETE /api/vendedores/:id          # Eliminar
```

### 2. Módulo de Asignación de Boletos (En desarrollo)
**Ubicación**: `modules/asignaciones/`

**Funcionalidades**:
- Asignar rangos de boletos a vendedores
- Generar códigos QR por boleto
- Generar código QR por hoja (8 boletos)
- Control de boletos asignados vs disponibles
- Historial de asignaciones

**Tabla**: `asignacion_boletos`
- evento_id
- vendedor_id
- boleto_desde / boleto_hasta
- cantidad
- hoja_qr_code (QR de la hoja)

### 3. Módulo de Devoluciones (Pendiente)
**Ubicación**: `modules/devoluciones/`

**Funcionalidades**:
- Registrar devolución de boletos
- Marcar boletos como vendidos/no vendidos
- Calcular comisiones
- Validar que todos los boletos estén contabilizados
- Generar reporte de cierre

**Tabla**: `devoluciones`
- asignacion_id
- vendedor_id
- boletos_vendidos / boletos_no_vendidos
- monto_total
- observaciones

### 4. Módulo de Boletos Detallados (Pendiente)
**Ubicación**: `modules/boletos-detalle/`

**Funcionalidades**:
- Cada boleto individual con su QR
- Estados: asignado, vendido, devuelto
- Trazabilidad completa
- Registro de cartilla (números del boleto)
- Búsqueda por código QR

**Tabla**: `boletos_detalle`
- evento_id
- asignacion_id
- numero (número del boleto)
- codigo_qr (único)
- vendedor_id
- estado
- numeros_cartilla (números de bingo en el boleto)
- cliente_nombre, fecha_venta, precio_venta

### 5. Módulo de Figuras (Pendiente)
**Ubicación**: `modules/figuras/`

**Funcionalidades**:
- Crear figuras de bingo personalizadas
- Patrones predefinidos:
  - Línea horizontal
  - Línea vertical
  - Diagonales
  - 4 esquinas
  - Cartón lleno
  - Cruz
  - Marco
- Patrón en JSON para validación automática
- Imágenes de referencia

**Tabla**: `figuras`
- nombre
- descripcion
- patron_json (estructura para validar)
- imagen_url
- activo

### 6. Módulo de Eventos (Pendiente)
**Ubicación**: `modules/eventos/`

**Funcionalidades**:
- Crear eventos diarios
- Asignar múltiples figuras al evento
- Establecer premios por figura
- Controlar cierre de ventas
- Estados: programado, en_venta, cerrado, en_juego, finalizado

**Tablas**:
- `eventos`: Información del evento
- `evento_figuras`: Relación muchos a muchos con premios

**Endpoints clave**:
```
POST /api/eventos                    # Crear evento
POST /api/eventos/:id/figuras        # Asignar figuras
POST /api/eventos/:id/cerrar-ventas  # Cerrar ventas (requerido para jugar)
GET  /api/eventos/:id/estado         # Ver estado actual
```

### 7. Módulo de Impresión de Boletos (Pendiente)
**Ubicación**: `modules/impresion/`

**Funcionalidades**:
- Generar PDF con 8 boletos por hoja
- Código QR individual por boleto
  - Contiene: evento_id, numero_boleto
- Código QR de la hoja
  - Contiene: evento_id, [lista de 8 números]
- Diseño profesional listo para imprimir
- Números de cartilla generados automáticamente

**Tecnologías**:
- PDFKit para generación de PDF
- QRCode para códigos QR
- Canvas para diseño de cartillas

**Endpoint**:
```
GET /api/impresion/asignacion/:id/pdf  # Descargar PDF de asignación
GET /api/impresion/evento/:id/vendedor/:vendedorId/pdf  # PDF por vendedor
```

### 8. Módulo de Juego en Tiempo Real (Pendiente)
**Ubicación**: `modules/juego/`

**Funcionalidades**:
- Solo se activa si ventas están cerradas
- Tablero de 90 bolillas
- Marcar bolillas cantadas
- Validación automática en cada bolilla
- Detección automática de ganadores
- WebSocket para actualización en tiempo real
- Historial de bolillas cantadas

**Tablas**:
- `juego_sesiones`: Sesión de juego actual
- `bolillas_cantadas`: Registro de cada bolilla
- `ganadores_bingo`: Ganadores detectados

**Flujo**:
1. Admin inicia sesión de juego
2. Va cantando bolillas (1-90)
3. Sistema valida automáticamente todos los boletos activos
4. Cuando un boleto completa una figura → Alerta automática
5. Admin confirma ganador
6. Se marca como entregado

**WebSocket Events**:
```javascript
// Cliente → Servidor
socket.emit('cantar-bolilla', { eventoId, numero })

// Servidor → Todos
socket.emit('bolilla-cantada', { numero, orden })
socket.emit('ganador-detectado', { boleto, figura, vendedor })
```

### 9. Módulo de Validación Automática (Pendiente)
**Ubicación**: `modules/validacion/`

**Funcionalidades**:
- Algoritmo de validación de figuras
- Compara bolillas cantadas vs numeros_cartilla del boleto
- Valida cada patrón de figura
- Retorna lista de ganadores potenciales

**Lógica**:
```javascript
// Pseudo-código
function validarFigura(boleto, figura, bolillasCantadas) {
  const numerosCartilla = JSON.parse(boleto.numeros_cartilla);
  const patron = JSON.parse(figura.patron_json);

  switch(patron.tipo) {
    case 'linea':
      return validarLinea(numerosCartilla, bolillasCantadas, patron.direccion);
    case 'diagonal':
      return validarDiagonal(numerosCartilla, bolillasCantadas);
    case 'esquinas':
      return validar4Esquinas(numerosCartilla, bolillasCantadas);
    case 'lleno':
      return validarCartonLleno(numerosCartilla, bolillasCantadas);
    // ... más patrones
  }
}
```

---

## Esquema de Base de Datos

### Tablas Principales

#### vendedores
```sql
- id (PK)
- codigo (UNIQUE)
- nombre_completo
- telefono, email, direccion
- activo
- created_at, updated_at
```

#### eventos
```sql
- id (PK)
- nombre
- fecha, hora_inicio
- precio_boleto
- boleto_desde, boleto_hasta
- total_boletos
- estado (programado, en_venta, cerrado, en_juego, finalizado)
- ventas_cerradas (boolean)
- fecha_cierre_ventas
```

#### figuras
```sql
- id (PK)
- nombre
- descripcion
- patron_json (estructura de validación)
- imagen_url
- activo
```

#### evento_figuras (Muchos a Muchos)
```sql
- id (PK)
- evento_id (FK)
- figura_id (FK)
- orden
- premio
- ganador_boleto_id (FK)
- fecha_ganador
```

#### asignacion_boletos
```sql
- id (PK)
- evento_id (FK)
- vendedor_id (FK)
- boleto_desde, boleto_hasta
- cantidad
- fecha_asignacion
- estado
- hoja_qr_code (QR de la hoja)
```

#### boletos_detalle
```sql
- id (PK)
- evento_id (FK)
- asignacion_id (FK)
- numero (número del boleto)
- codigo_qr (UNIQUE - QR individual)
- vendedor_id (FK)
- estado (asignado, vendido, devuelto)
- cliente_nombre, cliente_telefono
- fecha_venta, fecha_devolucion
- precio_venta
- numeros_cartilla (JSON - números de la cartilla)
```

#### devoluciones
```sql
- id (PK)
- asignacion_id (FK)
- vendedor_id (FK)
- evento_id (FK)
- boletos_vendidos, boletos_no_vendidos
- monto_total
- fecha_devolucion
- observaciones
```

#### juego_sesiones
```sql
- id (PK)
- evento_id (FK)
- estado (iniciado, finalizado)
- bolillas_cantadas (array JSON)
- fecha_inicio, fecha_fin
```

#### bolillas_cantadas
```sql
- id (PK)
- sesion_id (FK)
- numero (1-90)
- orden
- fecha_cantada
```

#### ganadores_bingo
```sql
- id (PK)
- evento_id (FK)
- sesion_id (FK)
- evento_figura_id (FK)
- boleto_id (FK)
- figura_id (FK)
- vendedor_id (FK)
- numero_boleto
- cliente_nombre
- bolilla_ganadora
- tiempo_ganador
- premio
- entregado, fecha_entrega
```

---

## Flujo Completo del Sistema

### 1. Preparación
1. Admin crea **figuras** (línea, diagonal, etc.)
2. Admin crea **vendedores**
3. Admin crea **evento** del día
4. Admin asigna **figuras** al evento con sus premios

### 2. Asignación de Boletería
1. Admin asigna rango de boletos a cada vendedor
   - Ej: Vendedor A → boletos 1-100
   - Ej: Vendedor B → boletos 101-200
2. Sistema genera **código QR individual** por boleto
3. Sistema genera **código QR de hoja** (8 boletos)
4. Sistema genera **números de cartilla** aleatoriamente
5. Admin imprime PDFs y entrega a vendedores

### 3. Ventas
1. Vendedores venden boletos a clientes
2. Escanean QR del boleto para registrar venta
3. Ingresan nombre del cliente (opcional)
4. Sistema marca boleto como "vendido"

### 4. Devolución
1. Al final del día, vendedores devuelven boletos no vendidos
2. Sistema valida que estén todos los boletos:
   - Vendidos + No vendidos = Total asignado
3. Registra devolución con montos
4. Calcula comisión del vendedor

### 5. Cierre de Ventas
1. Admin verifica que todos los vendedores devolvieron
2. Admin **cierra ventas** del evento
3. Sistema bloquea nuevas ventas
4. Habilita módulo de juego

### 6. Juego en Tiempo Real
1. Admin inicia **sesión de juego**
2. Pantalla muestra tablero 1-90
3. Admin va cantando bolillas y las marca
4. **Sistema valida automáticamente** cada boleto activo
5. Cuando detecta ganador → **Alerta**
6. Muestra: número de boleto, figura, vendedor, cliente
7. Admin entrega premio y marca como entregado
8. Continúa con siguiente figura

### 7. Cierre
1. Se entregan todos los premios
2. Admin finaliza sesión
3. Sistema genera reportes:
   - Boletos vendidos por vendedor
   - Ingresos totales
   - Comisiones
   - Ganadores y premios entregados

---

## Códigos QR

### QR Individual del Boleto
```json
{
  "tipo": "boleto",
  "evento_id": 1,
  "numero_boleto": 42,
  "codigo": "EVT1-BOL42-ABC123"
}
```

### QR de la Hoja (8 boletos)
```json
{
  "tipo": "hoja",
  "evento_id": 1,
  "vendedor_id": 5,
  "boletos": [1, 2, 3, 4, 5, 6, 7, 8],
  "codigo": "EVT1-HOJA-VND5-001"
}
```

---

## Configuración Apache

Ver archivo: `APACHE_CONFIG.md`

- Proxy reverse a Node.js (puerto 3000)
- Soporte para WebSockets (juego en tiempo real)
- PM2 para mantener proceso corriendo
- Configuración SSL opcional

---

## Instalación

### 1. Dependencias Nuevas

```bash
npm install socket.io qrcode pdfkit canvas
```

### 2. Actualizar Base de Datos

```bash
node scripts/update-database-bingo.js
```

### 3. Configurar Apache

```bash
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers
sudo a2ensite bingo.conf
sudo systemctl restart apache2
```

### 4. Iniciar con PM2

```bash
pm2 start server.js --name bingo
pm2 save
```

---

## Próximos Pasos (Desarrollo)

### Módulos Pendientes
- [ ] Asignación de boletos
- [ ] Devoluciones
- [ ] Figuras
- [ ] Eventos
- [ ] Impresión con QR
- [ ] Juego en tiempo real
- [ ] Validación automática
- [ ] Dashboard de vendedores
- [ ] Reportes

### Interfaces Pendientes
- [ ] Panel de vendedores
- [ ] Asignación de boletería
- [ ] Registro de devoluciones
- [ ] Creación de figuras (editor visual)
- [ ] Creación de eventos
- [ ] **Tablero de juego** (90 bolillas, en tiempo real)
- [ ] Vista de ganadores en tiempo real
- [ ] Reportes e impresión

---

## API Completa (Endpoints Planificados)

```
# Vendedores ✅
POST   /api/vendedores
GET    /api/vendedores
...

# Asignaciones
POST   /api/asignaciones
GET    /api/asignaciones/evento/:id
GET    /api/asignaciones/vendedor/:id

# Devoluciones
POST   /api/devoluciones
GET    /api/devoluciones/evento/:id

# Boletos Detalle
GET    /api/boletos-detalle/qr/:codigo
POST   /api/boletos-detalle/:id/vender
GET    /api/boletos-detalle/evento/:id

# Figuras
POST   /api/figuras
GET    /api/figuras
PUT    /api/figuras/:id

# Eventos
POST   /api/eventos
POST   /api/eventos/:id/figuras
POST   /api/eventos/:id/cerrar-ventas
GET    /api/eventos/:id/estado

# Impresión
GET    /api/impresion/asignacion/:id/pdf
GET    /api/impresion/evento/:id/preview

# Juego
POST   /api/juego/iniciar
POST   /api/juego/cantar-bolilla
GET    /api/juego/sesion/:id/estado
POST   /api/juego/confirmar-ganador
POST   /api/juego/finalizar

# WebSocket (socket.io)
cantar-bolilla
bolilla-cantada
ganador-detectado
sesion-actualizada
```

---

## Tecnologías Completas

- **Backend**: Node.js, Express.js, Socket.IO
- **Base de Datos**: PostgreSQL
- **Servidor Web**: Apache (proxy reverse)
- **Frontend**: HTML5, CSS3, JavaScript, WebSockets
- **Generación PDF**: PDFKit
- **Códigos QR**: qrcode, canvas
- **Proceso**: PM2

---

Este es el sistema completo planificado. El módulo de vendedores ya está implementado. Los demás módulos se implementarán según prioridad.
