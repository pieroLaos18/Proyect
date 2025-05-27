// Rutas para gestión de usuarios en la API

const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Configura el pool de conexión MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '18122002',
  database: 'web_sales_system'
});

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre AS name, correo_electronico AS email, rol AS role FROM users'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener cantidad de usuarios activos (último login en 24h)
router.get('/activos', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS activos FROM users WHERE last_login >= NOW() - INTERVAL 1 DAY"
    );
    res.json({ activos: rows[0].activos });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios activos' });
  }
});

// Actualizar rol de usuario
router.put('/:id', async (req, res) => {
  const { role, usuario } = req.body; // usuario que realiza la acción
  const { id } = req.params;
  try {
    await pool.query('UPDATE users SET rol = ? WHERE id = ?', [role, id]);
    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [`Rol actualizado a "${role}" para el usuario ID ${id}`, usuario || 'Desconocido']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el rol' });
  }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const usuario = req.body.usuario; // usuario que realiza la acción
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [`Usuario eliminado: ID ${id}`, usuario || 'Desconocido']
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;