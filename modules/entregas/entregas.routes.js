/**
 * MÓDULO: ENTREGA DE PREMIOS
 * Rutas - Define los endpoints de la API
 */

const express = require('express');
const router = express.Router();
const entregasController = require('./entregas.controller');

// Rutas de entregas de premios
router.post('/', entregasController.registrarEntrega);                     // Registrar entrega
router.get('/', entregasController.obtenerTodas);                          // Obtener todas
router.get('/estadisticas', entregasController.obtenerEstadisticas);       // Estadísticas
router.get('/rifa/:rifaId', entregasController.obtenerPorRifa);           // Por rifa
router.get('/:id', entregasController.obtenerPorId);                       // Por ID
router.put('/:id', entregasController.actualizar);                         // Actualizar
router.delete('/:id', entregasController.eliminar);                        // Eliminar

module.exports = router;
