// controllers/salesController.js

const salesService = require('../services/salesService');

exports.getAllSales = async (req, res) => {
  try {
    const ventas = await salesService.getAllSalesWithProducts();
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
};

exports.getSalesResumen = async (req, res) => {
  try {
    const resumen = await salesService.getSalesResumen();
    res.json(resumen);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener resumen de ventas' });
  }
};

exports.getVentasPorDia = async (req, res) => {
  try {
    const data = await salesService.getVentasPorDia();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas por día', error: error.message });
  }
};

exports.getVentasPorDiaAnterior = async (req, res) => {
  try {
    const data = await salesService.getVentasPorDiaAnterior();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas semana anterior' });
  }
};

exports.getMetodosPago = async (req, res) => {
  try {
    const data = await salesService.getMetodosPago();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener métodos de pago' });
  }
};

exports.getVentaById = async (req, res) => {
  try {
    const venta = await salesService.getSaleById(req.params.id);
    res.json(venta);
  } catch (error) {
    console.error('❌ Error al obtener detalle de venta:', error);
    res.status(500).json({ message: 'Error al obtener detalle de venta' });
  }
};

exports.createVenta = async (req, res) => {
  try {
    const ventaId = await salesService.createVenta(req.body, req.user);
    res.status(200).json({ ventaId });
  } catch (error) {
    console.error('❌ Error en createVenta:', error); // 👈 Esto ayuda a ver el error real
    res.status(error.status || 500).json({ message: error.message || 'Error al registrar venta' });
  }
};

exports.anularVenta = async (req, res) => {
  try {
    const result = await salesService.anularVenta(req.params.id, req.body.motivo, req.body.user_id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al anular venta' });
  }
};

exports.generarComprobante = async (req, res) => {
  try {
    const comprobante = await salesService.generarComprobante(req.params.id);
    res.json(comprobante);
  } catch (error) {
    res.status(500).json({ message: 'Error al generar comprobante', error });
  }
};
