# API Documentation - Sistema de Gestión de Rifas

## Información General

**Base URL**: `http://localhost:3000/api`

**Content-Type**: `application/json`

Todas las respuestas siguen el formato:

```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { /* datos de respuesta */ }
}
```

---

## Módulo: Rifas

### Listar Rifas

```http
GET /api/rifas
GET /api/rifas?estado=activa
```

**Parámetros Query (opcionales):**
- `estado`: `activa`, `finalizada`, `cancelada`, `pausada`

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Rifa Navideña",
      "descripcion": "Rifa especial de fin de año",
      "fecha_sorteo": "2024-12-24",
      "premio": "Auto 0km",
      "precio_boleto": 100,
      "numero_inicial": 0,
      "numero_final": 999,
      "estado": "activa",
      "created_at": "2024-12-01T10:00:00Z",
      "updated_at": "2024-12-01T10:00:00Z"
    }
  ],
  "total": 1
}
```

### Crear Rifa

```http
POST /api/rifas
```

**Body:**
```json
{
  "nombre": "Rifa Navideña",
  "descripcion": "Rifa especial de fin de año",
  "fecha_sorteo": "2024-12-24",
  "premio": "Auto 0km",
  "precio_boleto": 100,
  "numero_inicial": 0,
  "numero_final": 999
}
```

**Campos obligatorios:**
- `nombre`
- `fecha_sorteo`
- `premio`
- `precio_boleto`

### Obtener Rifa por ID

```http
GET /api/rifas/:id
```

### Actualizar Rifa

```http
PUT /api/rifas/:id
```

**Body** (todos los campos opcionales):
```json
{
  "nombre": "Nuevo nombre",
  "precio_boleto": 150
}
```

### Eliminar Rifa

```http
DELETE /api/rifas/:id
```

⚠️ **Advertencia**: Elimina todos los boletos, ventas y registros relacionados.

### Cambiar Estado de Rifa

```http
PATCH /api/rifas/:id/estado
```

**Body:**
```json
{
  "estado": "finalizada"
}
```

**Estados válidos:**
- `activa`
- `finalizada`
- `cancelada`
- `pausada`

### Obtener Estadísticas de Rifa

```http
GET /api/rifas/:id/estadisticas
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "rifa": {
      "id": 1,
      "nombre": "Rifa Navideña",
      "estado": "activa",
      "fecha_sorteo": "2024-12-24"
    },
    "boletos": {
      "total": 1000,
      "vendidos": 750,
      "disponibles": 250,
      "porcentaje_vendido": "75.00"
    },
    "ingresos": {
      "total": 75000,
      "ingreso_potencial": 100000
    },
    "premios": {
      "entregados": 0
    }
  }
}
```

---

## Módulo: Boletos

### Generar Boletos para Rifa

```http
POST /api/boletos/generar/:rifaId
```

Genera todos los boletos automáticamente según el rango definido en la rifa.

**Respuesta:**
```json
{
  "success": true,
  "message": "1000 boletos generados exitosamente",
  "data": [
    {
      "id": 1,
      "rifa_id": 1,
      "numero": 0,
      "codigo_barras": "RIFA-1-0000-123456",
      "estado": "disponible",
      "created_at": "2024-12-01T10:00:00Z"
    }
  ]
}
```

### Listar Boletos por Rifa

```http
GET /api/boletos/rifa/:rifaId
GET /api/boletos/rifa/:rifaId?estado=vendido
```

**Parámetros Query:**
- `estado`: `disponible`, `vendido`

### Obtener Boleto por ID

```http
GET /api/boletos/:id
```

### Buscar Boleto por Código de Barras

```http
GET /api/boletos/codigo/:codigoBarras
```

**Ejemplo:**
```http
GET /api/boletos/codigo/RIFA-1-0042-123456
```

### Vender Boleto

```http
PUT /api/boletos/:id/vender
```

**Body:**
```json
{
  "cliente_nombre": "Juan Pérez",
  "cliente_telefono": "555-1234",
  "vendedor": "María González",
  "observaciones": "Pago en efectivo"
}
```

**Campos obligatorios:**
- Ninguno (pero se recomienda `cliente_nombre`)

**Respuesta:**
```json
{
  "success": true,
  "message": "Boleto vendido exitosamente",
  "data": {
    "id": 42,
    "numero": 42,
    "codigo_barras": "RIFA-1-0042-123456",
    "estado": "vendido",
    "cliente_nombre": "Juan Pérez",
    "cliente_telefono": "555-1234",
    "fecha_venta": "2024-12-01T15:30:00Z"
  }
}
```

### Cancelar Venta de Boleto

```http
PUT /api/boletos/:id/cancelar
```

Devuelve el boleto al estado `disponible`.

### Eliminar Todos los Boletos de una Rifa

```http
DELETE /api/boletos/rifa/:rifaId
```

---

## Módulo: Números Ganadores

### Registrar Número Ganador

```http
POST /api/ganadores
```

**Body:**
```json
{
  "rifa_id": 1,
  "numero_ganador": 42,
  "posicion": "1er lugar",
  "premio_descripcion": "Auto 0km Toyota"
}
```

**Campos obligatorios:**
- `rifa_id`
- `numero_ganador`

**Validaciones:**
- El número debe estar en el rango de la rifa
- Debe existir un boleto con ese número
- No se puede registrar el mismo número dos veces para la misma posición

### Registrar Múltiples Ganadores

```http
POST /api/ganadores/multiples/:rifaId
```

**Body:**
```json
{
  "ganadores": [
    {
      "numero_ganador": 42,
      "posicion": "1er lugar",
      "premio_descripcion": "Auto 0km"
    },
    {
      "numero_ganador": 17,
      "posicion": "2do lugar",
      "premio_descripcion": "Moto"
    },
    {
      "numero_ganador": 88,
      "posicion": "3er lugar",
      "premio_descripcion": "TV 55 pulgadas"
    }
  ]
}
```

### Listar Todos los Ganadores

```http
GET /api/ganadores
```

### Obtener Ganadores por Rifa

```http
GET /api/ganadores/rifa/:rifaId
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rifa_id": 1,
      "numero_ganador": 42,
      "posicion": "1er lugar",
      "premio_descripcion": "Auto 0km",
      "fecha_sorteo": "2024-12-24T12:00:00Z",
      "rifa_nombre": "Rifa Navideña",
      "codigo_barras": "RIFA-1-0042-123456",
      "cliente_nombre": "Juan Pérez",
      "cliente_telefono": "555-1234"
    }
  ],
  "total": 1
}
```

### Verificar si un Número es Ganador

```http
GET /api/ganadores/verificar/:rifaId/:numero
```

**Ejemplo:**
```http
GET /api/ganadores/verificar/1/42
```

**Respuesta (si es ganador):**
```json
{
  "success": true,
  "data": {
    "es_ganador": true,
    "numero": 42,
    "mensaje": "¡FELICIDADES! Este número es GANADOR",
    "detalles": {
      "id": 1,
      "numero_ganador": 42,
      "posicion": "1er lugar",
      "premio_descripcion": "Auto 0km",
      "rifa_nombre": "Rifa Navideña",
      "cliente_nombre": "Juan Pérez"
    }
  }
}
```

**Respuesta (si NO es ganador):**
```json
{
  "success": true,
  "data": {
    "es_ganador": false,
    "numero": 42,
    "mensaje": "Este número no es ganador"
  }
}
```

### Eliminar Ganador

```http
DELETE /api/ganadores/:id
```

---

## Módulo: Consulta de Premios

### Consultar Premio por Código de Barras

```http
GET /api/premios/codigo/:codigoBarras
```

**Ideal para lectores de códigos de barras.**

**Respuesta (Ganador):**
```json
{
  "success": true,
  "data": {
    "existe": true,
    "es_ganador": true,
    "mensaje": "¡FELICIDADES! BOLETO GANADOR",
    "alerta": "🎉 ¡GANADOR! 🎉",
    "premio_entregado": false,
    "boleto": {
      "numero": 42,
      "codigo_barras": "RIFA-1-0042-123456",
      "cliente": "Juan Pérez",
      "telefono": "555-1234"
    },
    "rifa": {
      "nombre": "Rifa Navideña",
      "fecha_sorteo": "2024-12-24",
      "premio": "Auto 0km Toyota"
    },
    "ganador": {
      "posicion": "1er lugar",
      "fecha_sorteo": "2024-12-24T12:00:00Z"
    },
    "entrega": null
  }
}
```

**Respuesta (No Ganador):**
```json
{
  "success": true,
  "data": {
    "existe": true,
    "es_ganador": false,
    "mensaje": "Este boleto no tiene premio",
    "alerta": "NO ES GANADOR",
    "boleto": {
      "numero": 42,
      "codigo_barras": "RIFA-1-0042-123456",
      "cliente": "Juan Pérez",
      "telefono": "555-1234"
    }
  }
}
```

**Respuesta (Premio Ya Entregado):**
```json
{
  "success": true,
  "data": {
    "existe": true,
    "es_ganador": true,
    "mensaje": "¡PREMIO YA ENTREGADO!",
    "alerta": "PREMIO YA ENTREGADO",
    "premio_entregado": true,
    "entrega": {
      "fecha": "2024-12-25T10:00:00Z",
      "nombre_ganador": "Juan Pérez"
    }
  }
}
```

### Consultar Premio por Número (Manual)

```http
GET /api/premios/numero/:rifaId/:numero
```

**Ejemplo:**
```http
GET /api/premios/numero/1/42
```

### Obtener Ganadores Pendientes de Entrega

```http
GET /api/premios/pendientes
```

Lista todos los boletos ganadores que aún no han sido entregados.

### Búsqueda Avanzada de Premios

```http
GET /api/premios/buscar?rifa_id=1&entregado=false
```

**Parámetros Query:**
- `rifa_id`: ID de la rifa
- `fecha_desde`: Fecha inicial (YYYY-MM-DD)
- `fecha_hasta`: Fecha final (YYYY-MM-DD)
- `entregado`: `true` o `false`

---

## Módulo: Ventas

### Registrar Venta

```http
POST /api/ventas
```

**Body:**
```json
{
  "rifa_id": 1,
  "boleto_id": 42,
  "precio_venta": 100,
  "vendedor": "María González",
  "forma_pago": "efectivo",
  "fecha_venta": "2024-12-01"
}
```

**Campos obligatorios:**
- `rifa_id`
- `boleto_id`
- `precio_venta`

**Formas de pago válidas:**
- `efectivo`
- `tarjeta`
- `transferencia`

### Obtener Ventas por Fecha

```http
GET /api/ventas/fecha/:fecha
```

**Ejemplo:**
```http
GET /api/ventas/fecha/2024-12-01
```

### Obtener Ventas por Rifa

```http
GET /api/ventas/rifa/:rifaId
```

### Obtener Resumen Diario

```http
GET /api/ventas/resumen/:fecha
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "fecha_venta": "2024-12-01",
    "total_ventas": 250,
    "ingresos_totales": 25000,
    "precio_promedio": 100,
    "rifas_activas": 2,
    "vendedores_activos": 3,
    "por_forma_pago": [
      {
        "forma_pago": "efectivo",
        "cantidad": 180,
        "total": 18000
      },
      {
        "forma_pago": "tarjeta",
        "cantidad": 70,
        "total": 7000
      }
    ]
  }
}
```

### Obtener Resumen por Rango de Fechas

```http
GET /api/ventas/resumen/:fechaInicio/:fechaFin
```

**Ejemplo:**
```http
GET /api/ventas/resumen/2024-12-01/2024-12-31
```

### Obtener Resumen por Vendedor

```http
GET /api/ventas/vendedor/:vendedor
GET /api/ventas/vendedor/:vendedor?fechaInicio=2024-12-01&fechaFin=2024-12-31
```

### Obtener Ventas con Filtros

```http
GET /api/ventas?rifaId=1&vendedor=Maria&forma_pago=efectivo
```

### Eliminar Venta

```http
DELETE /api/ventas/:id
```

---

## Módulo: Entregas de Premios

### Registrar Entrega

```http
POST /api/entregas
```

**Body:**
```json
{
  "rifa_id": 1,
  "boleto_id": 42,
  "numero_ganador_id": 1,
  "ganador_nombre": "Juan Pérez",
  "ganador_identificacion": "12345678",
  "ganador_telefono": "555-1234",
  "ganador_email": "juan@example.com",
  "premio_entregado": "Auto Toyota 0km",
  "responsable_entrega": "María González",
  "observaciones": "Entrega realizada en oficina principal"
}
```

**Campos obligatorios:**
- `rifa_id`
- `boleto_id`
- `numero_ganador_id`
- `ganador_nombre`
- `premio_entregado`

**Validaciones:**
- El boleto debe ser un ganador válido
- No puede haber una entrega previa para el mismo boleto

### Listar Entregas

```http
GET /api/entregas
GET /api/entregas?rifaId=1
```

### Obtener Entregas por Rifa

```http
GET /api/entregas/rifa/:rifaId
```

### Obtener Entrega por ID

```http
GET /api/entregas/:id
```

### Actualizar Entrega

```http
PUT /api/entregas/:id
```

**Body** (todos los campos opcionales):
```json
{
  "ganador_telefono": "555-9999",
  "observaciones": "Actualizado número de teléfono"
}
```

### Eliminar Entrega

```http
DELETE /api/entregas/:id
```

### Obtener Estadísticas de Entregas

```http
GET /api/entregas/estadisticas
GET /api/entregas/estadisticas?rifaId=1
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total_entregas": 5,
    "rifas_con_entregas": 2,
    "responsables_activos": 3,
    "primera_entrega": "2024-12-10T10:00:00Z",
    "ultima_entrega": "2024-12-15T16:30:00Z",
    "premios_pendientes": 2
  }
}
```

---

## Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request (datos inválidos)
- `404` - Not Found
- `500` - Internal Server Error

---

## Manejo de Errores

Todas las respuestas de error siguen el formato:

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

**Ejemplos de errores:**

```json
{
  "success": false,
  "message": "Faltan campos obligatorios: nombre, premio"
}
```

```json
{
  "success": false,
  "message": "Rifa no encontrada"
}
```

```json
{
  "success": false,
  "message": "Ya existen 100 boletos para esta rifa"
}
```

---

## Testing con cURL

### Crear una Rifa

```bash
curl -X POST http://localhost:3000/api/rifas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Rifa de Prueba",
    "fecha_sorteo": "2024-12-31",
    "premio": "Premio de Prueba",
    "precio_boleto": 50,
    "numero_inicial": 0,
    "numero_final": 99
  }'
```

### Generar Boletos

```bash
curl -X POST http://localhost:3000/api/boletos/generar/1
```

### Consultar Premio

```bash
curl http://localhost:3000/api/premios/codigo/RIFA-1-0042-123456
```

### Registrar Ganador

```bash
curl -X POST http://localhost:3000/api/ganadores \
  -H "Content-Type: application/json" \
  -d '{
    "rifa_id": 1,
    "numero_ganador": 42,
    "posicion": "1er lugar"
  }'
```

---

## Rate Limiting

Actualmente no hay límite de requests, pero se recomienda:
- No más de 100 requests por minuto por IP
- Para operaciones masivas, usar endpoints batch cuando estén disponibles

---

## Autenticación

En la versión actual no hay autenticación requerida.

Para producción, se recomienda implementar:
- JWT tokens
- API Keys
- OAuth 2.0

---

**Última actualización**: Diciembre 2024
