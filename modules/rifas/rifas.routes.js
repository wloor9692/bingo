/**
 * MÓDULO: GESTIÓN DE RIFAS
 * Rutas - Define los endpoints de la API
 */

const express = require('express');
const router = express.Router();
const rifasController = require('./rifas.controller');

// Rutas de rifas
router.post('/', rifasController.crear);                        // Crear rifa
router.get('/', rifasController.obtenerTodas);                  // Listar todas las rifas
router.get('/:id', rifasController.obtenerPorId);               // Obtener rifa por ID
router.put('/:id', rifasController.actualizar);                 // Actualizar rifa
router.delete('/:id', rifasController.eliminar);                // Eliminar rifa
router.patch('/:id/estado', rifasController.cambiarEstado);     // Cambiar estado
router.get('/:id/estadisticas', rifasController.obtenerEstadisticas); // Estadísticas

module.exports = router;
