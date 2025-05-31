// Rutas para gestión y consulta de actividades en la API

const express = require('express');
const router = express.Router();
const pool = require('../db'); // Conexión a la base de datos

// Obtener las últimas 10 actividades
router.get('/ultimas', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, descripcion, fecha FROM activities ORDER BY fecha DESC LIMIT 10'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener actividades' });
  }
});

// Obtener todas las actividades
router.get('/todas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM activities ORDER BY fecha DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
});

module.exports = router;