/**
 * MÓDULO: GESTIÓN DE BOLETOS
 * Controlador - Maneja las peticiones HTTP relacionadas con boletos
 */

const boletosService = require('./boletos.service');

class BoletosController {
  /**
   * Generar boletos para una rifa
   */
  async generarBoletos(req, res) {
    try {
      const { rifaId } = req.params;
      const boletos = await boletosService.generarBoletosParaRifa(rifaId);

      res.status(201).json({
        success: true,
        message: `${boletos.length} boletos generados exitosamente`,
        data: boletos,
      });
    } catch (error) {
      console.error('Error al generar boletos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar boletos',
      });
    }
  }

  /**
   * Obtener todos los boletos de una rifa
   */
  async obtenerPorRifa(req, res) {
    try {
      const { rifaId } = req.params;
      const { estado } = req.query;

      const boletos = await boletosService.obtenerBoletosPorRifa(rifaId, estado);

      res.json({
        success: true,
        data: boletos,
        total: boletos.length,
      });
    } catch (error) {
      console.error('Error al obtener boletos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener boletos',
      });
    }
  }

  /**
   * Obtener un boleto por ID
   */
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const boleto = await boletosService.obtenerBoletoPorId(id);

      if (!boleto) {
        return res.status(404).json({
          success: false,
          message: 'Boleto no encontrado',
        });
      }

      res.json({
        success: true,
        data: boleto,
      });
    } catch (error) {
      console.error('Error al obtener boleto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el boleto',
      });
    }
  }

  /**
   * Buscar boleto por código de barras
   */
  async buscarPorCodigoBarras(req, res) {
    try {
      const { codigoBarras } = req.params;
      const boleto = await boletosService.buscarPorCodigoBarras(codigoBarras);

      if (!boleto) {
        return res.status(404).json({
          success: false,
          message: 'Boleto no encontrado',
        });
      }

      res.json({
        success: true,
        data: boleto,
      });
    } catch (error) {
      console.error('Error al buscar boleto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar el boleto',
      });
    }
  }

  /**
   * Vender un boleto
   */
  async venderBoleto(req, res) {
    try {
      const { id } = req.params;
      const datosVenta = req.body;

      const boleto = await boletosService.venderBoleto(id, datosVenta);

      if (!boleto) {
        return res.status(404).json({
          success: false,
          message: 'Boleto no encontrado',
        });
      }

      res.json({
        success: true,
        message: 'Boleto vendido exitosamente',
        data: boleto,
      });
    } catch (error) {
      console.error('Error al vender boleto:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al vender el boleto',
      });
    }
  }

  /**
   * Cancelar venta de un boleto
   */
  async cancelarVenta(req, res) {
    try {
      const { id } = req.params;
      const boleto = await boletosService.cancelarVenta(id);

      if (!boleto) {
        return res.status(404).json({
          success: false,
          message: 'Boleto no encontrado',
        });
      }

      res.json({
        success: true,
        message: 'Venta cancelada, boleto disponible nuevamente',
        data: boleto,
      });
    } catch (error) {
      console.error('Error al cancelar venta:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al cancelar venta',
      });
    }
  }

  /**
   * Eliminar todos los boletos de una rifa
   */
  async eliminarTodosPorRifa(req, res) {
    try {
      const { rifaId } = req.params;
      const cantidad = await boletosService.eliminarTodosPorRifa(rifaId);

      res.json({
        success: true,
        message: `${cantidad} boletos eliminados`,
      });
    } catch (error) {
      console.error('Error al eliminar boletos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar boletos',
      });
    }
  }
}

module.exports = new BoletosController();
