/**
 * MÓDULO: VENDEDORES
 * Controlador - Gestión de vendedores del sistema de bingo
 */

const vendedoresService = require('./vendedores.service');

class VendedoresController {
  /**
   * Crear vendedor
   */
  async crear(req, res) {
    try {
      const vendedorData = req.body;
      const vendedor = await vendedoresService.crearVendedor(vendedorData);

      res.status(201).json({
        success: true,
        message: 'Vendedor creado exitosamente',
        data: vendedor,
      });
    } catch (error) {
      console.error('Error al crear vendedor:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear vendedor',
      });
    }
  }

  /**
   * Obtener todos los vendedores
   */
  async obtenerTodos(req, res) {
    try {
      const { activo } = req.query;
      const vendedores = await vendedoresService.obtenerVendedores(activo);

      res.json({
        success: true,
        data: vendedores,
        total: vendedores.length,
      });
    } catch (error) {
      console.error('Error al obtener vendedores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener vendedores',
      });
    }
  }

  /**
   * Obtener vendedor por ID
   */
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const vendedor = await vendedoresService.obtenerVendedorPorId(id);

      if (!vendedor) {
        return res.status(404).json({
          success: false,
          message: 'Vendedor no encontrado',
        });
      }

      res.json({
        success: true,
        data: vendedor,
      });
    } catch (error) {
      console.error('Error al obtener vendedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener vendedor',
      });
    }
  }

  /**
   * Buscar vendedor por código
   */
  async buscarPorCodigo(req, res) {
    try {
      const { codigo } = req.params;
      const vendedor = await vendedoresService.buscarPorCodigo(codigo);

      if (!vendedor) {
        return res.status(404).json({
          success: false,
          message: 'Vendedor no encontrado',
        });
      }

      res.json({
        success: true,
        data: vendedor,
      });
    } catch (error) {
      console.error('Error al buscar vendedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar vendedor',
      });
    }
  }

  /**
   * Actualizar vendedor
   */
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const vendedorData = req.body;

      const vendedor = await vendedoresService.actualizarVendedor(id, vendedorData);

      if (!vendedor) {
        return res.status(404).json({
          success: false,
          message: 'Vendedor no encontrado',
        });
      }

      res.json({
        success: true,
        message: 'Vendedor actualizado exitosamente',
        data: vendedor,
      });
    } catch (error) {
      console.error('Error al actualizar vendedor:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar vendedor',
      });
    }
  }

  /**
   * Activar/Desactivar vendedor
   */
  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { activo } = req.body;

      const vendedor = await vendedoresService.cambiarEstado(id, activo);

      if (!vendedor) {
        return res.status(404).json({
          success: false,
          message: 'Vendedor no encontrado',
        });
      }

      res.json({
        success: true,
        message: `Vendedor ${activo ? 'activado' : 'desactivado'}`,
        data: vendedor,
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al cambiar estado',
      });
    }
  }

  /**
   * Obtener estadísticas de vendedor
   */
  async obtenerEstadisticas(req, res) {
    try {
      const { id } = req.params;
      const { eventoId } = req.query;

      const estadisticas = await vendedoresService.obtenerEstadisticas(id, eventoId);

      res.json({
        success: true,
        data: estadisticas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
      });
    }
  }

  /**
   * Eliminar vendedor
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const eliminado = await vendedoresService.eliminarVendedor(id);

      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Vendedor no encontrado',
        });
      }

      res.json({
        success: true,
        message: 'Vendedor eliminado exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar vendedor:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar vendedor',
      });
    }
  }
}

module.exports = new VendedoresController();
