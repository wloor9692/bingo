/**
 * MÓDULO: VENTAS DIARIAS
 * Controlador - Maneja las peticiones HTTP relacionadas con ventas
 */

const ventasService = require('./ventas.service');

class VentasController {
  /**
   * Registrar una venta
   */
  async registrarVenta(req, res) {
    try {
      const ventaData = req.body;
      const venta = await ventasService.registrarVenta(ventaData);

      res.status(201).json({
        success: true,
        message: 'Venta registrada exitosamente',
        data: venta,
      });
    } catch (error) {
      console.error('Error al registrar venta:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar venta',
      });
    }
  }

  /**
   * Obtener ventas por fecha
   */
  async obtenerPorFecha(req, res) {
    try {
      const { fecha } = req.params;
      const ventas = await ventasService.obtenerVentasPorFecha(fecha);

      res.json({
        success: true,
        data: ventas,
        total: ventas.length,
      });
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ventas',
      });
    }
  }

  /**
   * Obtener ventas por rifa
   */
  async obtenerPorRifa(req, res) {
    try {
      const { rifaId } = req.params;
      const ventas = await ventasService.obtenerVentasPorRifa(rifaId);

      res.json({
        success: true,
        data: ventas,
        total: ventas.length,
      });
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ventas',
      });
    }
  }

  /**
   * Obtener resumen de ventas diarias
   */
  async obtenerResumenDiario(req, res) {
    try {
      const { fecha } = req.params;
      const resumen = await ventasService.obtenerResumenDiario(fecha);

      res.json({
        success: true,
        data: resumen,
      });
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener resumen de ventas',
      });
    }
  }

  /**
   * Obtener resumen por rango de fechas
   */
  async obtenerResumenPorRango(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.params;
      const resumen = await ventasService.obtenerResumenPorRango(fechaInicio, fechaFin);

      res.json({
        success: true,
        data: resumen,
      });
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener resumen de ventas',
      });
    }
  }

  /**
   * Obtener resumen por vendedor
   */
  async obtenerResumenPorVendedor(req, res) {
    try {
      const { vendedor } = req.params;
      const { fechaInicio, fechaFin } = req.query;

      const resumen = await ventasService.obtenerResumenPorVendedor(
        vendedor,
        fechaInicio,
        fechaFin
      );

      res.json({
        success: true,
        data: resumen,
      });
    } catch (error) {
      console.error('Error al obtener resumen por vendedor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener resumen por vendedor',
      });
    }
  }

  /**
   * Obtener todas las ventas (con filtros opcionales)
   */
  async obtenerTodas(req, res) {
    try {
      const { rifaId, vendedor, forma_pago } = req.query;
      const filtros = { rifaId, vendedor, forma_pago };

      const ventas = await ventasService.obtenerVentas(filtros);

      res.json({
        success: true,
        data: ventas,
        total: ventas.length,
      });
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener ventas',
      });
    }
  }

  /**
   * Eliminar una venta
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const eliminada = await ventasService.eliminarVenta(id);

      if (!eliminada) {
        return res.status(404).json({
          success: false,
          message: 'Venta no encontrada',
        });
      }

      res.json({
        success: true,
        message: 'Venta eliminada exitosamente',
      });
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar venta',
      });
    }
  }
}

module.exports = new VentasController();
