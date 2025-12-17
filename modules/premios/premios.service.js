/**
 * MÓDULO: CONSULTA DE PREMIOS
 * Servicio - Lógica de negocio para verificación de premios
 */

const db = require('../../config/database');

class PremiosService {
  /**
   * Verificar premio por código de barras
   * Este método es ideal para usar con lectores de códigos de barras
   */
  async verificarPorCodigoBarras(codigoBarras) {
    const query = `
      SELECT
        b.id as boleto_id,
        b.numero,
        b.codigo_barras,
        b.estado as boleto_estado,
        b.cliente_nombre,
        b.cliente_telefono,
        b.fecha_venta,
        r.id as rifa_id,
        r.nombre as rifa_nombre,
        r.fecha_sorteo,
        r.premio as rifa_premio,
        r.estado as rifa_estado,
        ng.id as numero_ganador_id,
        ng.posicion,
        ng.premio_descripcion,
        ng.fecha_sorteo as fecha_sorteo_ganador,
        ep.id as entrega_id,
        ep.fecha_entrega,
        ep.ganador_nombre as nombre_ganador_entrega
      FROM boletos b
      INNER JOIN rifas r ON b.rifa_id = r.id
      LEFT JOIN numeros_ganadores ng ON b.rifa_id = ng.rifa_id AND b.numero = ng.numero_ganador
      LEFT JOIN entregas_premios ep ON b.id = ep.boleto_id
      WHERE b.codigo_barras = $1
    `;

    const result = await db.query(query, [codigoBarras]);

    if (result.rows.length === 0) {
      return {
        existe: false,
        es_ganador: false,
        mensaje: 'Código de barras no encontrado',
        alerta: 'BOLETO NO VÁLIDO',
      };
    }

    const boleto = result.rows[0];

    // Verificar si el boleto no fue vendido
    if (boleto.boleto_estado !== 'vendido') {
      return {
        existe: true,
        es_ganador: false,
        mensaje: 'Este boleto no ha sido vendido',
        alerta: 'BOLETO NO VENDIDO',
        boleto: {
          numero: boleto.numero,
          codigo_barras: boleto.codigo_barras,
          estado: boleto.boleto_estado,
        },
      };
    }

    // Verificar si es ganador
    if (!boleto.numero_ganador_id) {
      return {
        existe: true,
        es_ganador: false,
        mensaje: 'Este boleto no tiene premio',
        alerta: 'NO ES GANADOR',
        boleto: {
          numero: boleto.numero,
          codigo_barras: boleto.codigo_barras,
          cliente: boleto.cliente_nombre,
          telefono: boleto.cliente_telefono,
          rifa: boleto.rifa_nombre,
        },
      };
    }

    // Es ganador - verificar si ya fue entregado
    const yaEntregado = boleto.entrega_id !== null;

    return {
      existe: true,
      es_ganador: true,
      mensaje: yaEntregado
        ? '¡PREMIO YA ENTREGADO!'
        : '¡FELICIDADES! BOLETO GANADOR',
      alerta: yaEntregado ? 'PREMIO YA ENTREGADO' : '🎉 ¡GANADOR! 🎉',
      premio_entregado: yaEntregado,
      boleto: {
        numero: boleto.numero,
        codigo_barras: boleto.codigo_barras,
        cliente: boleto.cliente_nombre,
        telefono: boleto.cliente_telefono,
      },
      rifa: {
        nombre: boleto.rifa_nombre,
        fecha_sorteo: boleto.fecha_sorteo,
        premio: boleto.premio_descripcion || boleto.rifa_premio,
      },
      ganador: {
        posicion: boleto.posicion,
        fecha_sorteo: boleto.fecha_sorteo_ganador,
      },
      entrega: yaEntregado
        ? {
            fecha: boleto.fecha_entrega,
            nombre_ganador: boleto.nombre_ganador_entrega,
          }
        : null,
    };
  }

  /**
   * Verificar premio por número de boleto y rifa
   * Para consulta manual
   */
  async verificarPorNumero(rifaId, numero) {
    const query = `
      SELECT
        b.id as boleto_id,
        b.numero,
        b.codigo_barras,
        b.estado as boleto_estado,
        b.cliente_nombre,
        b.cliente_telefono,
        r.id as rifa_id,
        r.nombre as rifa_nombre,
        r.fecha_sorteo,
        r.premio as rifa_premio,
        ng.id as numero_ganador_id,
        ng.posicion,
        ng.premio_descripcion,
        ep.id as entrega_id,
        ep.fecha_entrega
      FROM rifas r
      LEFT JOIN boletos b ON r.id = b.rifa_id AND b.numero = $2
      LEFT JOIN numeros_ganadores ng ON r.id = ng.rifa_id AND ng.numero_ganador = $2
      LEFT JOIN entregas_premios ep ON b.id = ep.boleto_id
      WHERE r.id = $1
    `;

    const result = await db.query(query, [rifaId, numero]);

    if (result.rows.length === 0) {
      return {
        existe: false,
        es_ganador: false,
        mensaje: 'Rifa no encontrada',
      };
    }

    const data = result.rows[0];

    // Si no existe el boleto
    if (!data.boleto_id) {
      return {
        existe: false,
        es_ganador: false,
        mensaje: 'No existe boleto con ese número para esta rifa',
        rifa: {
          nombre: data.rifa_nombre,
        },
      };
    }

    // Verificar si es ganador
    if (!data.numero_ganador_id) {
      return {
        existe: true,
        es_ganador: false,
        mensaje: 'Este número no es ganador',
        boleto: {
          numero: data.numero,
          codigo_barras: data.codigo_barras,
          estado: data.boleto_estado,
        },
      };
    }

    // Es ganador
    const yaEntregado = data.entrega_id !== null;

    return {
      existe: true,
      es_ganador: true,
      mensaje: yaEntregado
        ? 'Premio ya entregado'
        : '¡FELICIDADES! Número ganador',
      premio_entregado: yaEntregado,
      boleto: {
        numero: data.numero,
        codigo_barras: data.codigo_barras,
        cliente: data.cliente_nombre,
        telefono: data.cliente_telefono,
      },
      rifa: {
        nombre: data.rifa_nombre,
        premio: data.premio_descripcion || data.rifa_premio,
      },
      ganador: {
        posicion: data.posicion,
      },
    };
  }

  /**
   * Verificar premio por ID de boleto
   */
  async verificarPorBoletoId(boletoId) {
    const queryBoleto = 'SELECT codigo_barras FROM boletos WHERE id = $1';
    const result = await db.query(queryBoleto, [boletoId]);

    if (result.rows.length === 0) {
      throw new Error('Boleto no encontrado');
    }

    return this.verificarPorCodigoBarras(result.rows[0].codigo_barras);
  }

  /**
   * Obtener boletos ganadores pendientes de entrega
   */
  async obtenerGanadoresPendientes() {
    const query = `
      SELECT
        b.id as boleto_id,
        b.numero,
        b.codigo_barras,
        b.cliente_nombre,
        b.cliente_telefono,
        r.nombre as rifa_nombre,
        r.fecha_sorteo,
        ng.posicion,
        ng.premio_descripcion,
        r.premio as rifa_premio
      FROM boletos b
      INNER JOIN rifas r ON b.rifa_id = r.id
      INNER JOIN numeros_ganadores ng ON b.rifa_id = ng.rifa_id AND b.numero = ng.numero_ganador
      LEFT JOIN entregas_premios ep ON b.id = ep.boleto_id
      WHERE ep.id IS NULL
      ORDER BY r.fecha_sorteo DESC, ng.posicion ASC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Búsqueda avanzada de premios
   */
  async busquedaAvanzada(filtros) {
    let query = `
      SELECT
        b.id as boleto_id,
        b.numero,
        b.codigo_barras,
        b.cliente_nombre,
        r.nombre as rifa_nombre,
        r.fecha_sorteo,
        ng.posicion,
        ng.premio_descripcion,
        ep.id as entrega_id,
        ep.fecha_entrega
      FROM boletos b
      INNER JOIN rifas r ON b.rifa_id = r.id
      INNER JOIN numeros_ganadores ng ON b.rifa_id = ng.rifa_id AND b.numero = ng.numero_ganador
      LEFT JOIN entregas_premios ep ON b.id = ep.boleto_id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (filtros.rifa_id) {
      query += ` AND r.id = $${paramCount}`;
      values.push(filtros.rifa_id);
      paramCount++;
    }

    if (filtros.fecha_desde) {
      query += ` AND r.fecha_sorteo >= $${paramCount}`;
      values.push(filtros.fecha_desde);
      paramCount++;
    }

    if (filtros.fecha_hasta) {
      query += ` AND r.fecha_sorteo <= $${paramCount}`;
      values.push(filtros.fecha_hasta);
      paramCount++;
    }

    if (filtros.entregado !== undefined) {
      if (filtros.entregado) {
        query += ` AND ep.id IS NOT NULL`;
      } else {
        query += ` AND ep.id IS NULL`;
      }
    }

    query += ' ORDER BY r.fecha_sorteo DESC, ng.posicion ASC';

    const result = await db.query(query, values);
    return result.rows;
  }
}

module.exports = new PremiosService();
