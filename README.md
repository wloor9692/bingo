# Sistema Profesional de Gestión de Rifas

Sistema web completo para la administración y gestión de rifas diarias con control de boletos, números ganadores, ventas y entrega de premios.

## Características

- ✅ Creación y gestión de rifas diarias
- ✅ Generación automática de boletos con códigos de barras
- ✅ Registro de números ganadores por sorteo
- ✅ Consulta de premios (manual o por lector de códigos de barras)
- ✅ Control de ventas diarias
- ✅ Registro de entrega de premios
- ✅ Reportes y respaldos
- ✅ Interfaz web profesional y responsiva

## Tecnologías

- **Backend**: Node.js + Express.js
- **Base de Datos**: PostgreSQL
- **Frontend**: HTML5 + CSS3 + JavaScript

## Instalación

### Requisitos previos

- Node.js (v14 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### Pasos de instalación

1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd bingo
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Crear la base de datos
```bash
# Acceder a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE rifa_db;
\q
```

5. Inicializar las tablas
```bash
npm run init-db
```

6. Iniciar el servidor
```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

7. Acceder a la aplicación
```
http://localhost:3000
```

## Estructura del Proyecto

```
bingo/
├── config/              # Configuraciones
│   └── database.js      # Configuración de PostgreSQL
├── modules/             # Módulos del sistema
│   ├── rifas/          # Gestión de rifas
│   ├── boletos/        # Gestión de boletos
│   ├── ganadores/      # Números ganadores
│   ├── premios/        # Consulta de premios
│   ├── ventas/         # Ventas diarias
│   └── entregas/       # Entrega de premios
├── public/             # Archivos estáticos (Frontend)
│   ├── css/
│   ├── js/
│   └── index.html
├── scripts/            # Scripts de utilidad
│   └── init-database.js
├── server.js           # Servidor principal
├── .env.example        # Ejemplo de variables de entorno
└── package.json
```

## Uso

### Crear una nueva rifa
1. Acceder al panel de rifas
2. Click en "Nueva Rifa"
3. Completar información (fecha, premio, rango de números)
4. Guardar

### Generar boletos
1. Seleccionar la rifa activa
2. Click en "Generar Boletos"
3. Los boletos se crean automáticamente con códigos únicos

### Registrar número ganador
1. Ir a "Números Ganadores"
2. Seleccionar la rifa
3. Ingresar el/los números ganadores
4. Guardar

### Consultar premios
1. Ir a "Consulta de Premios"
2. Ingresar número de boleto manualmente o escanear código de barras
3. El sistema mostrará si el boleto es ganador

### Ver ventas diarias
1. Ir a "Ventas"
2. Seleccionar fecha
3. Ver resumen de ventas del día

## Seguridad

- Validación de datos en backend
- Protección contra SQL injection
- Headers de seguridad con Helmet
- Autenticación con JWT (opcional para futuras mejoras)

## Licencia

MIT

## Soporte

Para reportar problemas o sugerencias, crear un issue en el repositorio.
