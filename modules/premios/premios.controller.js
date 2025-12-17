/**
 * MÓDULO: CONSULTA DE PREMIOS
 * Controlador - Maneja las verificaciones de boletos ganadores
 */

const premiosService = require('./premios.service');

class PremiosController {
  /**
   * Consultar premio por código de barras (para lector de códigos)
   */
  async consultarPorCodigoBarras(req, res) {
    try {
      const { codigoBarras } = req.params;

      if (!codigoBarras) {
        return res.status(400).json({
          success: false,
          message: 'Código de barras requerido',
        });
      }

      const resultado = await premiosService.verificarPorCodigoBarras(codigoBarras);

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      console.error('Error al consultar premio:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al consultar premio',
      });
    }
  }

  /**
   * Consultar premio por número y rifa (entrada manual)
   */
  async consultarPorNumero(req, res) {
    try {
      const { rifaId, numero } = req.params;

      if (!rifaId || !numero) {
        return res.status(400).json({
          success: false,
          message: 'ID de rifa y número requeridos',
        });
      }

      const resultado = await premiosService.verificarPorNumero(
        parseInt(rifaId),
        parseInt(numero)
      );

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      console.error('Error al consultar premio:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al consultar premio',
      });
    }
  }

  /**
   * Consultar premio por ID de boleto
   */
  async consultarPorBoleto(req, res) {
    try {
      const { boletoId } = req.params;

      const resultado = await premiosService.verificarPorBoletoId(parseInt(boletoId));

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      console.error('Error al consultar premio:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al consultar premio',
      });
    }
  }

  /**
   * Consultar todos los boletos ganadores pendientes de entrega
   */
  async consultarGanadoresPendientes(req, res) {
    try {
      const ganadores = await premiosService.obtenerGanadoresPendientes();

      res.json({
        success: true,
        data: ganadores,
        total: ganadores.length,
      });
    } catch (error) {
      console.error('Error al consultar ganadores pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ganadores pendientes',
      });
    }
  }

  /**
   * Búsqueda avanzada de premios con filtros
   */
  async busquedaAvanzada(req, res) {
    try {
      const { rifa_id, fecha_desde, fecha_hasta, entregado } = req.query;

      const filtros = {
        rifa_id: rifa_id ? parseInt(rifa_id) : null,
        fecha_desde: fecha_desde || null,
        fecha_hasta: fecha_hasta || null,
        entregado: entregado === 'true',
      };

      const resultados = await premiosService.busquedaAvanzada(filtros);

      res.json({
        success: true,
        data: resultados,
        total: resultados.length,
      });
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      res.status(500).json({
        success: false,
        message: 'Error en búsqueda de premios',
      });
    }
  }
}

module.exports = new PremiosController();
