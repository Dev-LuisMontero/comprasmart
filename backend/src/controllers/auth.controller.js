const authService = require('../services/auth.service');
const usuarioModel = require('../models/usuario.model');
const { success, error } = require('../utils/response');
const { validateRegister, validateLogin } = require('../utils/validators');

const register = async (req, res) => {
  try {
    const validationError = validateRegister(req.body);

    if (validationError) {
      return error(res, validationError, 400);
    }

    const user = await authService.register(req.body);

    return success(res, 'Usuario registrado correctamente', user, 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

const login = async (req, res) => {
  try {
    const validationError = validateLogin(req.body);

    if (validationError) {
      return error(res, validationError, 400);
    }

    const data = await authService.login(req.body);

    return success(res, 'Inicio de sesión correcto', data);
  } catch (err) {
    return error(res, err.message, 401);
  }
};

const me = async (req, res) => {
  try {
    const user = await usuarioModel.findById(req.user.id_usuario);

    if (!user) {
      return error(res, 'Usuario no encontrado', 404);
    }

    return success(res, 'Usuario autenticado', user);
  } catch (err) {
    return error(res, 'Error al obtener usuario autenticado', 500);
  }
};

module.exports = {
  register,
  login,
  me
};