const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return error(res, 'Token no proporcionado', 401);
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer' || !token) {
    return error(res, 'Formato de token inválido', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Token inválido o expirado', 401);
  }
};

module.exports = authMiddleware;