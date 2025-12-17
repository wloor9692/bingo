/**
 * MÓDULO: GESTIÓN DE RIFAS
 * Controlador - Maneja las peticiones HTTP relacionadas con rifas
 */

const rifasService = require('./rifas.service');

class RifasController {
  /**
   * Crear una nueva rifa
   */
  async crear(req, res) {
    try {
      const rifaData = req.body;
      const nuevaRifa = await rifasService.crearRifa(rifaData);

      res.status(201).json({
        success: true,
        message: 'Rifa creada exitosamente',
        data: nuevaRifa,
      });
    } catch (error) {
      console.error('Error al crear rifa:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear la rifa',
      });
    }
  }

  /**
   * Obtener todas las rifas
   */
  async obtenerTodas(req, res) {
    try {
      const { estado } = req.query;
      const rifas = await rifasService.obtenerRifas(estado);

      res.json({
        success: true,
        data: rifas,
        total: rifas.length,
      });
    } catch (error) {
      console.error('Error al obtener rifas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener rifas',
      });
    }
  }

  /**
   * Obtener una rifa por ID
   */
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const rifa = await rifasService.obtenerRifaPorId(id);

      if (!rifa) {
        return res.status(404).json({
          success: false,
          message: 'Rifa no encontrada',
        });
      }

      res.json({
        success: true,
        data: rifa,
      });
    } catch (error) {
      console.error('Error al obtener rifa:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la rifa',
      });
    }
  }

  /**
   * Actualizar una rifa
   */
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const rifaData = req.body;

      const rifaActualizada = await rifasService.actualizarRifa(id, rifaData);

      if (!rifaActualizada) {
        return res.status(404).json({
          success: false,
          message: 'Rifa no encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Rifa actualizada exitosamente',
        data: rifaActualizada,
      });
    } catch (error) {
      console.error('Error al actualizar rifa:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar la rifa',
      });
    }
  }

  /**
   * Eliminar una rifa
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const eliminada = await rifasService.eliminarRifa(id);

      if (!eliminada) {
        return res.status(404).json({
          success: false,
          message: 'Rifa no encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Rifa eliminada exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar rifa:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar la rifa',
      });
    }
  }

  /**
   * Cambiar estado de una rifa
   */
  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const rifa = await rifasService.cambiarEstado(id, estado);

      if (!rifa) {
        return res.status(404).json({
          success: false,
          message: 'Rifa no encontrada',
        });
      }

      res.json({
        success: true,
        message: `Rifa marcada como ${estado}`,
        data: rifa,
      });
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al cambiar estado de la rifa',
      });
    }
  }

  /**
   * Obtener estadísticas de una rifa
   */
  async obtenerEstadisticas(req, res) {
    try {
      const { id } = req.params;
      const estadisticas = await rifasService.obtenerEstadisticas(id);

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
}

module.exports = new RifasController();
