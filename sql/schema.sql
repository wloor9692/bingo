-- =====================================================
-- Sistema de BINGO Profesional - Esquema MySQL
-- Versión: 2.0
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS bingo_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE bingo_db;

-- =====================================================
-- 1. TABLA: vendedores
-- =====================================================
CREATE TABLE IF NOT EXISTS vendedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(255),
  direccion TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_codigo (codigo),
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABLA: figuras
-- =====================================================
CREATE TABLE IF NOT EXISTS figuras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  patron_json TEXT NOT NULL COMMENT 'Estructura JSON para validación',
  imagen_url VARCHAR(500),
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABLA: eventos
-- =====================================================
CREATE TABLE IF NOT EXISTS eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME,
  precio_boleto DECIMAL(10, 2) NOT NULL,
  boleto_desde INT NOT NULL DEFAULT 0,
  boleto_hasta INT NOT NULL DEFAULT 999,
  total_boletos INT NOT NULL,
  estado ENUM('programado', 'en_venta', 'cerrado', 'en_juego', 'finalizado') DEFAULT 'programado',
  ventas_cerradas TINYINT(1) DEFAULT 0,
  fecha_cierre_ventas TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fecha (fecha),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABLA: evento_figuras (Relación muchos a muchos)
-- =====================================================
CREATE TABLE IF NOT EXISTS evento_figuras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  figura_id INT NOT NULL,
  orden INT DEFAULT 1,
  premio VARCHAR(500),
  ganador_boleto_id INT NULL,
  fecha_ganador TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (figura_id) REFERENCES figuras(id) ON DELETE CASCADE,
  UNIQUE KEY unique_evento_figura (evento_id, figura_id),
  INDEX idx_evento (evento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TABLA: asignacion_boletos
-- =====================================================
CREATE TABLE IF NOT EXISTS asignacion_boletos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  vendedor_id INT NOT NULL,
  boleto_desde INT NOT NULL,
  boleto_hasta INT NOT NULL,
  cantidad INT NOT NULL,
  fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('asignado', 'devuelto', 'parcial') DEFAULT 'asignado',
  hoja_qr_code VARCHAR(255) COMMENT 'Código QR de la hoja',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE CASCADE,
  UNIQUE KEY unique_evento_rango (evento_id, boleto_desde, boleto_hasta),
  INDEX idx_evento (evento_id),
  INDEX idx_vendedor (vendedor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABLA: boletos_detalle
-- =====================================================
CREATE TABLE IF NOT EXISTS boletos_detalle (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  asignacion_id INT NULL,
  numero INT NOT NULL,
  codigo_qr VARCHAR(255) UNIQUE NOT NULL,
  vendedor_id INT NULL,
  estado ENUM('asignado', 'vendido', 'devuelto', 'ganador') DEFAULT 'asignado',
  cliente_nombre VARCHAR(255),
  cliente_telefono VARCHAR(20),
  fecha_venta TIMESTAMP NULL,
  fecha_devolucion TIMESTAMP NULL,
  precio_venta DECIMAL(10, 2),
  numeros_cartilla TEXT COMMENT 'JSON con números de la cartilla de bingo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asignacion_id) REFERENCES asignacion_boletos(id) ON DELETE SET NULL,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL,
  UNIQUE KEY unique_evento_numero (evento_id, numero),
  INDEX idx_codigo_qr (codigo_qr),
  INDEX idx_evento (evento_id),
  INDEX idx_vendedor (vendedor_id),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. TABLA: devoluciones
-- =====================================================
CREATE TABLE IF NOT EXISTS devoluciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asignacion_id INT NOT NULL,
  vendedor_id INT NOT NULL,
  evento_id INT NOT NULL,
  boletos_vendidos INT DEFAULT 0,
  boletos_no_vendidos INT DEFAULT 0,
  monto_total DECIMAL(10, 2) DEFAULT 0.00,
  comision DECIMAL(10, 2) DEFAULT 0.00,
  fecha_devolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asignacion_id) REFERENCES asignacion_boletos(id) ON DELETE CASCADE,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE CASCADE,
  INDEX idx_evento (evento_id),
  INDEX idx_vendedor (vendedor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. TABLA: juego_sesiones
-- =====================================================
CREATE TABLE IF NOT EXISTS juego_sesiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  estado ENUM('iniciado', 'pausado', 'finalizado') DEFAULT 'iniciado',
  bolillas_cantadas TEXT COMMENT 'JSON array de bolillas',
  fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_fin TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  INDEX idx_evento (evento_id),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. TABLA: bolillas_cantadas
-- =====================================================
CREATE TABLE IF NOT EXISTS bolillas_cantadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sesion_id INT NOT NULL,
  numero INT NOT NULL CHECK (numero >= 1 AND numero <= 90),
  orden INT NOT NULL,
  fecha_cantada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sesion_id) REFERENCES juego_sesiones(id) ON DELETE CASCADE,
  UNIQUE KEY unique_sesion_numero (sesion_id, numero),
  INDEX idx_sesion (sesion_id),
  INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. TABLA: ganadores_bingo
-- =====================================================
CREATE TABLE IF NOT EXISTS ganadores_bingo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  sesion_id INT NOT NULL,
  evento_figura_id INT NOT NULL,
  boleto_id INT NOT NULL,
  figura_id INT NOT NULL,
  vendedor_id INT NULL,
  numero_boleto INT NOT NULL,
  cliente_nombre VARCHAR(255),
  bolilla_ganadora INT,
  tiempo_segundos INT COMMENT 'Segundos desde inicio del juego',
  premio VARCHAR(500),
  entregado TINYINT(1) DEFAULT 0,
  fecha_entrega TIMESTAMP NULL,
  responsable_entrega VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (sesion_id) REFERENCES juego_sesiones(id) ON DELETE CASCADE,
  FOREIGN KEY (evento_figura_id) REFERENCES evento_figuras(id) ON DELETE CASCADE,
  FOREIGN KEY (boleto_id) REFERENCES boletos_detalle(id) ON DELETE CASCADE,
  FOREIGN KEY (figura_id) REFERENCES figuras(id) ON DELETE CASCADE,
  FOREIGN KEY (vendedor_id) REFERENCES vendedores(id) ON DELETE SET NULL,
  INDEX idx_evento (evento_id),
  INDEX idx_sesion (sesion_id),
  INDEX idx_entregado (entregado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 11. TABLA: usuarios (Control de acceso)
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'operador', 'vendedor') DEFAULT 'operador',
  email VARCHAR(255),
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_username (username),
  INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 12. TABLA: auditoria
-- =====================================================
CREATE TABLE IF NOT EXISTS auditoria (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NULL,
  accion VARCHAR(255) NOT NULL,
  tabla_afectada VARCHAR(100),
  registro_id INT,
  detalles TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_tabla (tabla_afectada),
  INDEX idx_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- INSERTAR FIGURAS PREDEFINIDAS
-- =====================================================
INSERT INTO figuras (nombre, descripcion, patron_json, activo) VALUES
('Línea Horizontal', 'Completar cualquier línea horizontal completa', '{"tipo":"linea","direccion":"horizontal"}', 1),
('Línea Vertical', 'Completar cualquier línea vertical completa', '{"tipo":"linea","direccion":"vertical"}', 1),
('Diagonal Principal', 'Completar diagonal de arriba-izquierda a abajo-derecha', '{"tipo":"diagonal","direccion":"principal"}', 1),
('Diagonal Secundaria', 'Completar diagonal de arriba-derecha a abajo-izquierda', '{"tipo":"diagonal","direccion":"secundaria"}', 1),
('Cuatro Esquinas', 'Completar las 4 esquinas del cartón', '{"tipo":"esquinas"}', 1),
('Cartón Lleno', 'Completar todos los números del cartón (BINGO)', '{"tipo":"lleno"}', 1),
('Cruz', 'Completar línea central horizontal y vertical formando cruz', '{"tipo":"cruz"}', 1),
('Marco', 'Completar todos los bordes del cartón', '{"tipo":"marco"}', 1);

-- =====================================================
-- CREAR USUARIO ADMIN POR DEFECTO
-- Password: admin123 (cambiar en producción)
-- =====================================================
INSERT INTO usuarios (username, password_hash, nombre_completo, rol, email, activo) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin', 'admin@bingo.com', 1);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista: Estadísticas de vendedores
CREATE OR REPLACE VIEW v_estadisticas_vendedores AS
SELECT
  v.id,
  v.codigo,
  v.nombre_completo,
  COUNT(DISTINCT a.id) as total_asignaciones,
  COALESCE(SUM(a.cantidad), 0) as boletos_asignados,
  COUNT(CASE WHEN b.estado = 'vendido' THEN 1 END) as boletos_vendidos,
  COUNT(CASE WHEN b.estado = 'devuelto' THEN 1 END) as boletos_devueltos,
  COALESCE(SUM(b.precio_venta), 0) as ingresos_totales,
  v.activo
FROM vendedores v
LEFT JOIN asignacion_boletos a ON v.id = a.vendedor_id
LEFT JOIN boletos_detalle b ON v.id = b.vendedor_id
GROUP BY v.id, v.codigo, v.nombre_completo, v.activo;

-- Vista: Estado de eventos
CREATE OR REPLACE VIEW v_estado_eventos AS
SELECT
  e.id,
  e.nombre,
  e.fecha,
  e.estado,
  e.total_boletos,
  COUNT(CASE WHEN b.estado = 'vendido' THEN 1 END) as boletos_vendidos,
  COUNT(CASE WHEN b.estado = 'asignado' THEN 1 END) as boletos_asignados,
  COUNT(CASE WHEN b.estado = 'devuelto' THEN 1 END) as boletos_devueltos,
  COALESCE(SUM(b.precio_venta), 0) as ingresos,
  COUNT(DISTINCT ef.id) as figuras_activas,
  COUNT(DISTINCT g.id) as ganadores
FROM eventos e
LEFT JOIN boletos_detalle b ON e.id = b.evento_id
LEFT JOIN evento_figuras ef ON e.id = ef.evento_id
LEFT JOIN ganadores_bingo g ON e.id = g.evento_id
GROUP BY e.id, e.nombre, e.fecha, e.estado, e.total_boletos;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

DELIMITER //

-- Procedimiento: Generar boletos para un evento
CREATE PROCEDURE sp_generar_boletos(
  IN p_evento_id INT,
  IN p_desde INT,
  IN p_hasta INT,
  IN p_vendedor_id INT,
  IN p_asignacion_id INT
)
BEGIN
  DECLARE v_numero INT;
  DECLARE v_codigo_qr VARCHAR(255);
  DECLARE v_cartilla TEXT;

  SET v_numero = p_desde;

  WHILE v_numero <= p_hasta DO
    -- Generar código QR único
    SET v_codigo_qr = CONCAT('EVT', p_evento_id, '-BOL', LPAD(v_numero, 4, '0'), '-', UNIX_TIMESTAMP());

    -- Generar números de cartilla aleatorios (esto se puede mejorar)
    SET v_cartilla = '[]'; -- Se generará en PHP con lógica de bingo

    INSERT INTO boletos_detalle (
      evento_id, asignacion_id, numero, codigo_qr,
      vendedor_id, estado, numeros_cartilla
    ) VALUES (
      p_evento_id, p_asignacion_id, v_numero, v_codigo_qr,
      p_vendedor_id, 'asignado', v_cartilla
    );

    SET v_numero = v_numero + 1;
  END WHILE;
END //

-- Procedimiento: Registrar devolución
CREATE PROCEDURE sp_registrar_devolucion(
  IN p_asignacion_id INT,
  OUT p_vendidos INT,
  OUT p_no_vendidos INT,
  OUT p_monto DECIMAL(10,2)
)
BEGIN
  DECLARE v_vendedor_id INT;
  DECLARE v_evento_id INT;

  -- Obtener datos de la asignación
  SELECT vendedor_id, evento_id INTO v_vendedor_id, v_evento_id
  FROM asignacion_boletos
  WHERE id = p_asignacion_id;

  -- Contar vendidos
  SELECT COUNT(*) INTO p_vendidos
  FROM boletos_detalle
  WHERE asignacion_id = p_asignacion_id AND estado = 'vendido';

  -- Contar no vendidos
  SELECT COUNT(*) INTO p_no_vendidos
  FROM boletos_detalle
  WHERE asignacion_id = p_asignacion_id AND estado = 'asignado';

  -- Calcular monto total
  SELECT COALESCE(SUM(precio_venta), 0) INTO p_monto
  FROM boletos_detalle
  WHERE asignacion_id = p_asignacion_id AND estado = 'vendido';

  -- Insertar devolución
  INSERT INTO devoluciones (
    asignacion_id, vendedor_id, evento_id,
    boletos_vendidos, boletos_no_vendidos, monto_total
  ) VALUES (
    p_asignacion_id, v_vendedor_id, v_evento_id,
    p_vendidos, p_no_vendidos, p_monto
  );

  -- Actualizar estado de asignación
  UPDATE asignacion_boletos
  SET estado = 'devuelto'
  WHERE id = p_asignacion_id;

  -- Marcar boletos no vendidos como devueltos
  UPDATE boletos_detalle
  SET estado = 'devuelto', fecha_devolucion = NOW()
  WHERE asignacion_id = p_asignacion_id AND estado = 'asignado';
END //

DELIMITER ;

-- =====================================================
-- ¡BASE DE DATOS LISTA!
-- =====================================================
SELECT 'Base de datos creada exitosamente' AS status;
