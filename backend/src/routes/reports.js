// Rutas para generación de reportes en la API

const express = require('express');
const pool = require('../db');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

// Reporte de ventas por rango de fechas
router.get('/by-date', async (req, res) => {
  let { from, to, user } = req.query; // Usuario que genera el reporte (opcional)
  try {
    // Consulta para obtener ventas con detalles y usuario
    let query = `
      SELECT v.id, v.fecha, p.name as product, dv.cantidad, (dv.cantidad * dv.precio_unitario) as total,
             u.nombre as usuario
      FROM ventas v
      JOIN detalle_ventas dv ON v.id = dv.venta_id
      JOIN products p ON dv.producto_id = p.id
      JOIN users u ON v.user_id = u.id
    `;
    let params = [];
    if (from && to) {
      query += ' WHERE v.fecha BETWEEN ? AND ?';
      params = [from, to];
    }
    // Si solo uno de los dos está definido, agrega un filtro individual
    else if (from) {
      query += ' WHERE v.fecha >= ?';
      params = [from];
    }
    else if (to) {
      query += ' WHERE v.fecha <= ?';
      params = [to];
    }
    query += ' ORDER BY v.fecha ASC';
    const [ventas] = await pool.query(query, params);

    // Determina el usuario autenticado si existe
    const usuario = req.user
      ? (req.user.nombre || req.user.correo_electronico)
      : (user || 'Desconocido');

    // Registrar actividad de generación de reporte
    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [
        `Reporte de ventas generado${usuario ? ' por ' + usuario : ''} (${from || 'inicio'} a ${to || 'hoy'})`,
        usuario
      ]
    );

    res.json(ventas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el reporte' });
  }
});

module.exports = router;