const userService = require('../services/userService');

exports.getAllActiveUsers = async (req, res) => {
    try {
        const users = await userService.fetchActiveUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

exports.getOnlineUsersCount = async (req, res) => {
    try {
        const count = await userService.countOnlineUsers();
        res.json({ activos: count });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuarios activos' });
    }
};

exports.updateUserRole = async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;
    const usuarioAccion = req.user?.nombre || req.user?.correo_electronico || 'Desconocido';

    try {
        await userService.updateRole(id, role);
        await userService.logActivity(`Rol actualizado a "${role}" para el usuario ID ${id}`, usuarioAccion);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar el rol' });
    }
};

exports.deactivateUser = async (req, res) => {
    const { id } = req.params;
    const usuarioAccion = req.user?.nombre || req.user?.correo_electronico || 'Desconocido';

    try {
        await userService.deactivateUser(id);
        await userService.logActivity(`Usuario desactivado: ID ${id}`, usuarioAccion);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al desactivar usuario' });
    }
};

exports.updateUserActivity = async (req, res) => {
    try {
        await userService.updateActivity(req.user.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar actividad' });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        await userService.logout(req.user.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al cerrar sesión' });
    }
};

exports.logoutInactiveUsers = async (req, res) => {
    try {
        await userService.logoutInactive();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al cerrar sesión inactiva' });
    }
};

exports.checkIfUserIsActive = async (req, res) => {
    try {
        const active = await userService.isActive(req.params.id);
        res.json({ active });
    } catch (err) {
        res.status(500).json({ error: 'Error al verificar estado del usuario' });
    }
};
