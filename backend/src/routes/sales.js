// routes/salesRoutes.js

const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authenticate = require('../middleware/authenticate');

// Rutas públicas
router.get('/', salesController.getAllSales);
router.get('/resumen', salesController.getSalesResumen);
router.get('/ventas-por-dia', salesController.getVentasPorDia);
router.get('/ventas-por-dia-anterior', salesController.getVentasPorDiaAnterior);
router.get('/metodos-pago', salesController.getMetodosPago);
router.get('/:id', salesController.getVentaById);
router.get('/comprobante/:id', salesController.generarComprobante); // comprobante simulado

// Rutas protegidas
router.post('/', authenticate, salesController.createVenta);
router.put('/anular/:id', authenticate, salesController.anularVenta);

module.exports = router;
