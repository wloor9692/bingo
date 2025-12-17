/**
 * MÓDULO: GESTIÓN DE BOLETOS
 * Servicio - Lógica de negocio para boletos
 */

const db = require('../../config/database');

class BoletosService {
  /**
   * Generar código de barras único para un boleto
   * Formato: RIFA-[RIFA_ID]-[NUMERO]-[TIMESTAMP]
   */
  generarCodigoBarras(rifaId, numero) {
    const timestamp = Date.now().toString().slice(-6);
    return `RIFA-${rifaId}-${numero.toString().padStart(4, '0')}-${timestamp}`;
  }

  /**
   * Generar todos los boletos para una rifa
   */
  async generarBoletosParaRifa(rifaId) {
    // Obtener información de la rifa
    const queryRifa = 'SELECT * FROM rifas WHERE id = $1';
    const resultRifa = await db.query(queryRifa, [rifaId]);

    if (resultRifa.rows.length === 0) {
      throw new Error('Rifa no encontrada');
    }

    const rifa = resultRifa.rows[0];

    // Verificar si ya existen boletos para esta rifa
    const queryExistentes = 'SELECT COUNT(*) FROM boletos WHERE rifa_id = $1';
    const resultExistentes = await db.query(queryExistentes, [rifaId]);
    const cantidadExistente = parseInt(resultExistentes.rows[0].count);

    if (cantidadExistente > 0) {
      throw new Error(`Ya existen ${cantidadExistente} boletos para esta rifa. Elimínelos primero si desea regenerarlos.`);
    }

    // Generar boletos
    const boletos = [];
    const client = await db.pool.connect();

    try {
      await client.query('BEGIN');

      for (let numero = rifa.numero_inicial; numero <= rifa.numero_final; numero++) {
        const codigoBarras = this.generarCodigoBarras(rifaId, numero);

        const query = `
          INSERT INTO boletos (rifa_id, numero, codigo_barras, estado)
          VALUES ($1, $2, $3, 'disponible')
          RETURNING *
        `;

        const result = await client.query(query, [rifaId, numero, codigoBarras]);
        boletos.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return boletos;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener boletos por rifa (con filtro opcional por estado)
   */
  async obtenerBoletosPorRifa(rifaId, estado = null) {
    let query = 'SELECT * FROM boletos WHERE rifa_id = $1';
    const values = [rifaId];

    if (estado) {
      query += ' AND estado = $2';
      values.push(estado);
    }

    query += ' ORDER BY numero ASC';

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Obtener un boleto por ID
   */
  async obtenerBoletoPorId(id) {
    const query = `
      SELECT b.*, r.nombre as rifa_nombre, r.fecha_sorteo, r.premio
      FROM boletos b
      INNER JOIN rifas r ON b.rifa_id = r.id
      WHERE b.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Buscar boleto por código de barras
   */
  async buscarPorCodigoBarras(codigoBarras) {
    const query = `
      SELECT b.*, r.nombre as rifa_nombre, r.fecha_sorteo, r.premio, r.estado as rifa_estado
      FROM boletos b
      INNER JOIN rifas r ON b.rifa_id = r.id
      WHERE b.codigo_barras = $1
    `;
    const result = await db.query(query, [codigoBarras]);
    return result.rows[0];
  }

  /**
   * Vender un boleto
   */
  async venderBoleto(boletoId, datosVenta) {
    const { cliente_nombre, cliente_telefono, vendedor, observaciones } = datosVenta;

    // Verificar que el boleto existe y está disponible
    const boleto = await this.obtenerBoletoPorId(boletoId);

    if (!boleto) {
      throw new Error('Boleto no encontrado');
    }

    if (boleto.estado !== 'disponible') {
      throw new Error(`El boleto ya está ${boleto.estado}`);
    }

    const query = `
      UPDATE boletos
      SET
        estado = 'vendido',
        cliente_nombre = $1,
        cliente_telefono = $2,
        fecha_venta = CURRENT_TIMESTAMP,
        vendedor = $3,
        observaciones = $4
      WHERE id = $5
      RETURNING *
    `;

    const values = [
      cliente_nombre || null,
      cliente_telefono || null,
      vendedor || null,
      observaciones || null,
      boletoId,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Cancelar venta de un boleto
   */
  async cancelarVenta(boletoId) {
    const boleto = await this.obtenerBoletoPorId(boletoId);

    if (!boleto) {
      throw new Error('Boleto no encontrado');
    }

    if (boleto.estado !== 'vendido') {
      throw new Error('El boleto no está vendido');
    }

    const query = `
      UPDATE boletos
      SET
        estado = 'disponible',
        cliente_nombre = NULL,
        cliente_telefono = NULL,
        fecha_venta = NULL,
        vendedor = NULL,
        observaciones = NULL
      WHERE id = $1
      RETURNING *
    `;

    const result = await db.query(query, [boletoId]);
    return result.rows[0];
  }

  /**
   * Eliminar todos los boletos de una rifa
   */
  async eliminarTodosPorRifa(rifaId) {
    const query = 'DELETE FROM boletos WHERE rifa_id = $1';
    const result = await db.query(query, [rifaId]);
    return result.rowCount;
  }

  /**
   * Obtener boletos disponibles para una rifa
   */
  async obtenerBoletosDisponibles(rifaId) {
    return this.obtenerBoletosPorRifa(rifaId, 'disponible');
  }
}

module.exports = new BoletosService();
