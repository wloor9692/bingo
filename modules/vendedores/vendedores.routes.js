/**
 * MÓDULO: VENDEDORES
 * Rutas - Define los endpoints de la API
 */

const express = require('express');
const router = express.Router();
const vendedoresController = require('./vendedores.controller');

// Rutas de vendedores
router.post('/', vendedoresController.crear);                          // Crear vendedor
router.get('/', vendedoresController.obtenerTodos);                    // Listar vendedores
router.get('/:id', vendedoresController.obtenerPorId);                 // Obtener por ID
router.get('/codigo/:codigo', vendedoresController.buscarPorCodigo);   // Buscar por código
router.put('/:id', vendedoresController.actualizar);                   // Actualizar
router.patch('/:id/estado', vendedoresController.cambiarEstado);       // Cambiar estado
router.get('/:id/estadisticas', vendedoresController.obtenerEstadisticas); // Estadísticas
router.delete('/:id', vendedoresController.eliminar);                  // Eliminar

module.exports = router;
