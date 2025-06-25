const pool = require('../db');

exports.fetchActiveUsers = async () => {
    const [rows] = await pool.query(
        'SELECT id, nombre AS name, correo_electronico AS email, rol AS role FROM users WHERE activo = 1'
    );
    return rows;
};

exports.countOnlineUsers = async () => {
    const [rows] = await pool.query('SELECT COUNT(*) AS activos FROM users WHERE is_online = 1');
    return rows[0].activos;
};

exports.updateRole = async (id, role) => {
    await pool.query('UPDATE users SET rol = ? WHERE id = ?', [role, id]);
};

exports.deactivateUser = async (id) => {
    await pool.query('UPDATE users SET activo = 0, is_online = 0 WHERE id = ?', [id]);
};

exports.updateActivity = async (userId) => {
    await pool.query('UPDATE users SET last_login = NOW(), is_online = 1 WHERE id = ?', [userId]);
};

exports.logout = async (userId) => {
    await pool.query('UPDATE users SET is_online = 0 WHERE id = ?', [userId]);
};

exports.logoutInactive = async () => {
    await pool.query('UPDATE users SET is_online = 0 WHERE last_login < NOW() - INTERVAL 10 MINUTE AND is_online = 1');
};

exports.isActive = async (id) => {
    const [rows] = await pool.query('SELECT activo FROM users WHERE id = ?', [id]);
    if (!rows.length) {
        return false;
    }
    return rows[0].activo === 1;
};

exports.logActivity = async (descripcion, usuario) => {
    await pool.query('INSERT INTO activities (descripcion, usuario) VALUES (?, ?)', [descripcion, usuario]);
};
