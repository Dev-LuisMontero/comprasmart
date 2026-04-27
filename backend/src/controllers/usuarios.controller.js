const usuarioModel = require('../models/usuario.model');
const { success, error } = require('../utils/response');

const getUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioModel.findAll();

    return success(res, 'Usuarios obtenidos correctamente', usuarios);
  } catch (err) {
    return error(res, 'Error al obtener usuarios', 500);
  }
};

const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await usuarioModel.findById(id);

    if (!usuario) {
      return error(res, 'Usuario no encontrado', 404);
    }

    return success(res, 'Usuario obtenido correctamente', usuario);
  } catch (err) {
    return error(res, 'Error al obtener usuario', 500);
  }
};

const actualizarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return error(res, 'El estado del usuario es obligatorio', 400);
    }

    const estadosPermitidos = ['activo', 'inactivo'];

    if (!estadosPermitidos.includes(estado)) {
      return error(res, 'El estado debe ser activo o inactivo', 400);
    }

    const usuarioExistente = await usuarioModel.findById(id);

    if (!usuarioExistente) {
      return error(res, 'Usuario no encontrado', 404);
    }

    const usuario = await usuarioModel.updateEstado(id, estado);

    return success(res, 'Estado de usuario actualizado correctamente', usuario);
  } catch (err) {
    return error(res, 'Error al actualizar estado de usuario', 500);
  }
};

module.exports = {
  getUsuarios,
  getUsuarioById,
  actualizarEstadoUsuario
};