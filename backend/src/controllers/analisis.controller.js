const analisisService = require('../services/analisis.service');
const analisisModel = require('../models/analisis.model');
const { success, error } = require('../utils/response');

const analizarOportunidad = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await analisisService.analizarOportunidad(
      req.user.id_usuario,
      id
    );

    return success(res, 'Análisis de oportunidad generado correctamente', resultado, 201);
  } catch (err) {
    return error(res, err.message || 'Error al analizar oportunidad', 500);
  }
};

const getMisAnalisis = async (req, res) => {
  try {
    const analisis = await analisisModel.findAllByUser(req.user.id_usuario);

    return success(res, 'Análisis obtenidos correctamente', analisis);
  } catch (err) {
    return error(res, 'Error al obtener análisis', 500);
  }
};

const getAnalisisById = async (req, res) => {
  try {
    const { id } = req.params;

    const analisis = await analisisModel.findByIdAndUser(id, req.user.id_usuario);

    if (!analisis) {
      return error(res, 'Análisis no encontrado', 404);
    }

    const historiales = await analisisModel.findHistorialByAnalisis(id);

    return success(res, 'Detalle de análisis obtenido correctamente', {
      analisis,
      historiales
    });
  } catch (err) {
    return error(res, 'Error al obtener detalle de análisis', 500);
  }
};

module.exports = {
  analizarOportunidad,
  getMisAnalisis,
  getAnalisisById
};