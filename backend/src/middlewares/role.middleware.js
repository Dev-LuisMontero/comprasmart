const { error } = require('../utils/response');

const roleMiddleware = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return error(res, 'No se pudo validar el rol del usuario', 401);
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return error(res, 'No tienes permisos para acceder a este recurso', 403);
    }

    next();
  };
};

module.exports = roleMiddleware;