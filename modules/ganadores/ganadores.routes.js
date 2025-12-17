/**
 * MÓDULO: NÚMEROS GANADORES
 * Rutas - Define los endpoints de la API
 */

const express = require('express');
const router = express.Router();
const ganadoresController = require('./ganadores.controller');

// Rutas de números ganadores
router.post('/', ganadoresController.registrarGanador);                        // Registrar ganador
router.post('/multiples/:rifaId', ganadoresController.registrarMultiples);     // Registrar múltiples
router.get('/', ganadoresController.obtenerTodos);                             // Obtener todos
router.get('/rifa/:rifaId', ganadoresController.obtenerPorRifa);              // Obtener por rifa
router.get('/verificar/:rifaId/:numero', ganadoresController.verificarNumero); // Verificar número
router.delete('/:id', ganadoresController.eliminar);                           // Eliminar ganador

module.exports = router;
