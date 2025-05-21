const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Conexión a la base de datos

const router = express.Router();

// Ruta para el inicio de sesión
router.post('/login', async (req, res) => {
  const { correo_electronico, password } = req.body;

  try {
    const [user] = await pool.query('SELECT * FROM users WHERE correo_electronico = ?', [correo_electronico]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user[0].id]);
    await pool.query(
      'INSERT INTO activities (descripcion) VALUES (?)',
      [`Inicio de sesión del usuario ${user[0].nombre} (${user[0].correo_electronico})`]
    );
    const token = jwt.sign({ id: user[0].id }, 'secretKey', { expiresIn: '1h' });

    res.status(200).json({
      token,
      user: {
        id: user[0].id,
        name: user[0].nombre,
        email: user[0].correo_electronico,
      },
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para el registro de usuarios
router.post('/register', async (req, res) => {
  const { correo_electronico, password, nombre, apellido, rol, direccion } = req.body;

  try {
    const [existingUser] = await pool.query('SELECT * FROM users WHERE correo_electronico = ?', [correo_electronico]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El usuario ya está registrado' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await pool.query(
      'INSERT INTO users (correo_electronico, password, nombre, apellido, rol, direccion) VALUES (?, ?, ?, ?, ?, ?)',
      [correo_electronico, hashedPassword, nombre, apellido, rol || 'Usuario', direccion]
    );
    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [
        `Registro de nuevo usuario: ${nombre} (${correo_electronico})`,
        nombre
      ]
    );

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;