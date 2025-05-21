const express = require('express');
const router = express.Router();
const pool = require('../db'); // Ajusta si tu conexión está en otro archivo

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

router.get('/todas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, descripcion, fecha FROM activities ORDER BY fecha DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener actividades' });
  }
});

module.exports = router;