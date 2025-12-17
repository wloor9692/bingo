/**
 * Script de inicialización de base de datos
 * Crea todas las tablas necesarias para el sistema de rifas
 */

const { pool } = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Iniciando creación de tablas...');

    await client.query('BEGIN');

    // Tabla: rifas
    await client.query(`
      CREATE TABLE IF NOT EXISTS rifas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        fecha_sorteo DATE NOT NULL,
        premio VARCHAR(500) NOT NULL,
        precio_boleto DECIMAL(10, 2) NOT NULL,
        numero_inicial INTEGER NOT NULL DEFAULT 0,
        numero_final INTEGER NOT NULL DEFAULT 99,
        estado VARCHAR(50) DEFAULT 'activa',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "rifas" creada');

    // Tabla: boletos
    await client.query(`
      CREATE TABLE IF NOT EXISTS boletos (
        id SERIAL PRIMARY KEY,
        rifa_id INTEGER NOT NULL REFERENCES rifas(id) ON DELETE CASCADE,
        numero INTEGER NOT NULL,
        codigo_barras VARCHAR(100) UNIQUE NOT NULL,
        estado VARCHAR(50) DEFAULT 'disponible',
        cliente_nombre VARCHAR(255),
        cliente_telefono VARCHAR(20),
        fecha_venta TIMESTAMP,
        vendedor VARCHAR(255),
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(rifa_id, numero)
      );
    `);
    console.log('✅ Tabla "boletos" creada');

    // Índice para búsqueda rápida por código de barras
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_boletos_codigo_barras
      ON boletos(codigo_barras);
    `);

    // Tabla: numeros_ganadores
    await client.query(`
      CREATE TABLE IF NOT EXISTS numeros_ganadores (
        id SERIAL PRIMARY KEY,
        rifa_id INTEGER NOT NULL REFERENCES rifas(id) ON DELETE CASCADE,
        numero_ganador INTEGER NOT NULL,
        posicion VARCHAR(50) DEFAULT '1er lugar',
        premio_descripcion TEXT,
        fecha_sorteo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(rifa_id, numero_ganador, posicion)
      );
    `);
    console.log('✅ Tabla "numeros_ganadores" creada');

    // Tabla: ventas_diarias
    await client.query(`
      CREATE TABLE IF NOT EXISTS ventas_diarias (
        id SERIAL PRIMARY KEY,
        rifa_id INTEGER NOT NULL REFERENCES rifas(id) ON DELETE CASCADE,
        fecha_venta DATE NOT NULL,
        boleto_id INTEGER NOT NULL REFERENCES boletos(id) ON DELETE CASCADE,
        precio_venta DECIMAL(10, 2) NOT NULL,
        vendedor VARCHAR(255),
        forma_pago VARCHAR(50) DEFAULT 'efectivo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "ventas_diarias" creada');

    // Índice para reportes por fecha
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_ventas_fecha
      ON ventas_diarias(fecha_venta);
    `);

    // Tabla: entregas_premios
    await client.query(`
      CREATE TABLE IF NOT EXISTS entregas_premios (
        id SERIAL PRIMARY KEY,
        rifa_id INTEGER NOT NULL REFERENCES rifas(id) ON DELETE CASCADE,
        boleto_id INTEGER NOT NULL REFERENCES boletos(id) ON DELETE CASCADE,
        numero_ganador_id INTEGER NOT NULL REFERENCES numeros_ganadores(id) ON DELETE CASCADE,
        ganador_nombre VARCHAR(255) NOT NULL,
        ganador_identificacion VARCHAR(50),
        ganador_telefono VARCHAR(20),
        ganador_email VARCHAR(255),
        fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        premio_entregado TEXT NOT NULL,
        responsable_entrega VARCHAR(255),
        observaciones TEXT,
        foto_comprobante VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "entregas_premios" creada');

    // Tabla: usuarios (opcional, para control de acceso)
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        nombre_completo VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'vendedor',
        email VARCHAR(255),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);
    console.log('✅ Tabla "usuarios" creada');

    // Tabla: auditoria (para registro de operaciones importantes)
    await client.query(`
      CREATE TABLE IF NOT EXISTS auditoria (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        accion VARCHAR(255) NOT NULL,
        tabla_afectada VARCHAR(100),
        registro_id INTEGER,
        detalles TEXT,
        ip_address VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "auditoria" creada');

    // Crear función para actualizar updated_at automáticamente
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Trigger para actualizar updated_at en rifas
    await client.query(`
      DROP TRIGGER IF EXISTS update_rifas_updated_at ON rifas;
      CREATE TRIGGER update_rifas_updated_at
      BEFORE UPDATE ON rifas
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Triggers creados');

    await client.query('COMMIT');
    console.log('');
    console.log('🎉 ¡Base de datos inicializada correctamente!');
    console.log('');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al crear tablas:', error.message);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

// Ejecutar
createTables()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
