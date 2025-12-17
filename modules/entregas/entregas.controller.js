/**
 * MÓDULO: ENTREGA DE PREMIOS
 * Controlador - Maneja las peticiones HTTP relacionadas con entregas de premios
 */

const entregasService = require('./entregas.service');

class EntregasController {
  /**
   * Registrar la entrega de un premio
   */
  async registrarEntrega(req, res) {
    try {
      const entregaData = req.body;
      const entrega = await entregasService.registrarEntrega(entregaData);

      res.status(201).json({
        success: true,
        message: 'Entrega de premio registrada exitosamente',
        data: entrega,
      });
    } catch (error) {
      console.error('Error al registrar entrega:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar entrega de premio',
      });
    }
  }

  /**
   * Obtener todas las entregas
   */
  async obtenerTodas(req, res) {
    try {
      const { rifaId } = req.query;
      const entregas = await entregasService.obtenerEntregas(rifaId);

      res.json({
        success: true,
        data: entregas,
        total: entregas.length,
      });
    } catch (error) {
      console.error('Error al obtener entregas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener entregas',
      });
    }
  }

  /**
   * Obtener una entrega por ID
   */
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const entrega = await entregasService.obtenerEntregaPorId(id);

      if (!entrega) {
        return res.status(404).json({
          success: false,
          message: 'Entrega no encontrada',
        });
      }

      res.json({
        success: true,
        data: entrega,
      });
    } catch (error) {
      console.error('Error al obtener entrega:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener entrega',
      });
    }
  }

  /**
   * Obtener entregas por rifa
   */
  async obtenerPorRifa(req, res) {
    try {
      const { rifaId } = req.params;
      const entregas = await entregasService.obtenerEntregasPorRifa(rifaId);

      res.json({
        success: true,
        data: entregas,
        total: entregas.length,
      });
    } catch (error) {
      console.error('Error al obtener entregas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener entregas',
      });
    }
  }

  /**
   * Actualizar información de una entrega
   */
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const entregaData = req.body;

      const entrega = await entregasService.actualizarEntrega(id, entregaData);

      if (!entrega) {
        return res.status(404).json({
          success: false,
          message: 'Entrega no encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Entrega actualizada exitosamente',
        data: entrega,
      });
    } catch (error) {
      console.error('Error al actualizar entrega:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar entrega',
      });
    }
  }

  /**
   * Eliminar una entrega
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const eliminada = await entregasService.eliminarEntrega(id);

      if (!eliminada) {
        return res.status(404).json({
          success: false,
          message: 'Entrega no encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Entrega eliminada exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar entrega:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar entrega',
      });
    }
  }

  /**
   * Obtener estadísticas de entregas
   */
  async obtenerEstadisticas(req, res) {
    try {
      const { rifaId } = req.query;
      const estadisticas = await entregasService.obtenerEstadisticas(rifaId);

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

module.exports = new EntregasController();
