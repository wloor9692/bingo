/**
 * MÓDULO: NÚMEROS GANADORES
 * Controlador - Maneja las peticiones HTTP relacionadas con números ganadores
 */

const ganadoresService = require('./ganadores.service');

class GanadoresController {
  /**
   * Registrar número(s) ganador(es) de un sorteo
   */
  async registrarGanador(req, res) {
    try {
      const ganadorData = req.body;
      const ganador = await ganadoresService.registrarGanador(ganadorData);

      res.status(201).json({
        success: true,
        message: 'Número ganador registrado exitosamente',
        data: ganador,
      });
    } catch (error) {
      console.error('Error al registrar ganador:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar número ganador',
      });
    }
  }

  /**
   * Obtener ganadores de una rifa
   */
  async obtenerPorRifa(req, res) {
    try {
      const { rifaId } = req.params;
      const ganadores = await ganadoresService.obtenerGanadoresPorRifa(rifaId);

      res.json({
        success: true,
        data: ganadores,
        total: ganadores.length,
      });
    } catch (error) {
      console.error('Error al obtener ganadores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ganadores',
      });
    }
  }

  /**
   * Verificar si un número es ganador
   */
  async verificarNumero(req, res) {
    try {
      const { rifaId, numero } = req.params;
      const resultado = await ganadoresService.verificarNumeroGanador(
        rifaId,
        parseInt(numero)
      );

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      console.error('Error al verificar número:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar número',
      });
    }
  }

  /**
   * Obtener todos los ganadores con información completa
   */
  async obtenerTodos(req, res) {
    try {
      const ganadores = await ganadoresService.obtenerTodosLosGanadores();

      res.json({
        success: true,
        data: ganadores,
        total: ganadores.length,
      });
    } catch (error) {
      console.error('Error al obtener ganadores:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ganadores',
      });
    }
  }

  /**
   * Eliminar un número ganador
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const eliminado = await ganadoresService.eliminarGanador(id);

      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'Número ganador no encontrado',
        });
      }

      res.json({
        success: true,
        message: 'Número ganador eliminado',
      });
    } catch (error) {
      console.error('Error al eliminar ganador:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar número ganador',
      });
    }
  }

  /**
   * Registrar múltiples ganadores de una vez
   */
  async registrarMultiples(req, res) {
    try {
      const { rifaId } = req.params;
      const { ganadores } = req.body; // Array de ganadores

      if (!Array.isArray(ganadores) || ganadores.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un array de ganadores',
        });
      }

      const resultados = await ganadoresService.registrarMultiplesGanadores(
        rifaId,
        ganadores
      );

      res.status(201).json({
        success: true,
        message: `${resultados.length} números ganadores registrados`,
        data: resultados,
      });
    } catch (error) {
      console.error('Error al registrar ganadores:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar números ganadores',
      });
    }
  }
}

module.exports = new GanadoresController();
