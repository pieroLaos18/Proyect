const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { generarToken } = require('../utils/jwtHelper');
const { enviarCorreoRecuperacion } = require('../utils/emailSender');
const { registrarSesion } = require('../services/sessionService');
const { enviarCorreoVerificacion } = require('../utils/emailSender');

const login = async (req, res) => {
  const { correo_electronico, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE correo_electronico = ?', [correo_electronico]);
    const user = users[0];

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // ✅ Validación de cuenta verificada
    if (user.verificado !== 1) {
      return res.status(403).json({ message: 'Tu cuenta aún no ha sido verificada. Revisa tu correo electrónico.' });
    }

    // ✅ Validación de cuenta activa
    if (user.activo !== 1) return res.status(403).json({ message: 'Usuario inactivo' });

    // ✅ Verificación de contraseña
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ message: 'Contraseña incorrecta' });

    // ✅ Registrar último inicio de sesión y actividad
    await pool.query('UPDATE users SET last_login = NOW(), is_online = 1 WHERE id = ?', [user.id]);
    await pool.query('INSERT INTO activities (descripcion) VALUES (?)', [
      `Inicio de sesión del usuario ${user.nombre} (${user.correo_electronico})`
    ]);

    const token = generarToken(user);

    // ✅ Registrar sesión
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const expiracion = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await registrarSesion({
      userId: user.id,
      token,
      ip,
      userAgent,
      expiracion
    });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.nombre,
        email: user.correo_electronico,
        rol: user.rol,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const register = async (req, res) => {
  const { correo_electronico, password, nombre, apellido, rol, direccion } = req.body;

  try {
    // Verifica si ya existe un usuario activo
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE correo_electronico = ?',
      [correo_electronico]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El email ya está en uso' });
    }

    // Verifica si ya está pendiente de verificación
    const [pending] = await pool.query(
      'SELECT * FROM pending_users WHERE correo_electronico = ?',
      [correo_electronico]
    );

    if (pending.length > 0) {
      const lastSent = new Date(pending[0].ultimo_envio);
      const now = new Date();
      const diffMs = now - lastSent;
      const diffMinutes = diffMs / (1000 * 60);

      if (diffMinutes < 5) {
        return res.status(400).json({
          message: 'Ya se ha enviado un correo de verificación. Intenta nuevamente en unos minutos.',
          allowResend: true
        });
      }

      // Si han pasado más de 5 minutos, actualiza el token y reenvía el correo
      const newToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min desde ahora

      await pool.query(
        `UPDATE pending_users 
         SET token_verificacion = ?, token_expires_at = ?, ultimo_envio = NOW()
         WHERE correo_electronico = ?`,
        [newToken, tokenExpiresAt, correo_electronico]
      );

      const link = `${process.env.FRONTEND_URL}/verificar?token=${newToken}`;
      await enviarCorreoVerificacion(correo_electronico, nombre, newToken);

      return res.status(200).json({ message: 'Se ha reenviado el correo de verificación.' });
    }

    // Primer registro
    const hashed = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await pool.query(
      `INSERT INTO pending_users 
      (correo_electronico, password, nombre, apellido, rol, direccion, token_verificacion, token_expires_at, ultimo_envio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [correo_electronico, hashed, nombre, apellido, (rol || 'cajero').toLowerCase(), direccion, token, tokenExpiresAt]
    );

    const link = `${process.env.FRONTEND_URL}/verificar?token=${token}`;
    await enviarCorreoVerificacion(correo_electronico, nombre, token);

    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [`Registro de nuevo usuario pendiente de verificación: ${nombre}`, nombre]
    );

    res.status(201).json({ message: 'Se ha enviado un correo de verificación. Por favor verifica tu cuenta.' });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE correo_electronico = ?', [email]);
    if (!users.length) return res.status(404).json({ message: 'Correo no registrado' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE correo_electronico = ?',
      [token, expires, email]
    );

    await enviarCorreoRecuperacion(email, token);

    res.json({ message: 'Correo de recuperación enviado' });
  } catch (err) {
    console.error('Error en forgotPassword:', err);
    res.status(500).json({ message: 'Error al enviar el correo de recuperación' });
  }
};

const verificarCuenta = async (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado' });
  }

  try {
    // Buscar usuario pendiente por token (sin validar expiración todavía)
    const [tokenCheck] = await pool.query(
      'SELECT * FROM pending_users WHERE token_verificacion = ?',
      [token]
    );

    // Si no existe en absoluto
    if (!tokenCheck.length) {
      return res.status(400).json({ message: 'Token inválido o ya utilizado' });
    }

    const pendingUser = tokenCheck[0];

    // Si el token está expirado
    if (new Date(pendingUser.token_expires_at) < new Date()) {
      // 🔥 Eliminamos al usuario pendiente
      await pool.query('DELETE FROM pending_users WHERE id = ?', [pendingUser.id]);

      return res.status(400).json({ message: 'El token ha expirado. Por favor regístrate nuevamente.' });
    }

    // Verificamos que no exista ya en usuarios
    const [exists] = await pool.query(
      'SELECT * FROM users WHERE correo_electronico = ?',
      [pendingUser.correo_electronico]
    );

    if (exists.length > 0) {
      await pool.query('DELETE FROM pending_users WHERE id = ?', [pendingUser.id]);
      return res.status(400).json({ message: 'La cuenta ya fue activada' });
    }

    // Insertar usuario en la tabla final
    await pool.query(
  `INSERT INTO users (correo_electronico, password, nombre, apellido, rol, direccion, activo, verificado)
   VALUES (?, ?, ?, ?, ?, ?, 1, 1)`,
  [
    pendingUser.correo_electronico,
    pendingUser.password,
    pendingUser.nombre,
    pendingUser.apellido,
    pendingUser.rol,
    pendingUser.direccion
  ]
);


    await pool.query('DELETE FROM pending_users WHERE id = ?', [pendingUser.id]);

    await pool.query(
      'INSERT INTO activities (descripcion, usuario) VALUES (?, ?)',
      [`Verificación de cuenta del usuario: ${pendingUser.nombre}`, pendingUser.nombre]
    );

    res.json({ message: 'Tu cuenta ha sido verificada correctamente. Ahora puedes iniciar sesión.' });

  } catch (err) {
    console.error('Error en verificarCuenta:', err);
    res.status(500).json({ message: 'Error al verificar la cuenta' });
  }
};

const reenviarVerificacion = async (req, res) => {
  const { correo_electronico } = req.body;

  try {
    const [pendings] = await pool.query(
      'SELECT * FROM pending_users WHERE correo_electronico = ?',
      [correo_electronico]
    );

    if (!pendings.length) {
      return res.status(404).json({ message: 'No se encontró una cuenta pendiente con ese correo.' });
    }

    const newToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await pool.query(
      'UPDATE pending_users SET token_verificacion = ?, token_expires_at = ? WHERE id = ?',
      [newToken, expiresAt, pendings[0].id]
    );

    const link = `${process.env.FRONTEND_URL}/verificar?token=${newToken}`;
    await enviarCorreoVerificacion(correo_electronico, pendings[0].nombre, link);

    res.json({ message: 'Se ha reenviado el correo de verificación.' });
  } catch (err) {
    console.error('Error al reenviar verificación:', err);
    res.status(500).json({ message: 'Error interno al reenviar verificación' });
  }
};


const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    if (!users.length) return res.status(400).json({ message: 'Token inválido o expirado' });

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashed, users[0].id]
    );

    res.json({ message: 'Contraseña restablecida correctamente' });
  } catch (err) {
    console.error('Error en resetPassword:', err);
    res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  reenviarVerificacion, // <- asegúrate que esté así
  verificarCuenta, // <- asegúrate que esté así
};
