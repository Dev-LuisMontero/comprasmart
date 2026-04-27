const alertaModel = require('../models/alerta.model');
const { success, error } = require('../utils/response');

const validateAlerta = (body) => {
  const requiredFields = [
    'categoria',
    'region',
    'montoMin',
    'montoMax',
    'frecuencia'
  ];

  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return 'Categoría, región, montos y frecuencia son obligatorios';
    }
  }

  if (Number(body.montoMin) < 0 || Number(body.montoMax) < 0) {
    return 'Los montos no pueden ser negativos';
  }

  if (Number(body.montoMin) > Number(body.montoMax)) {
    return 'El monto mínimo no puede ser mayor al monto máximo';
  }

  const frecuenciasPermitidas = ['diaria', 'semanal', 'manual'];

  if (!frecuenciasPermitidas.includes(body.frecuencia)) {
    return 'La frecuencia debe ser diaria, semanal o manual';
  }

  return null;
};

const crearAlerta = async (req, res) => {
  try {
    const validationError = validateAlerta(req.body);

    if (validationError) {
      return error(res, validationError, 400);
    }

    const alerta = await alertaModel.create(req.user.id_usuario, req.body);

    return success(res, 'Alerta creada correctamente', alerta, 201);
  } catch (err) {
    return error(res, 'Error al crear alerta', 500);
  }
};

const getMisAlertas = async (req, res) => {
  try {
    const alertas = await alertaModel.findAllByUser(req.user.id_usuario);

    return success(res, 'Alertas obtenidas correctamente', alertas);
  } catch (err) {
    return error(res, 'Error al obtener alertas', 500);
  }
};

const actualizarAlerta = async (req, res) => {
  try {
    const { id } = req.params;

    const validationError = validateAlerta(req.body);

    if (validationError) {
      return error(res, validationError, 400);
    }

    const existeAlerta = await alertaModel.findByIdAndUser(id, req.user.id_usuario);

    if (!existeAlerta) {
      return error(res, 'Alerta no encontrada', 404);
    }

    const alerta = await alertaModel.updateByIdAndUser(
      id,
      req.user.id_usuario,
      req.body
    );

    return success(res, 'Alerta actualizada correctamente', alerta);
  } catch (err) {
    return error(res, 'Error al actualizar alerta', 500);
  }
};

const cambiarEstadoAlerta = async (req, res) => {
  try {
    const { id } = req.params;
    const { estadoAlerta } = req.body;

    if (!estadoAlerta) {
      return error(res, 'El estado de la alerta es obligatorio', 400);
    }

    const estadosPermitidos = ['activa', 'inactiva'];

    if (!estadosPermitidos.includes(estadoAlerta)) {
      return error(res, 'El estado debe ser activa o inactiva', 400);
    }

    const existeAlerta = await alertaModel.findByIdAndUser(id, req.user.id_usuario);

    if (!existeAlerta) {
      return error(res, 'Alerta no encontrada', 404);
    }

    const alerta = await alertaModel.updateEstado(
      id,
      req.user.id_usuario,
      estadoAlerta
    );

    return success(res, 'Estado de alerta actualizado correctamente', alerta);
  } catch (err) {
    return error(res, 'Error al actualizar estado de alerta', 500);
  }
};

module.exports = {
  crearAlerta,
  getMisAlertas,
  actualizarAlerta,
  cambiarEstadoAlerta
};