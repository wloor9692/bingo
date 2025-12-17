/**
 * MÓDULO: ENTREGA DE PREMIOS
 * Servicio - Lógica de negocio para entregas de premios
 */

const db = require('../../config/database');

class EntregasService {
  /**
   * Registrar la entrega de un premio
   */
  async registrarEntrega(entregaData) {
    const {
      rifa_id,
      boleto_id,
      numero_ganador_id,
      ganador_nombre,
      ganador_identificacion,
      ganador_telefono,
      ganador_email,
      premio_entregado,
      responsable_entrega,
      observaciones,
      foto_comprobante,
    } = entregaData;

    // Validaciones
    if (!rifa_id || !boleto_id || !numero_ganador_id || !ganador_nombre || !premio_entregado) {
      throw new Error(
        'Faltan campos obligatorios: rifa_id, boleto_id, numero_ganador_id, ganador_nombre, premio_entregado'
      );
    }

    // Verificar que el boleto es realmente ganador
    const queryVerificar = `
      SELECT
        b.id as boleto_id,
        b.numero,
        ng.id as numero_ganador_id
      FROM boletos b
      INNER JOIN numeros_ganadores ng ON b.rifa_id = ng.rifa_id AND b.numero = ng.numero_ganador
      WHERE b.id = $1 AND b.rifa_id = $2 AND ng.id = $3
    `;

    const resultVerificar = await db.query(queryVerificar, [
      boleto_id,
      rifa_id,
      numero_ganador_id,
    ]);

    if (resultVerificar.rows.length === 0) {
      throw new Error('El boleto no corresponde a un número ganador válido');
    }

    // Verificar si ya existe una entrega para este boleto
    const queryExiste = `
      SELECT id FROM entregas_premios
      WHERE boleto_id = $1
    `;
    const resultExiste = await db.query(queryExiste, [boleto_id]);

    if (resultExiste.rows.length > 0) {
      throw new Error('Ya existe un registro de entrega para este boleto');
    }

    // Registrar la entrega
    const query = `
      INSERT INTO entregas_premios (
        rifa_id, boleto_id, numero_ganador_id, ganador_nombre,
        ganador_identificacion, ganador_telefono, ganador_email,
        premio_entregado, responsable_entrega, observaciones, foto_comprobante
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      rifa_id,
      boleto_id,
      numero_ganador_id,
      ganador_nombre,
      ganador_identificacion || null,
      ganador_telefono || null,
      ganador_email || null,
      premio_entregado,
      responsable_entrega || 'Administrador',
      observaciones || null,
      foto_comprobante || null,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Obtener todas las entregas (con filtro opcional por rifa)
   */
  async obtenerEntregas(rifaId = null) {
    let query = `
      SELECT
        ep.*,
        r.nombre as rifa_nombre,
        r.premio as rifa_premio,
        b.numero as boleto_numero,
        b.codigo_barras,
        ng.posicion,
        ng.premio_descripcion
      FROM entregas_premios ep
      INNER JOIN rifas r ON ep.rifa_id = r.id
      INNER JOIN boletos b ON ep.boleto_id = b.id
      INNER JOIN numeros_ganadores ng ON ep.numero_ganador_id = ng.id
    `;

    const values = [];

    if (rifaId) {
      query += ' WHERE ep.rifa_id = $1';
      values.push(rifaId);
    }

    query += ' ORDER BY ep.fecha_entrega DESC';

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Obtener una entrega por ID
   */
  async obtenerEntregaPorId(id) {
    const query = `
      SELECT
        ep.*,
        r.nombre as rifa_nombre,
        r.premio as rifa_premio,
        r.fecha_sorteo,
        b.numero as boleto_numero,
        b.codigo_barras,
        b.cliente_nombre,
        b.cliente_telefono,
        ng.posicion,
        ng.premio_descripcion,
        ng.fecha_sorteo as fecha_sorteo_ganador
      FROM entregas_premios ep
      INNER JOIN rifas r ON ep.rifa_id = r.id
      INNER JOIN boletos b ON ep.boleto_id = b.id
      INNER JOIN numeros_ganadores ng ON ep.numero_ganador_id = ng.id
      WHERE ep.id = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Obtener entregas por rifa
   */
  async obtenerEntregasPorRifa(rifaId) {
    return this.obtenerEntregas(rifaId);
  }

  /**
   * Actualizar información de una entrega
   */
  async actualizarEntrega(id, entregaData) {
    const entrega = await this.obtenerEntregaPorId(id);
    if (!entrega) return null;

    const {
      ganador_nombre,
      ganador_identificacion,
      ganador_telefono,
      ganador_email,
      premio_entregado,
      responsable_entrega,
      observaciones,
      foto_comprobante,
    } = entregaData;

    const query = `
      UPDATE entregas_premios
      SET
        ganador_nombre = COALESCE($1, ganador_nombre),
        ganador_identificacion = COALESCE($2, ganador_identificacion),
        ganador_telefono = COALESCE($3, ganador_telefono),
        ganador_email = COALESCE($4, ganador_email),
        premio_entregado = COALESCE($5, premio_entregado),
        responsable_entrega = COALESCE($6, responsable_entrega),
        observaciones = COALESCE($7, observaciones),
        foto_comprobante = COALESCE($8, foto_comprobante)
      WHERE id = $9
      RETURNING *
    `;

    const values = [
      ganador_nombre,
      ganador_identificacion,
      ganador_telefono,
      ganador_email,
      premio_entregado,
      responsable_entrega,
      observaciones,
      foto_comprobante,
      id,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Eliminar una entrega
   */
  async eliminarEntrega(id) {
    const query = 'DELETE FROM entregas_premios WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Obtener estadísticas de entregas
   */
  async obtenerEstadisticas(rifaId = null) {
    let query = `
      SELECT
        COUNT(ep.id) as total_entregas,
        COUNT(DISTINCT ep.rifa_id) as rifas_con_entregas,
        COUNT(DISTINCT ep.responsable_entrega) as responsables_activos,
        MIN(ep.fecha_entrega) as primera_entrega,
        MAX(ep.fecha_entrega) as ultima_entrega
      FROM entregas_premios ep
    `;

    const values = [];

    if (rifaId) {
      query += ' WHERE ep.rifa_id = $1';
      values.push(rifaId);
    }

    const result = await db.query(query, values);

    // Obtener ganadores pendientes
    let queryPendientes = `
      SELECT COUNT(*) as pendientes
      FROM numeros_ganadores ng
      LEFT JOIN entregas_premios ep ON ng.id = ep.numero_ganador_id
      WHERE ep.id IS NULL
    `;

    if (rifaId) {
      queryPendientes += ' AND ng.rifa_id = $1';
    }

    const resultPendientes = await db.query(queryPendientes, rifaId ? [rifaId] : []);

    return {
      ...result.rows[0],
      premios_pendientes: parseInt(resultPendientes.rows[0].pendientes),
    };
  }
}

module.exports = new EntregasService();
