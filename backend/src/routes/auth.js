// Rutas de autenticación (login y registro de usuarios) para la API

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('../db'); // Conexión a la base de datos
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Ruta para el inicio de sesión
router.post('/login', async (req, res) => {
  const { correo_electronico, password } = req.body;

  try {
    // 1. Busca el usuario por correo electrónico (sin filtrar por activo)
    const [user] = await pool.query(
      'SELECT * FROM users WHERE correo_electronico = ?',
      [correo_electronico]
    );
    if (user.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' }); // <-- status 404, mensaje sin punto
    }

    // 2. Verifica si está activo
    if (user[0].activo !== 1) {
      return res.status(403).json({ message: 'Usuario inactivo' }); // <-- mensaje sin punto
    }

    // 3. Verifica la contraseña
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' }); // <-- mensaje sin punto
    }

    // 4. Actualiza el último login y registra la actividad
    await pool.query('UPDATE users SET last_login = NOW(), is_online = 1 WHERE id = ?', [user[0].id]);
    await pool.query(
      'INSERT INTO activities (descripcion) VALUES (?)',
      [`Inicio de sesión del usuario ${user[0].nombre} (${user[0].correo_electronico})`]
    );

    // 5. Genera el token JWT
    const token = jwt.sign(
      { id: user[0].id, rol: user[0].rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 6. Devuelve el token y los datos básicos del usuario
    res.status(200).json({
      token,
      user: {
        id: user[0].id,
        name: user[0].nombre,
        email: user[0].correo_electronico,
        rol: user[0].rol
      },
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Ruta para el registro de usuarios
router.post(
  '/register',
  [
    body('correo_electronico').isEmail().withMessage('Correo electrónico inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    // Puedes agregar más validaciones según tus necesidades
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { correo_electronico, password, nombre, apellido, rol, direccion } = req.body;

    try {
      // Verifica si el usuario ya existe
      const [existingUser] = await pool.query(
        'SELECT * FROM users WHERE correo_electronico = ? AND activo = 1',
        [correo_electronico]
      );
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'El email ya está en uso' });
      }

      // Hashea la contraseña antes de guardar
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Inserta el nuevo usuario en la base de datos
      await pool.query(
        'INSERT INTO users (correo_electronico, password, nombre, apellido, rol, direccion) VALUES (?, ?, ?, ?, ?, ?)',
        [correo_electronico, hashedPassword, nombre, apellido, (rol || 'cajero').toLowerCase(), direccion]
      );
      await pool.query(
        'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
        [
          `Registro de nuevo usuario: ${nombre} (${correo_electronico})`,
          nombre
        ]
      );

      res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
);

// Solicitar recuperación de contraseña
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    // Buscar usuario
    const [users] = await pool.query('SELECT * FROM users WHERE correo_electronico = ?', [email]);
    if (!users.length) return res.status(404).json({ message: 'Correo no registrado' });

    // Generar token y expiración (1 hora)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar en la BD
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE correo_electronico = ?',
      [token, expires, email]
    );

    // Configura tu transporte de correo (ajusta con tus credenciales)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Enlace de recuperación
    const resetUrl = `http://localhost:5174/reset-password/${token}`;

    // Envía el correo
    await transporter.sendMail({
      from: `"Web Sales System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recupera tu contraseña',
      html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>Este enlace expirará en 1 hora.</p>`
    });

    res.json({ message: 'Correo de recuperación enviado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al enviar el correo de recuperación' });
  }
});

// Restablecer contraseña usando el token
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    // Buscar usuario con ese token y que no haya expirado
    const [users] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    if (!users.length) return res.status(400).json({ message: 'Token inválido o expirado' });

    // Hashear la nueva contraseña
    const hashed = await bcrypt.hash(password, 10);

    // Actualizar contraseña y limpiar token
    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashed, users[0].id]
    );

    res.json({ message: 'Contraseña restablecida correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
});

module.exports = router;