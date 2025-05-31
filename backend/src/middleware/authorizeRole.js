module.exports = function authorizeRole(...roles) {
  return (req, res, next) => {
    // El usuario debe estar autenticado y tener el campo 'rol' en req.user
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
};