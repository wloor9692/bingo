/**
 * MÓDULO: VENTAS DIARIAS
 * Rutas - Define los endpoints de la API
 */

const express = require('express');
const router = express.Router();
const ventasController = require('./ventas.controller');

// Rutas de ventas
router.post('/', ventasController.registrarVenta);                                    // Registrar venta
router.get('/', ventasController.obtenerTodas);                                       // Obtener todas (con filtros)
router.get('/fecha/:fecha', ventasController.obtenerPorFecha);                        // Por fecha
router.get('/rifa/:rifaId', ventasController.obtenerPorRifa);                        // Por rifa
router.get('/resumen/:fecha', ventasController.obtenerResumenDiario);                // Resumen diario
router.get('/resumen/:fechaInicio/:fechaFin', ventasController.obtenerResumenPorRango); // Resumen rango
router.get('/vendedor/:vendedor', ventasController.obtenerResumenPorVendedor);       // Por vendedor
router.delete('/:id', ventasController.eliminar);                                     // Eliminar venta

module.exports = router;
