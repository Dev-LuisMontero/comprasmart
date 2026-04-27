const oportunidadModel = require('../models/oportunidad.model');
const historialModel = require('../models/historialAdjudicacion.model');
const analisisModel = require('../models/analisis.model');

const calcularPromedioHistorico = (historiales) => {
  if (!historiales.length) return 0;

  const total = historiales.reduce((sum, item) => {
    return sum + Number(item.monto_adjudicado);
  }, 0);

  return total / historiales.length;
};

const calcularPromedioOferentes = (historiales) => {
  if (!historiales.length) return 0;

  const total = historiales.reduce((sum, item) => {
    return sum + Number(item.cantidad_oferentes);
  }, 0);

  return total / historiales.length;
};

const clasificarRiesgo = ({ montoReferencial, promedioHistorico, promedioOferentes }) => {
  if (promedioHistorico === 0) {
    return {
      nivelRiesgo: 'medio',
      recomendacion: 'No existen suficientes antecedentes históricos asociados. Se recomienda revisar manualmente antes de participar.'
    };
  }

  const diferenciaPorcentual = Math.abs(montoReferencial - promedioHistorico) / promedioHistorico;

  if (diferenciaPorcentual > 0.3 || promedioOferentes >= 8) {
    return {
      nivelRiesgo: 'alto',
      recomendacion: 'La oportunidad presenta alta variación respecto del histórico o alta competencia. Se recomienda participar solo con una oferta cuidadosamente evaluada.'
    };
  }

  if (diferenciaPorcentual > 0.15 || promedioOferentes >= 4) {
    return {
      nivelRiesgo: 'medio',
      recomendacion: 'La oportunidad presenta condiciones moderadas de competencia o variación de precio. Se recomienda revisar costos antes de ofertar.'
    };
  }

  return {
    nivelRiesgo: 'bajo',
    recomendacion: 'La oportunidad presenta condiciones favorables según los antecedentes históricos disponibles.'
  };
};

const analizarOportunidad = async (idUsuario, idOportunidad) => {
  const oportunidad = await oportunidadModel.findById(idOportunidad);

  if (!oportunidad) {
    throw new Error('Oportunidad no encontrada');
  }

  const historiales = await historialModel.findByOportunidadId(idOportunidad);

  const promedioHistorico = calcularPromedioHistorico(historiales);
  const promedioOferentes = calcularPromedioOferentes(historiales);

  const montoReferencial = Number(oportunidad.monto_referencial);

  const precioEstimado = promedioHistorico > 0
    ? Number((promedioHistorico * 0.97).toFixed(2))
    : Number((montoReferencial * 0.95).toFixed(2));

  const { nivelRiesgo, recomendacion } = clasificarRiesgo({
    montoReferencial,
    promedioHistorico,
    promedioOferentes
  });

  const analisis = await analisisModel.create({
    idUsuario,
    idOportunidad,
    nivelRiesgo,
    recomendacion,
    precioEstimado
  });

  for (const historial of historiales) {
    await analisisModel.linkHistorial(analisis.id_analisis, historial.id_historial);
  }

  return {
    analisis,
    oportunidad,
    resumen: {
      cantidad_historiales: historiales.length,
      promedio_historico: Number(promedioHistorico.toFixed(2)),
      promedio_oferentes: Number(promedioOferentes.toFixed(2)),
      precio_estimado: precioEstimado,
      nivel_riesgo: nivelRiesgo,
      recomendacion
    },
    historiales
  };
};

module.exports = {
  analizarOportunidad
};