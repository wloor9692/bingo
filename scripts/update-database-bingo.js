/**
 * Script de actualización de base de datos
 * Agrega todas las tablas necesarias para el sistema de BINGO completo
 */

const { pool } = require('../config/database');

const updateDatabase = async () => {
  const client = await pool.connect();

  try {
    console.log('🔄 Actualizando base de datos para sistema de BINGO...');

    await client.query('BEGIN');

    // Tabla: vendedores
    await client.query(`
      CREATE TABLE IF NOT EXISTS vendedores (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        nombre_completo VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        email VARCHAR(255),
        direccion TEXT,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "vendedores" creada');

    // Tabla: asignacion_boletos
    await client.query(`
      CREATE TABLE IF NOT EXISTS asignacion_boletos (
        id SERIAL PRIMARY KEY,
        evento_id INTEGER NOT NULL,
        vendedor_id INTEGER NOT NULL REFERENCES vendedores(id) ON DELETE CASCADE,
        boleto_desde INTEGER NOT NULL,
        boleto_hasta INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estado VARCHAR(50) DEFAULT 'asignado',
        hoja_qr_code VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(evento_id, boleto_desde, boleto_hasta)
      );
    `);
    console.log('✅ Tabla "asignacion_boletos" creada');

    // Tabla: devoluciones
    await client.query(`
      CREATE TABLE IF NOT EXISTS devoluciones (
        id SERIAL PRIMARY KEY,
        asignacion_id INTEGER NOT NULL REFERENCES asignacion_boletos(id),
        vendedor_id INTEGER NOT NULL REFERENCES vendedores(id),
        evento_id INTEGER NOT NULL,
        boletos_vendidos INTEGER DEFAULT 0,
        boletos_no_vendidos INTEGER DEFAULT 0,
        monto_total DECIMAL(10, 2) DEFAULT 0,
        fecha_devolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        observaciones TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "devoluciones" creada');

    // Tabla: boletos_detalle
    await client.query(`
      CREATE TABLE IF NOT EXISTS boletos_detalle (
        id SERIAL PRIMARY KEY,
        evento_id INTEGER NOT NULL,
        asignacion_id INTEGER REFERENCES asignacion_boletos(id),
        numero INTEGER NOT NULL,
        codigo_qr VARCHAR(255) UNIQUE NOT NULL,
        vendedor_id INTEGER REFERENCES vendedores(id),
        estado VARCHAR(50) DEFAULT 'asignado',
        cliente_nombre VARCHAR(255),
        cliente_telefono VARCHAR(20),
        fecha_venta TIMESTAMP,
        fecha_devolucion TIMESTAMP,
        precio_venta DECIMAL(10, 2),
        numeros_cartilla TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(evento_id, numero)
      );
    `);
    console.log('✅ Tabla "boletos_detalle" creada');

    // Índice para búsqueda rápida
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_boletos_detalle_qr
      ON boletos_detalle(codigo_qr);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_boletos_detalle_evento
      ON boletos_detalle(evento_id);
    `);

    // Tabla: figuras
    await client.query(`
      CREATE TABLE IF NOT EXISTS figuras (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        patron_json TEXT NOT NULL,
        imagen_url VARCHAR(500),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "figuras" creada');

    // Tabla: eventos
    await client.query(`
      CREATE TABLE IF NOT EXISTS eventos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        fecha DATE NOT NULL,
        hora_inicio TIME,
        precio_boleto DECIMAL(10, 2) NOT NULL,
        boleto_desde INTEGER NOT NULL DEFAULT 0,
        boleto_hasta INTEGER NOT NULL DEFAULT 999,
        total_boletos INTEGER NOT NULL,
        estado VARCHAR(50) DEFAULT 'programado',
        ventas_cerradas BOOLEAN DEFAULT false,
        fecha_cierre_ventas TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "eventos" creada');

    // Tabla: evento_figuras (relación muchos a muchos)
    await client.query(`
      CREATE TABLE IF NOT EXISTS evento_figuras (
        id SERIAL PRIMARY KEY,
        evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
        figura_id INTEGER NOT NULL REFERENCES figuras(id) ON DELETE CASCADE,
        orden INTEGER DEFAULT 1,
        premio VARCHAR(500),
        ganador_boleto_id INTEGER REFERENCES boletos_detalle(id),
        fecha_ganador TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(evento_id, figura_id)
      );
    `);
    console.log('✅ Tabla "evento_figuras" creada');

    // Tabla: juego_sesiones
    await client.query(`
      CREATE TABLE IF NOT EXISTS juego_sesiones (
        id SERIAL PRIMARY KEY,
        evento_id INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
        estado VARCHAR(50) DEFAULT 'iniciado',
        bolillas_cantadas TEXT,
        fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_fin TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "juego_sesiones" creada');

    // Tabla: bolillas_cantadas
    await client.query(`
      CREATE TABLE IF NOT EXISTS bolillas_cantadas (
        id SERIAL PRIMARY KEY,
        sesion_id INTEGER NOT NULL REFERENCES juego_sesiones(id) ON DELETE CASCADE,
        numero INTEGER NOT NULL CHECK (numero >= 1 AND numero <= 90),
        orden INTEGER NOT NULL,
        fecha_cantada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(sesion_id, numero)
      );
    `);
    console.log('✅ Tabla "bolillas_cantadas" creada');

    // Tabla: ganadores
    await client.query(`
      CREATE TABLE IF NOT EXISTS ganadores_bingo (
        id SERIAL PRIMARY KEY,
        evento_id INTEGER NOT NULL REFERENCES eventos(id),
        sesion_id INTEGER NOT NULL REFERENCES juego_sesiones(id),
        evento_figura_id INTEGER NOT NULL REFERENCES evento_figuras(id),
        boleto_id INTEGER NOT NULL REFERENCES boletos_detalle(id),
        figura_id INTEGER NOT NULL REFERENCES figuras(id),
        vendedor_id INTEGER REFERENCES vendedores(id),
        numero_boleto INTEGER NOT NULL,
        cliente_nombre VARCHAR(255),
        bolilla_ganadora INTEGER,
        tiempo_ganador INTERVAL,
        premio VARCHAR(500),
        entregado BOOLEAN DEFAULT false,
        fecha_entrega TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Tabla "ganadores_bingo" creada');

    // Actualizar trigger para eventos
    await client.query(`
      DROP TRIGGER IF EXISTS update_eventos_updated_at ON eventos;
      CREATE TRIGGER update_eventos_updated_at
      BEFORE UPDATE ON eventos
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Trigger para vendedores
    await client.query(`
      DROP TRIGGER IF EXISTS update_vendedores_updated_at ON vendedores;
      CREATE TRIGGER update_vendedores_updated_at
      BEFORE UPDATE ON vendedores
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Insertar figuras predeterminadas de bingo
    await client.query(`
      INSERT INTO figuras (nombre, descripcion, patron_json, activo)
      VALUES
        ('Línea Horizontal', 'Completar cualquier línea horizontal', '{"tipo":"linea","direccion":"horizontal"}', true),
        ('Línea Vertical', 'Completar cualquier línea vertical', '{"tipo":"linea","direccion":"vertical"}', true),
        ('Diagonal Principal', 'Completar diagonal de arriba-izquierda a abajo-derecha', '{"tipo":"diagonal","direccion":"principal"}', true),
        ('Diagonal Secundaria', 'Completar diagonal de arriba-derecha a abajo-izquierda', '{"tipo":"diagonal","direccion":"secundaria"}', true),
        ('Cuatro Esquinas', 'Completar las 4 esquinas del cartón', '{"tipo":"esquinas"}', true),
        ('Cartón Lleno', 'Completar todos los números del cartón', '{"tipo":"lleno"}', true),
        ('Cruz', 'Completar línea central horizontal y vertical formando una cruz', '{"tipo":"cruz"}', true),
        ('Marco', 'Completar todos los bordes del cartón', '{"tipo":"marco"}', true)
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Figuras predeterminadas creadas');

    await client.query('COMMIT');
    console.log('');
    console.log('🎉 ¡Base de datos actualizada para sistema de BINGO!');
    console.log('');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error al actualizar base de datos:', error.message);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

// Ejecutar
updateDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
