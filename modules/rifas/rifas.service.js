/**
 * MÓDULO: GESTIÓN DE RIFAS
 * Servicio - Lógica de negocio para rifas
 */

const db = require('../../config/database');

class RifasService {
  /**
   * Crear una nueva rifa
   */
  async crearRifa(rifaData) {
    const {
      nombre,
      descripcion,
      fecha_sorteo,
      premio,
      precio_boleto,
      numero_inicial = 0,
      numero_final = 99,
    } = rifaData;

    // Validaciones
    if (!nombre || !fecha_sorteo || !premio || !precio_boleto) {
      throw new Error('Faltan campos obligatorios');
    }

    if (numero_final <= numero_inicial) {
      throw new Error('El número final debe ser mayor al número inicial');
    }

    const query = `
      INSERT INTO rifas (
        nombre, descripcion, fecha_sorteo, premio, precio_boleto,
        numero_inicial, numero_final, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'activa')
      RETURNING *
    `;

    const values = [
      nombre,
      descripcion || '',
      fecha_sorteo,
      premio,
      precio_boleto,
      numero_inicial,
      numero_final,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Obtener todas las rifas (con filtro opcional por estado)
   */
  async obtenerRifas(estado = null) {
    let query = 'SELECT * FROM rifas';
    const values = [];

    if (estado) {
      query += ' WHERE estado = $1';
      values.push(estado);
    }

    query += ' ORDER BY fecha_sorteo DESC, created_at DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Obtener una rifa por ID
   */
  async obtenerRifaPorId(id) {
    const query = 'SELECT * FROM rifas WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Actualizar una rifa
   */
  async actualizarRifa(id, rifaData) {
    const rifa = await this.obtenerRifaPorId(id);
    if (!rifa) return null;

    const {
      nombre,
      descripcion,
      fecha_sorteo,
      premio,
      precio_boleto,
      numero_inicial,
      numero_final,
    } = rifaData;

    const query = `
      UPDATE rifas
      SET
        nombre = COALESCE($1, nombre),
        descripcion = COALESCE($2, descripcion),
        fecha_sorteo = COALESCE($3, fecha_sorteo),
        premio = COALESCE($4, premio),
        precio_boleto = COALESCE($5, precio_boleto),
        numero_inicial = COALESCE($6, numero_inicial),
        numero_final = COALESCE($7, numero_final)
      WHERE id = $8
      RETURNING *
    `;

    const values = [
      nombre,
      descripcion,
      fecha_sorteo,
      premio,
      precio_boleto,
      numero_inicial,
      numero_final,
      id,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Eliminar una rifa
   */
  async eliminarRifa(id) {
    const query = 'DELETE FROM rifas WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Cambiar el estado de una rifa
   */
  async cambiarEstado(id, estado) {
    const estadosValidos = ['activa', 'finalizada', 'cancelada', 'pausada'];

    if (!estadosValidos.includes(estado)) {
      throw new Error(`Estado inválido. Debe ser: ${estadosValidos.join(', ')}`);
    }

    const query = `
      UPDATE rifas
      SET estado = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [estado, id]);
    return result.rows[0];
  }

  /**
   * Obtener estadísticas de una rifa
   */
  async obtenerEstadisticas(rifaId) {
    const rifa = await this.obtenerRifaPorId(rifaId);
    if (!rifa) {
      throw new Error('Rifa no encontrada');
    }

    // Total de boletos posibles
    const totalBoletos = rifa.numero_final - rifa.numero_inicial + 1;

    // Boletos vendidos
    const queryVendidos = `
      SELECT COUNT(*) as vendidos
      FROM boletos
      WHERE rifa_id = $1 AND estado = 'vendido'
    `;
    const resultVendidos = await db.query(queryVendidos, [rifaId]);
    const boletosVendidos = parseInt(resultVendidos.rows[0].vendidos);

    // Boletos disponibles
    const boletosDisponibles = totalBoletos - boletosVendidos;

    // Ingresos totales
    const queryIngresos = `
      SELECT COALESCE(SUM(precio_venta), 0) as total_ingresos
      FROM ventas_diarias
      WHERE rifa_id = $1
    `;
    const resultIngresos = await db.query(queryIngresos, [rifaId]);
    const totalIngresos = parseFloat(resultIngresos.rows[0].total_ingresos);

    // Premios entregados
    const queryPremios = `
      SELECT COUNT(*) as premios_entregados
      FROM entregas_premios
      WHERE rifa_id = $1
    `;
    const resultPremios = await db.query(queryPremios, [rifaId]);
    const premiosEntregados = parseInt(resultPremios.rows[0].premios_entregados);

    return {
      rifa: {
        id: rifa.id,
        nombre: rifa.nombre,
        estado: rifa.estado,
        fecha_sorteo: rifa.fecha_sorteo,
      },
      boletos: {
        total: totalBoletos,
        vendidos: boletosVendidos,
        disponibles: boletosDisponibles,
        porcentaje_vendido: ((boletosVendidos / totalBoletos) * 100).toFixed(2),
      },
      ingresos: {
        total: totalIngresos,
        ingreso_potencial: totalBoletos * parseFloat(rifa.precio_boleto),
      },
      premios: {
        entregados: premiosEntregados,
      },
    };
  }
}

module.exports = new RifasService();
