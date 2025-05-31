// Rutas para gestión de usuarios en la API

const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticate = require('../middleware/authenticate');
const authorizeRole = require('../middleware/authorizeRole');

// Obtener todos los usuarios activos
router.get('/', authenticate, authorizeRole('admin', 'supervisor'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, nombre AS name, correo_electronico AS email, rol AS role FROM users WHERE activo = 1'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener cantidad de usuarios activos (usuarios en línea)
router.get('/activos', authenticate, authorizeRole('admin', 'supervisor'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS activos FROM users WHERE is_online = 1"
    );
    res.json({ activos: rows[0].activos });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios activos' });
  }
});

// Actualizar rol de usuario
router.put('/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  const { role, usuario } = req.body; // usuario que realiza la acción
  const { id } = req.params;
  try {
    await pool.query('UPDATE users SET rol = ? WHERE id = ?', [role, id]);
    const usuarioAccion = req.user ? (req.user.nombre || req.user.correo_electronico) : (req.body?.usuario || 'Desconocido');
    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [`Rol actualizado a "${role}" para el usuario ID ${id}`, usuarioAccion]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el rol' });
  }
});

// Solo admin puede eliminar usuarios
router.delete('/:id', authenticate, authorizeRole('admin'), async (req, res) => {
  const { id } = req.params;
  const usuario = req.body?.usuario || 'Desconocido';
  try {
    // Desactiva y pone offline al usuario
    await pool.query('UPDATE users SET activo = 0, is_online = 0 WHERE id = ?', [id]);
    const usuarioAccion = req.user ? (req.user.nombre || req.user.correo_electronico) : (req.body?.usuario || 'Desconocido');
    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [`Usuario desactivado: ID ${id}`, usuarioAccion]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error al desactivar usuario:', err);
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
});

// Endpoint para actualizar la actividad del usuario autenticado
router.post('/activity', authenticate, async (req, res) => {
  try {
    await pool.query('UPDATE users SET last_login = NOW(), is_online = 1 WHERE id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar actividad' });
  }
});

// Cerrar sesión del usuario
router.post('/logout', authenticate, async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_online = 0 WHERE id = ?', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al cerrar sesión' });
  }
});

// Cerrar sesión automáticamente a usuarios inactivos por más de 10 minutos
router.post('/logout-inactivos', async (req, res) => {
  await pool.query(
    'UPDATE users SET is_online = 0 WHERE last_login < NOW() - INTERVAL 10 MINUTE AND is_online = 1'
  );
  res.json({ success: true });
});

// Endpoint para consultar si el usuario está activo
router.get('/:id/active', async (req, res) => {
  const { id } = req.params;
  const [user] = await pool.query('SELECT activo FROM users WHERE id = ?', [id]);
  if (!user.length) {
    return res.status(404).json({ active: false });
  }
  res.json({ active: user[0].activo === 1 });
});

module.exports = router;