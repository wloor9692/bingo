/**
 * MÓDULO: CONSULTA DE PREMIOS
 * Rutas - Define los endpoints de la API
 */

const express = require('express');
const router = express.Router();
const premiosController = require('./premios.controller');

// Rutas de consulta de premios
router.get('/codigo/:codigoBarras', premiosController.consultarPorCodigoBarras);  // Por código barras
router.get('/numero/:rifaId/:numero', premiosController.consultarPorNumero);      // Por número manual
router.get('/boleto/:boletoId', premiosController.consultarPorBoleto);            // Por ID boleto
router.get('/pendientes', premiosController.consultarGanadoresPendientes);        // Pendientes
router.get('/buscar', premiosController.busquedaAvanzada);                        // Búsqueda avanzada

module.exports = router;
