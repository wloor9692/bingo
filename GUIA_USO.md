# Guía de Uso - Sistema de Gestión de Rifas

## Tabla de Contenidos

1. [Inicio Rápido](#inicio-rápido)
2. [Gestión de Rifas](#gestión-de-rifas)
3. [Gestión de Boletos](#gestión-de-boletos)
4. [Números Ganadores](#números-ganadores)
5. [Consulta de Premios](#consulta-de-premios)
6. [Ventas Diarias](#ventas-diarias)
7. [Entrega de Premios](#entrega-de-premios)
8. [API REST](#api-rest)

---

## Inicio Rápido

### 1. Crear una nueva rifa

1. Ir a la sección **Rifas**
2. Click en el botón **+ Nueva Rifa**
3. Completar el formulario:
   - **Nombre**: Nombre descriptivo de la rifa
   - **Fecha del Sorteo**: Cuándo se realizará el sorteo
   - **Premio**: Descripción del premio
   - **Precio del Boleto**: Cuánto cuesta cada boleto
   - **Número Inicial/Final**: Rango de números (ej: 0-99 para 100 boletos)
4. Click en **Guardar Rifa**

### 2. Generar boletos

1. Ir a la sección **Boletos**
2. Seleccionar la rifa en el dropdown
3. Click en **Generar Boletos**
4. Confirmar la acción

Los boletos se generarán automáticamente con códigos de barras únicos.

### 3. Vender boletos

Hay dos formas de vender boletos:

**Opción A: Desde la tabla de boletos**
1. Ir a **Boletos** y seleccionar la rifa
2. Click en el botón **Vender** del boleto deseado
3. Ingresar nombre y teléfono del cliente

**Opción B: Por código de barras**
1. Ir a **Consulta Premios**
2. Escanear el código de barras del boleto
3. Si está disponible, usar la opción de venta

### 4. Registrar números ganadores

1. Realizar el sorteo (externamente)
2. Ir a la sección **Números Ganadores**
3. Click en **+ Registrar Ganador**
4. Seleccionar la rifa
5. Ingresar el número ganador y posición (1er lugar, 2do lugar, etc.)
6. Click en **Registrar**

### 5. Consultar si un boleto ganó

**Con lector de código de barras:**
1. Ir a **Consulta Premios**
2. Escanear el código de barras
3. El sistema mostrará inmediatamente si es ganador

**Sin lector (manual):**
1. Ir a **Consulta Premios**
2. Seleccionar la rifa
3. Ingresar el número del boleto
4. Click en **Consultar**

### 6. Registrar entrega de premio

1. Ir a **Entregas**
2. Click en **+ Registrar Entrega**
3. Seleccionar la rifa
4. Seleccionar el boleto ganador
5. Completar datos del ganador:
   - Nombre completo
   - Identificación
   - Teléfono
   - Email
6. Confirmar el premio entregado
7. Click en **Registrar Entrega**

---

## Gestión de Rifas

### Crear Rifa

Campos obligatorios:
- **Nombre**: Identificador único de la rifa
- **Fecha del Sorteo**: Fecha programada
- **Premio**: Descripción del premio principal
- **Precio del Boleto**: Valor en moneda local

Campos opcionales:
- **Descripción**: Información adicional
- **Número Inicial/Final**: Por defecto 0-99 (100 boletos)

### Estados de Rifa

- **Activa**: Rifa en proceso de venta
- **Finalizada**: Sorteo realizado, no se pueden vender más boletos
- **Cancelada**: Rifa cancelada
- **Pausada**: Temporalmente suspendida

### Cambiar Estado

1. En la tarjeta de la rifa, click en el botón de estado
2. Confirmar el cambio

### Ver Estadísticas

Click en **Estadísticas** para ver:
- Total de boletos
- Boletos vendidos
- Boletos disponibles
- Porcentaje de venta
- Ingresos totales
- Ingresos potenciales

---

## Gestión de Boletos

### Generar Boletos

Los boletos se generan automáticamente según el rango definido en la rifa.

**Código de Barras:**
Formato: `RIFA-[ID_RIFA]-[NUMERO]-[TIMESTAMP]`
Ejemplo: `RIFA-1-0042-123456`

### Vender Boleto

1. Localizar el boleto en la tabla
2. Click en **Vender**
3. Ingresar:
   - Nombre del cliente
   - Teléfono (opcional pero recomendado)
4. Confirmar

El sistema automáticamente:
- Cambia el estado a "vendido"
- Registra la fecha de venta
- Crea un registro en ventas diarias

### Cancelar Venta

Si se vendió un boleto por error:
1. Localizar el boleto vendido
2. Click en **Cancelar**
3. Confirmar

El boleto volverá a estar disponible.

### Eliminar Todos los Boletos

⚠️ **Precaución**: Esta acción elimina todos los boletos de una rifa.

Solo usar si necesitas regenerar los boletos desde cero.

---

## Números Ganadores

### Registrar Ganador

**Importante**: Primero realiza el sorteo físico o digital de forma externa.

1. Click en **+ Registrar Ganador**
2. Seleccionar la rifa
3. Ingresar el número ganador
4. Especificar la posición:
   - 1er lugar
   - 2do lugar
   - 3er lugar
   - Etc.
5. (Opcional) Descripción específica del premio para esa posición

### Múltiples Ganadores

Si tu rifa tiene varios premios (1er, 2do, 3er lugar):
1. Registra cada ganador individualmente
2. Especifica la posición de cada uno

### Verificar Ganadores

La tabla muestra:
- Rifa
- Número ganador
- Posición
- Premio
- Cliente (si el boleto fue vendido)
- Fecha del sorteo

---

## Consulta de Premios

### Con Lector de Código de Barras

Esta es la forma más rápida y profesional.

**Configuración del lector:**
1. Configurar el lector en modo "teclado" (keyboard emulation)
2. El lector debe enviar ENTER automáticamente después del código

**Uso:**
1. Posicionar el cursor en el campo "Escanear Código"
2. Escanear el boleto
3. El resultado aparecerá automáticamente

### Consulta Manual

Sin lector de códigos:
1. Seleccionar la rifa del dropdown
2. Ingresar el número del boleto
3. Click en **Consultar**

### Interpretación de Resultados

**Boleto Ganador:**
- Pantalla verde con animación
- Muestra el número, rifa, y premio
- Indica si el premio ya fue entregado

**Boleto NO Ganador:**
- Pantalla con borde rojo
- Mensaje claro de que no es ganador

**Boleto No Vendido:**
- Alerta de que el boleto no ha sido vendido
- No se puede verificar premio

**Boleto No Válido:**
- El código no existe en el sistema
- Verificar que el código esté correcto

---

## Ventas Diarias

### Consultar Ventas

1. Ir a **Ventas**
2. Seleccionar la fecha
3. Click en **Consultar**

### Información Mostrada

**Estadísticas:**
- Total de ventas del día
- Ingresos totales
- Precio promedio por boleto

**Tabla de Ventas:**
- Fecha
- Rifa
- Número de boleto
- Cliente
- Precio
- Vendedor
- Forma de pago

### Exportar Ventas

Los datos pueden ser copiados de la tabla para reportes en Excel.

### Resumen por Vendedor

Si tienes múltiples vendedores, puedes ver las ventas de cada uno.

---

## Entrega de Premios

### Proceso de Entrega

1. Click en **+ Registrar Entrega**
2. Seleccionar la rifa
3. Seleccionar el boleto ganador del dropdown
4. Completar información del ganador:
   - **Nombre Completo** (obligatorio)
   - **Identificación** (recomendado para respaldo legal)
   - **Teléfono**
   - **Email**
5. Confirmar el premio entregado
6. Nombre del responsable de la entrega
7. Observaciones (opcional)

### Importante

- Solo aparecen en el dropdown los boletos que son ganadores
- Una vez registrada la entrega, el sistema marca el premio como entregado
- Al consultar ese boleto nuevamente, mostrará "PREMIO YA ENTREGADO"

### Respaldo

Toda la información queda registrada en la base de datos:
- Fecha y hora de entrega
- Datos del ganador
- Responsable de la entrega
- Observaciones

### Ver Historial

La tabla muestra todas las entregas realizadas con:
- Fecha
- Rifa
- Número de boleto
- Ganador
- Premio entregado
- Responsable

---

## API REST

El sistema incluye una API REST completa para integraciones.

### Base URL

```
http://localhost:3000/api
```

### Endpoints Principales

#### Rifas

```
GET    /api/rifas                    # Listar rifas
POST   /api/rifas                    # Crear rifa
GET    /api/rifas/:id                # Obtener rifa
PUT    /api/rifas/:id                # Actualizar rifa
DELETE /api/rifas/:id                # Eliminar rifa
PATCH  /api/rifas/:id/estado         # Cambiar estado
GET    /api/rifas/:id/estadisticas   # Estadísticas
```

#### Boletos

```
POST   /api/boletos/generar/:rifaId           # Generar boletos
GET    /api/boletos/rifa/:rifaId              # Listar boletos por rifa
GET    /api/boletos/codigo/:codigoBarras     # Buscar por código
PUT    /api/boletos/:id/vender               # Vender boleto
PUT    /api/boletos/:id/cancelar             # Cancelar venta
DELETE /api/boletos/rifa/:rifaId             # Eliminar todos
```

#### Ganadores

```
POST   /api/ganadores                         # Registrar ganador
GET    /api/ganadores                         # Listar todos
GET    /api/ganadores/rifa/:rifaId           # Por rifa
GET    /api/ganadores/verificar/:rifaId/:numero  # Verificar número
```

#### Premios

```
GET    /api/premios/codigo/:codigoBarras     # Consultar por código
GET    /api/premios/numero/:rifaId/:numero   # Consultar por número
GET    /api/premios/pendientes               # Ganadores pendientes
```

#### Ventas

```
POST   /api/ventas                            # Registrar venta
GET    /api/ventas/fecha/:fecha              # Ventas por fecha
GET    /api/ventas/resumen/:fecha            # Resumen diario
```

#### Entregas

```
POST   /api/entregas                          # Registrar entrega
GET    /api/entregas                          # Listar entregas
GET    /api/entregas/rifa/:rifaId            # Por rifa
```

### Ejemplo de Uso

**Crear una rifa:**

```bash
curl -X POST http://localhost:3000/api/rifas \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Rifa Navideña 2024",
    "fecha_sorteo": "2024-12-24",
    "premio": "Auto 0km",
    "precio_boleto": 100,
    "numero_inicial": 0,
    "numero_final": 999
  }'
```

**Consultar premio:**

```bash
curl http://localhost:3000/api/premios/codigo/RIFA-1-0042-123456
```

---

## Consejos y Mejores Prácticas

### 1. Flujo Recomendado

1. Crear rifa
2. Generar boletos
3. Vender boletos
4. Realizar sorteo
5. Registrar ganadores
6. Verificar boletos ganadores
7. Entregar premios

### 2. Respaldo de Datos

Realiza copias de seguridad de la base de datos periódicamente:

```bash
pg_dump rifa_db > backup_$(date +%Y%m%d).sql
```

### 3. Códigos de Barras

- Usa etiquetas con códigos de barras Code 128 o Code 39
- Imprime el número del boleto también en texto legible
- Incluye el nombre de la rifa en el boleto físico

### 4. Seguridad

- Cambia las credenciales por defecto en `.env`
- No compartas el acceso a la base de datos
- Mantén respaldos en ubicación segura

### 5. Rendimiento

- El sistema puede manejar rifas con miles de boletos
- Para rifas muy grandes (+10,000 boletos), considera paginar resultados
- Usa índices de base de datos (ya configurados)

---

## Solución de Problemas

### El lector de códigos no funciona

1. Verificar que esté en modo "keyboard emulation"
2. Verificar que envíe ENTER al final
3. Probar manualmente ingresando el código

### No aparecen los boletos

1. Verificar que se hayan generado los boletos
2. Seleccionar la rifa correcta en el dropdown
3. Revisar consola del navegador para errores

### Error al generar boletos

- Asegúrate de no haber generado boletos previamente
- Si necesitas regenerar, elimina los boletos existentes primero

### No se puede registrar ganador

- Verifica que el número esté en el rango de la rifa
- Verifica que exista un boleto con ese número
- No puedes registrar el mismo número dos veces para la misma posición

---

## Soporte

Para reportar problemas o sugerencias:
1. Revisar esta guía primero
2. Verificar los logs del servidor
3. Crear un issue en el repositorio con detalles completos

---

**Última actualización**: Diciembre 2024
