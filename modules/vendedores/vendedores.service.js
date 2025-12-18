/**
 * MÓDULO: VENDEDORES
 * Servicio - Lógica de negocio para vendedores
 */

const db = require('../../config/database');

class VendedoresService {
  /**
   * Crear vendedor
   */
  async crearVendedor(vendedorData) {
    const {
      codigo,
      nombre_completo,
      telefono,
      email,
      direccion,
    } = vendedorData;

    // Validaciones
    if (!codigo || !nombre_completo) {
      throw new Error('Código y nombre completo son obligatorios');
    }

    // Verificar que el código no exista
    const existente = await this.buscarPorCodigo(codigo);
    if (existente) {
      throw new Error(`Ya existe un vendedor con el código ${codigo}`);
    }

    const query = `
      INSERT INTO vendedores (
        codigo, nombre_completo, telefono, email, direccion, activo
      )
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
    `;

    const values = [
      codigo.toUpperCase(),
      nombre_completo,
      telefono || null,
      email || null,
      direccion || null,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Obtener todos los vendedores
   */
  async obtenerVendedores(activo = null) {
    let query = 'SELECT * FROM vendedores';
    const values = [];

    if (activo !== null) {
      query += ' WHERE activo = $1';
      values.push(activo === 'true' || activo === true);
    }

    query += ' ORDER BY nombre_completo ASC';

    const result = await db.query(query, values);
    return result.rows;
  }

  /**
   * Obtener vendedor por ID
   */
  async obtenerVendedorPorId(id) {
    const query = 'SELECT * FROM vendedores WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Buscar vendedor por código
   */
  async buscarPorCodigo(codigo) {
    const query = 'SELECT * FROM vendedores WHERE codigo = $1';
    const result = await db.query(query, [codigo.toUpperCase()]);
    return result.rows[0];
  }

  /**
   * Actualizar vendedor
   */
  async actualizarVendedor(id, vendedorData) {
    const vendedor = await this.obtenerVendedorPorId(id);
    if (!vendedor) return null;

    const {
      codigo,
      nombre_completo,
      telefono,
      email,
      direccion,
    } = vendedorData;

    // Si se está cambiando el código, verificar que no exista
    if (codigo && codigo !== vendedor.codigo) {
      const existente = await this.buscarPorCodigo(codigo);
      if (existente) {
        throw new Error(`Ya existe un vendedor con el código ${codigo}`);
      }
    }

    const query = `
      UPDATE vendedores
      SET
        codigo = COALESCE($1, codigo),
        nombre_completo = COALESCE($2, nombre_completo),
        telefono = COALESCE($3, telefono),
        email = COALESCE($4, email),
        direccion = COALESCE($5, direccion)
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      codigo ? codigo.toUpperCase() : null,
      nombre_completo,
      telefono,
      email,
      direccion,
      id,
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Cambiar estado activo/inactivo
   */
  async cambiarEstado(id, activo) {
    const query = `
      UPDATE vendedores
      SET activo = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await db.query(query, [activo, id]);
    return result.rows[0];
  }

  /**
   * Obtener estadísticas del vendedor
   */
  async obtenerEstadisticas(vendedorId, eventoId = null) {
    const vendedor = await this.obtenerVendedorPorId(vendedorId);
    if (!vendedor) {
      throw new Error('Vendedor no encontrado');
    }

    let queryCondition = 'WHERE b.vendedor_id = $1';
    const values = [vendedorId];

    if (eventoId) {
      queryCondition += ' AND b.evento_id = $2';
      values.push(eventoId);
    }

    // Boletos asignados
    const queryAsignados = `
      SELECT
        COALESCE(SUM(cantidad), 0) as total_asignados
      FROM asignacion_boletos
      ${queryCondition.replace('b.vendedor_id', 'vendedor_id').replace('b.evento_id', 'evento_id')}
    `;
    const resultAsignados = await db.query(queryAsignados, values);

    // Boletos vendidos
    const queryVendidos = `
      SELECT
        COUNT(*) as total_vendidos,
        COALESCE(SUM(precio_venta), 0) as ingresos_totales
      FROM boletos_detalle b
      ${queryCondition}
      AND b.estado = 'vendido'
    `;
    const resultVendidos = await db.query(queryVendidos, values);

    // Boletos no vendidos (devueltos)
    const queryNoVendidos = `
      SELECT
        COUNT(*) as total_no_vendidos
      FROM boletos_detalle b
      ${queryCondition}
      AND b.estado = 'devuelto'
    `;
    const resultNoVendidos = await db.query(queryNoVendidos, values);

    // Devoluciones realizadas
    const queryDevoluciones = `
      SELECT
        COUNT(*) as total_devoluciones,
        COALESCE(SUM(boletos_vendidos), 0) as suma_vendidos,
        COALESCE(SUM(boletos_no_vendidos), 0) as suma_no_vendidos,
        COALESCE(SUM(monto_total), 0) as suma_montos
      FROM devoluciones
      ${queryCondition.replace('b.vendedor_id', 'vendedor_id').replace('b.evento_id', 'evento_id')}
    `;
    const resultDevoluciones = await db.query(queryDevoluciones, values);

    const asignados = parseInt(resultAsignados.rows[0].total_asignados);
    const vendidos = parseInt(resultVendidos.rows[0].total_vendidos);
    const noVendidos = parseInt(resultNoVendidos.rows[0].total_no_vendidos);

    return {
      vendedor: {
        id: vendedor.id,
        codigo: vendedor.codigo,
        nombre: vendedor.nombre_completo,
        activo: vendedor.activo,
      },
      boletos: {
        asignados: asignados,
        vendidos: vendidos,
        no_vendidos: noVendidos,
        pendientes: asignados - vendidos - noVendidos,
        porcentaje_venta: asignados > 0 ? ((vendidos / asignados) * 100).toFixed(2) : 0,
      },
      ingresos: {
        total: parseFloat(resultVendidos.rows[0].ingresos_totales),
      },
      devoluciones: {
        cantidad: parseInt(resultDevoluciones.rows[0].total_devoluciones),
        boletos_vendidos: parseInt(resultDevoluciones.rows[0].suma_vendidos),
        boletos_no_vendidos: parseInt(resultDevoluciones.rows[0].suma_no_vendidos),
        monto_total: parseFloat(resultDevoluciones.rows[0].suma_montos),
      },
    };
  }

  /**
   * Eliminar vendedor
   */
  async eliminarVendedor(id) {
    // Verificar si tiene asignaciones
    const queryVerificar = `
      SELECT COUNT(*) as asignaciones
      FROM asignacion_boletos
      WHERE vendedor_id = $1
    `;
    const resultVerificar = await db.query(queryVerificar, [id]);

    if (parseInt(resultVerificar.rows[0].asignaciones) > 0) {
      throw new Error('No se puede eliminar un vendedor con asignaciones de boletos');
    }

    const query = 'DELETE FROM vendedores WHERE id = $1 RETURNING id';
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }
}

module.exports = new VendedoresService();
