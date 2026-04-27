const db = require('../config/db');

const create = async ({
  idUsuario,
  idOportunidad,
  nivelRiesgo,
  recomendacion,
  precioEstimado
}) => {
  const result = await db.query(
    `INSERT INTO analisis (
      id_usuario,
      id_oportunidad,
      nivel_riesgo,
      recomendacion,
      precio_estimado
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [idUsuario, idOportunidad, nivelRiesgo, recomendacion, precioEstimado]
  );

  return result.rows[0];
};

const linkHistorial = async (idAnalisis, idHistorial) => {
  const result = await db.query(
    `INSERT INTO analisis_historial (
      id_analisis,
      id_historial
    )
    VALUES ($1, $2)
    RETURNING *`,
    [idAnalisis, idHistorial]
  );

  return result.rows[0];
};

const findAllByUser = async (idUsuario) => {
  const result = await db.query(
    `SELECT 
      a.id_analisis,
      a.id_usuario,
      a.id_oportunidad,
      o.titulo,
      o.organismo,
      o.categoria,
      o.region,
      o.monto_referencial,
      a.fecha_analisis,
      a.nivel_riesgo,
      a.recomendacion,
      a.precio_estimado
    FROM analisis a
    INNER JOIN oportunidad o ON o.id_oportunidad = a.id_oportunidad
    WHERE a.id_usuario = $1
    ORDER BY a.fecha_analisis DESC`,
    [idUsuario]
  );

  return result.rows;
};

const findByIdAndUser = async (idAnalisis, idUsuario) => {
  const result = await db.query(
    `SELECT 
      a.id_analisis,
      a.id_usuario,
      a.id_oportunidad,
      o.titulo,
      o.organismo,
      o.descripcion,
      o.categoria,
      o.region,
      o.monto_referencial,
      o.fecha_publicacion,
      o.fecha_cierre,
      o.estado_oportunidad,
      a.fecha_analisis,
      a.nivel_riesgo,
      a.recomendacion,
      a.precio_estimado
    FROM analisis a
    INNER JOIN oportunidad o ON o.id_oportunidad = a.id_oportunidad
    WHERE a.id_analisis = $1
      AND a.id_usuario = $2`,
    [idAnalisis, idUsuario]
  );

  return result.rows[0];
};

const findHistorialByAnalisis = async (idAnalisis) => {
  const result = await db.query(
    `SELECT 
      h.id_historial,
      h.id_oportunidad,
      h.proveedor_adjudicado,
      h.organismo_adjudicador,
      h.monto_adjudicado,
      h.cantidad_oferentes,
      h.fecha_adjudicacion
    FROM analisis_historial ah
    INNER JOIN historial_adjudicacion h ON h.id_historial = ah.id_historial
    WHERE ah.id_analisis = $1
    ORDER BY h.fecha_adjudicacion DESC`,
    [idAnalisis]
  );

  return result.rows;
};

module.exports = {
  create,
  linkHistorial,
  findAllByUser,
  findByIdAndUser,
  findHistorialByAnalisis
};