/**
 * MÓDULO: GESTIÓN DE BOLETOS
 * Rutas - Define los endpoints de la API
 */

const express = require('express');
const router = express.Router();
const boletosController = require('./boletos.controller');

// Rutas de boletos
router.post('/generar/:rifaId', boletosController.generarBoletos);           // Generar boletos para rifa
router.get('/rifa/:rifaId', boletosController.obtenerPorRifa);              // Obtener boletos por rifa
router.get('/:id', boletosController.obtenerPorId);                         // Obtener boleto por ID
router.get('/codigo/:codigoBarras', boletosController.buscarPorCodigoBarras); // Buscar por código
router.put('/:id/vender', boletosController.venderBoleto);                  // Vender boleto
router.put('/:id/cancelar', boletosController.cancelarVenta);               // Cancelar venta
router.delete('/rifa/:rifaId', boletosController.eliminarTodosPorRifa);     // Eliminar todos por rifa

module.exports = router;
