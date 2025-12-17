/**
 * MÓDULO: VENTAS DIARIAS
 * Servicio - Lógica de negocio para ventas
 */

const db = require('../../config/database');

class VentasService {
  /**
   * Registrar una venta
   * Se registra automáticamente cuando un boleto es vendido
   */
  async registrarVenta(ventaData) {
    const {
      rifa_id,
      boleto_id,
      precio_venta,
      vendedor,
      forma_pago = 'efectivo',
      fecha_venta,
    } = ventaData;

    // Validaciones
    if (!rifa_id || !boleto_id || !precio_venta) {
      throw new Error('Faltan campos obligatorios: rifa_id, boleto_id, precio_venta');
    }

    // Verificar que el boleto existe y pertenece a la rifa
    const queryBoleto = `
      SELECT * FROM boletos
      WHERE id = $1 AND rifa_id = $2
    `;
    const resultBoleto = await db.query(queryBoleto, [boleto_id, rifa_id]);

    if (resultBoleto.rows.length === 0) {
      throw new Error('Boleto no encontrado o no pertenece a esta rifa');
    }

    // Registrar la venta
    const query = `
      INSERT INTO ventas_diarias (
        rifa_id, fecha_venta, boleto_id, precio_venta, vendedor, forma_pago
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      rifa_id,
      fecha_venta || new Date().toISOString().split('T')[0], // Fecha actual por defecto
      boleto_id,
      precio_venta,
      vendedor || 'Mostrador',
      forma_pago,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Obtener ventas por fecha específica
   */
  async obtenerVentasPorFecha(fecha) {
    const query = `
      SELECT
        v.*,
        r.nombre as rifa_nombre,
        b.numero as boleto_numero,
        b.codigo_barras,
        b.cliente_nombre
      FROM ventas_diarias v
      INNER JOIN rifas r ON v.rifa_id = r.id
      INNER JOIN boletos b ON v.boleto_id = b.id
      WHERE v.fecha_venta = $1
      ORDER BY v.created_at DESC
    `;

    const result = await db.query(query, [fecha]);
    return result.rows;
  }

  /**
   * Obtener ventas por rifa
   */
  async obtenerVentasPorRifa(rifaId) {
    const query = `
      SELECT
        v.*,
        r.nombre as rifa_nombre,
        b.numero as boleto_numero,
        b.codigo_barras,
        b.cliente_nombre
      FROM ventas_diarias v
      INNER JOIN rifas r ON v.rifa_id = r.id
      INNER JOIN boletos b ON v.boleto_id = b.id
      WHERE v.rifa_id = $1
      ORDER BY v.fecha_venta DESC, v.created_at DESC
    `;

    const result = await db.query(query, [rifaId]);
    return result.rows;
  }

  /**
   * Obtener resumen de ventas diarias
   */
  async obtenerResumenDiario(fecha) {
    const query = `
      SELECT
        v.fecha_venta,
        COUNT(v.id) as total_ventas,
        SUM(v.precio_venta) as ingresos_totales,
        AVG(v.precio_venta) as precio_promedio,
        COUNT(DISTINCT v.rifa_id) as rifas_activas,
        COUNT(DISTINCT v.vendedor) as vendedores_activos,
        json_agg(DISTINCT jsonb_build_object(
          'forma_pago', v.forma_pago,
          'cantidad', (
            SELECT COUNT(*) FROM ventas_diarias
            WHERE fecha_venta = v.fecha_venta AND forma_pago = v.forma_pago
          ),
          'total', (
            SELECT SUM(precio_venta) FROM ventas_diarias
            WHERE fecha_venta = v.fecha_venta AND forma_pago = v.forma_pago
          )
        )) as por_forma_pago
      FROM ventas_diarias v
      WHERE v.fecha_venta = $1
      GROUP BY v.fecha_venta
    `;

    const result = await db.query(query, [fecha]);

    if (result.rows.length === 0) {
      return {
        fecha: fecha,
        total_ventas: 0,
        ingresos_totales: 0,
        precio_promedio: 0,
        rifas_activas: 0,
        vendedores_activos: 0,
        por_forma_pago: [],
      };
    }

    return result.rows[0];
  }

  /**
   * Obtener resumen por rango de fechas
   */
  async obtenerResumenPorRango(fechaInicio, fechaFin) {
    const query = `
      SELECT
        DATE(v.fecha_venta) as fecha,
        COUNT(v.id) as total_ventas,
        SUM(v.precio_venta) as ingresos_totales,
        AVG(v.precio_venta) as precio_promedio
      FROM ventas_diarias v
      WHERE v.fecha_venta BETWEEN $1 AND $2
      GROUP BY DATE(v.fecha_venta)
      ORDER BY fecha DESC
    `;

    const result = await db.query(query, [fechaInicio, fechaFin]);

    // Calcular totales generales
    const totales = result.rows.reduce(
      (acc, row) => {
        acc.total_ventas += parseInt(row.total_ventas);
        acc.ingresos_totales += parseFloat(row.ingresos_totales);
        return acc;
      },
      { total_ventas: 0, ingresos_totales: 0 }
    );

    return {
      rango: {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      },
      totales: {
        ventas: totales.total_ventas,
        ingresos: totales.ingresos_totales,
        promedio_diario:
          result.rows.length > 0 ? totales.ingresos_totales / result.rows.length : 0,
      },
      por_dia: result.rows,
    };
  }

  /**
   * Obtener resumen por vendedor
   */
  async obtenerResumenPorVendedor(vendedor, fechaInicio = null, fechaFin = null) {
    let query = `
      SELECT
        v.vendedor,
        COUNT(v.id) as total_ventas,
        SUM(v.precio_venta) as ingresos_totales,
        AVG(v.precio_venta) as precio_promedio,
        MIN(v.fecha_venta) as primera_venta,
        MAX(v.fecha_venta) as ultima_venta
      FROM ventas_diarias v
      WHERE v.vendedor = $1
    `;

    const values = [vendedor];

    if (fechaInicio && fechaFin) {
      query += ' AND v.fecha_venta BETWEEN $2 AND $3';
      values.push(fechaInicio, fechaFin);
    }

    query += ' GROUP BY v.vendedor';

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return {
        vendedor: vendedor,
        total_ventas: 0,
        ingresos_totales: 0,
        precio_promedio: 0,
      };
    }

    return result.rows[0];
  }

  /**
   * Obtener ventas con filtros opcionales
   */
  async obtenerVentas(filtros = {}) {
    let query = `
      SELECT
        v.*,
        r.nombre as rifa_nombre,
        b.numero as boleto_numero,
        b.codigo_barras
      FROM ventas_diarias v
      INNER JOIN rifas r ON v.rifa_id = r.id
      INNER JOIN boletos b ON v.boleto_id = b.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    if (filtros.rifaId) {
      query += ` AND v.rifa_id = $${paramCount}`;
      values.push(filtros.rifaId);
      paramCount++;
    }

    if (filtros.vendedor) {
      query += ` AND v.vendedor = $${paramCount}`;
      values.push(filtros.vendedor);
      paramCount++;
    }

    if (filtros.forma_pago) {
      query += ` AND v.forma_pago = $${paramCount}`;
      values.push(filtros.forma_pago);
      paramCount++;
    }

    query += ' ORDER BY v.created_at DESC LIMIT 100';

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Eliminar una venta
   */
  async eliminarVenta(id) {
    const query = 'DELETE FROM ventas_diarias WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }
}

module.exports = new VentasService();
