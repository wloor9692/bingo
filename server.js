/**
 * Servidor Principal - Sistema de Gestión de Rifas
 * Backend con Express.js
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Importar rutas de módulos
const rifasRoutes = require('./modules/rifas/rifas.routes');
const boletosRoutes = require('./modules/boletos/boletos.routes');
const ganadoresRoutes = require('./modules/ganadores/ganadores.routes');
const premiosRoutes = require('./modules/premios/premios.routes');
const ventasRoutes = require('./modules/ventas/ventas.routes');
const entregasRoutes = require('./modules/entregas/entregas.routes');
const vendedoresRoutes = require('./modules/vendedores/vendedores.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y utilidad
app.use(helmet({
  contentSecurityPolicy: false, // Desactivar para desarrollo
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (Frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de API por módulos
app.use('/api/rifas', rifasRoutes);
app.use('/api/boletos', boletosRoutes);
app.use('/api/ganadores', ganadoresRoutes);
app.use('/api/premios', premiosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/entregas', entregasRoutes);
app.use('/api/vendedores', vendedoresRoutes);

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Sistema de Rifas funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// Ruta principal - servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Verificar conexión a base de datos
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      console.log('Por favor verifica tu archivo .env y que PostgreSQL esté corriendo');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('');
      console.log('🎰 ====================================');
      console.log('   Sistema de Gestión de Rifas');
      console.log('   ====================================');
      console.log(`   🚀 Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`   🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   📊 Base de datos: ${process.env.DB_NAME}`);
      console.log('   ====================================');
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
