const jwt = require('jsonwebtoken');
const pool = require('../db'); // Asegúrate de importar la conexión a la BD

module.exports = async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token requerido' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Verifica si el usuario sigue activo
    const [user] = await pool.query('SELECT activo FROM users WHERE id = ?', [decoded.id]);
    if (!user.length || user[0].activo !== 1) {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }

    next();
  } catch (err) {
    console.error('Error JWT:', err.message);
    return res.status(401).json({ message: 'Token inválido' });
  }
};