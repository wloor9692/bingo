/**
 * MÓDULO: NÚMEROS GANADORES
 * Servicio - Lógica de negocio para números ganadores
 */

const db = require('../../config/database');

class GanadoresService {
  /**
   * Registrar un número ganador
   */
  async registrarGanador(ganadorData) {
    const {
      rifa_id,
      numero_ganador,
      posicion = '1er lugar',
      premio_descripcion,
    } = ganadorData;

    // Validaciones
    if (!rifa_id || numero_ganador === undefined || numero_ganador === null) {
      throw new Error('Faltan campos obligatorios: rifa_id y numero_ganador');
    }

    // Verificar que la rifa existe
    const queryRifa = 'SELECT * FROM rifas WHERE id = $1';
    const resultRifa = await db.query(queryRifa, [rifa_id]);

    if (resultRifa.rows.length === 0) {
      throw new Error('Rifa no encontrada');
    }

    const rifa = resultRifa.rows[0];

    // Verificar que el número está en el rango válido
    if (numero_ganador < rifa.numero_inicial || numero_ganador > rifa.numero_final) {
      throw new Error(
        `El número debe estar entre ${rifa.numero_inicial} y ${rifa.numero_final}`
      );
    }

    // Verificar que existe un boleto con ese número
    const queryBoleto = `
      SELECT * FROM boletos
      WHERE rifa_id = $1 AND numero = $2
    `;
    const resultBoleto = await db.query(queryBoleto, [rifa_id, numero_ganador]);

    if (resultBoleto.rows.length === 0) {
      throw new Error(`No existe un boleto con el número ${numero_ganador} para esta rifa`);
    }

    // Registrar el ganador
    const query = `
      INSERT INTO numeros_ganadores (
        rifa_id, numero_ganador, posicion, premio_descripcion, fecha_sorteo
      )
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const values = [rifa_id, numero_ganador, posicion, premio_descripcion || rifa.premio];

    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        throw new Error('Este número ya fue registrado como ganador para esta posición');
      }
      throw error;
    }
  }

  /**
   * Obtener ganadores de una rifa específica
   */
  async obtenerGanadoresPorRifa(rifaId) {
    const query = `
      SELECT
        ng.*,
        r.nombre as rifa_nombre,
        r.premio as rifa_premio,
        b.codigo_barras,
        b.cliente_nombre,
        b.cliente_telefono
      FROM numeros_ganadores ng
      INNER JOIN rifas r ON ng.rifa_id = r.id
      LEFT JOIN boletos b ON ng.rifa_id = b.rifa_id AND ng.numero_ganador = b.numero
      WHERE ng.rifa_id = $1
      ORDER BY ng.fecha_sorteo DESC, ng.posicion ASC
    `;

    const result = await db.query(query, [rifaId]);
    return result.rows;
  }

  /**
   * Verificar si un número es ganador en una rifa
   */
  async verificarNumeroGanador(rifaId, numero) {
    const query = `
      SELECT
        ng.*,
        r.nombre as rifa_nombre,
        r.premio as rifa_premio,
        b.codigo_barras,
        b.cliente_nombre,
        b.cliente_telefono,
        b.vendedor
      FROM numeros_ganadores ng
      INNER JOIN rifas r ON ng.rifa_id = r.id
      LEFT JOIN boletos b ON ng.rifa_id = b.rifa_id AND ng.numero_ganador = b.numero
      WHERE ng.rifa_id = $1 AND ng.numero_ganador = $2
    `;

    const result = await db.query(query, [rifaId, numero]);

    if (result.rows.length === 0) {
      return {
        es_ganador: false,
        numero: numero,
        mensaje: 'Este número no es ganador',
      };
    }

    return {
      es_ganador: true,
      numero: numero,
      mensaje: '¡FELICIDADES! Este número es GANADOR',
      detalles: result.rows[0],
    };
  }

  /**
   * Obtener todos los ganadores de todas las rifas
   */
  async obtenerTodosLosGanadores() {
    const query = `
      SELECT
        ng.*,
        r.nombre as rifa_nombre,
        r.fecha_sorteo as rifa_fecha,
        r.premio as rifa_premio,
        b.codigo_barras,
        b.cliente_nombre,
        b.cliente_telefono
      FROM numeros_ganadores ng
      INNER JOIN rifas r ON ng.rifa_id = r.id
      LEFT JOIN boletos b ON ng.rifa_id = b.rifa_id AND ng.numero_ganador = b.numero
      ORDER BY ng.fecha_sorteo DESC, r.fecha_sorteo DESC
    `;

    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Eliminar un número ganador
   */
  async eliminarGanador(id) {
    const query = 'DELETE FROM numeros_ganadores WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  /**
   * Registrar múltiples ganadores para una rifa
   * Útil cuando hay varios premios (1er, 2do, 3er lugar, etc.)
   */
  async registrarMultiplesGanadores(rifaId, ganadores) {
    const client = await db.pool.connect();
    const resultados = [];

    try {
      await client.query('BEGIN');

      for (const ganador of ganadores) {
        const ganadorCompleto = {
          rifa_id: rifaId,
          numero_ganador: ganador.numero_ganador,
          posicion: ganador.posicion || '1er lugar',
          premio_descripcion: ganador.premio_descripcion,
        };

        const registrado = await this.registrarGanador(ganadorCompleto);
        resultados.push(registrado);
      }

      await client.query('COMMIT');
      return resultados;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new GanadoresService();
