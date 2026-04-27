const perfilEmpresaModel = require('../models/perfilEmpresa.model');
const { success, error } = require('../utils/response');

const validatePerfil = (body) => {
  const requiredFields = [
    'nombreEmpresa',
    'rutEmpresa',
    'rubro',
    'region',
    'tamanoEmpresa',
    'categoriaInteres',
    'montoMinInteres',
    'montoMaxInteres'
  ];

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return 'Todos los campos del perfil empresa son obligatorios';
    }
  }

  if (Number(body.montoMinInteres) < 0 || Number(body.montoMaxInteres) < 0) {
    return 'Los montos de interés no pueden ser negativos';
  }

  if (Number(body.montoMinInteres) > Number(body.montoMaxInteres)) {
    return 'El monto mínimo no puede ser mayor al monto máximo';
  }

  return null;
};

const createPerfil = async (req, res) => {
  try {
    const validationError = validatePerfil(req.body);

    if (validationError) {
      return error(res, validationError, 400);
    }

    const existingPerfil = await perfilEmpresaModel.findByUserId(req.user.id_usuario);

    if (existingPerfil) {
      return error(res, 'El usuario ya tiene un perfil de empresa registrado', 409);
    }

    const perfil = await perfilEmpresaModel.create({
      idUsuario: req.user.id_usuario,
      ...req.body
    });

    return success(res, 'Perfil de empresa creado correctamente', perfil, 201);
  } catch (err) {
    return error(res, 'Error al crear perfil de empresa', 500);
  }
};

const getMyPerfil = async (req, res) => {
  try {
    const perfil = await perfilEmpresaModel.findByUserId(req.user.id_usuario);

    if (!perfil) {
      return error(res, 'El usuario no tiene perfil de empresa registrado', 404);
    }

    return success(res, 'Perfil de empresa obtenido correctamente', perfil);
  } catch (err) {
    return error(res, 'Error al obtener perfil de empresa', 500);
  }
};

const updateMyPerfil = async (req, res) => {
  try {
    const validationError = validatePerfil(req.body);

    if (validationError) {
      return error(res, validationError, 400);
    }

    const existingPerfil = await perfilEmpresaModel.findByUserId(req.user.id_usuario);

    if (!existingPerfil) {
      return error(res, 'No existe un perfil de empresa para actualizar', 404);
    }

    const perfil = await perfilEmpresaModel.updateByUserId(req.user.id_usuario, req.body);

    return success(res, 'Perfil de empresa actualizado correctamente', perfil);
  } catch (err) {
    return error(res, 'Error al actualizar perfil de empresa', 500);
  }
};

module.exports = {
  createPerfil,
  getMyPerfil,
  updateMyPerfil
};