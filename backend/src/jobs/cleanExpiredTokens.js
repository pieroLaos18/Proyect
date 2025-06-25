// src/jobs/cleanExpiredTokens.js

const pool = require('../config/db');

const limpiarTokensExpirados = async () => {
  try {
    const [result] = await pool.query(
      'DELETE FROM pending_users WHERE token_expires_at < NOW()'
    );
    console.log(`🧹 Tokens expirados eliminados: ${result.affectedRows}`);
  } catch (err) {
    console.error('❌ Error al limpiar tokens expirados:', err);
  }
};

module.exports = limpiarTokensExpirados;
