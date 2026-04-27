const oportunidadModel = require('../models/oportunidad.model');
const oportunidadGuardadaModel = require('../models/oportunidadGuardada.model');
const { success, error } = require('../utils/response');

const guardarOportunidad = async (req, res) => {
  try {
    const { idOportunidad } = req.params;

    const oportunidad = await oportunidadModel.findById(idOportunidad);

    if (!oportunidad) {
      return error(res, 'Oportunidad no encontrada', 404);
    }

    const yaGuardada = await oportunidadGuardadaModel.findByUserAndOportunidad(
      req.user.id_usuario,
      idOportunidad
    );

    if (yaGuardada) {
      return error(res, 'La oportunidad ya se encuentra guardada', 409);
    }

    const guardada = await oportunidadGuardadaModel.create(
      req.user.id_usuario,
      idOportunidad
    );

    return success(res, 'Oportunidad guardada correctamente', guardada, 201);
  } catch (err) {
    return error(res, 'Error al guardar oportunidad', 500);
  }
};

const getMisGuardadas = async (req, res) => {
  try {
    const guardadas = await oportunidadGuardadaModel.findAllByUser(
      req.user.id_usuario
    );

    return success(res, 'Oportunidades guardadas obtenidas correctamente', guardadas);
  } catch (err) {
    return error(res, 'Error al obtener oportunidades guardadas', 500);
  }
};

const eliminarGuardada = async (req, res) => {
  try {
    const { idOportunidad } = req.params;

    const eliminada = await oportunidadGuardadaModel.remove(
      req.user.id_usuario,
      idOportunidad
    );

    if (!eliminada) {
      return error(res, 'La oportunidad no estaba guardada por el usuario', 404);
    }

    return success(res, 'Oportunidad eliminada de guardadas correctamente', eliminada);
  } catch (err) {
    return error(res, 'Error al eliminar oportunidad guardada', 500);
  }
};

module.exports = {
  guardarOportunidad,
  getMisGuardadas,
  eliminarGuardada
};