const db = require('../config/db');

const findByUserAndOportunidad = async (idUsuario, idOportunidad) => {
  const result = await db.query(
    `SELECT 
      id_guardado,
      id_oportunidad,
      id_usuario,
      fecha_guardado
    FROM oportunidad_guardada
    WHERE id_usuario = $1
      AND id_oportunidad = $2`,
    [idUsuario, idOportunidad]
  );

  return result.rows[0];
};

const create = async (idUsuario, idOportunidad) => {
  const result = await db.query(
    `INSERT INTO oportunidad_guardada (
      id_oportunidad,
      id_usuario,
      fecha_guardado
    )
    VALUES ($1, $2, CURRENT_DATE)
    RETURNING *`,
    [idOportunidad, idUsuario]
  );

  return result.rows[0];
};

const findAllByUser = async (idUsuario) => {
  const result = await db.query(
    `SELECT 
      og.id_guardado,
      og.fecha_guardado,
      o.id_oportunidad,
      o.codigo_externo,
      o.titulo,
      o.organismo,
      o.descripcion,
      o.categoria,
      o.region,
      o.monto_referencial,
      o.fecha_publicacion,
      o.fecha_cierre,
      o.estado_oportunidad
    FROM oportunidad_guardada og
    INNER JOIN oportunidad o ON o.id_oportunidad = og.id_oportunidad
    WHERE og.id_usuario = $1
    ORDER BY og.fecha_guardado DESC`,
    [idUsuario]
  );

  return result.rows;
};

const remove = async (idUsuario, idOportunidad) => {
  const result = await db.query(
    `DELETE FROM oportunidad_guardada
    WHERE id_usuario = $1
      AND id_oportunidad = $2
    RETURNING *`,
    [idUsuario, idOportunidad]
  );

  return result.rows[0];
};

module.exports = {
  findByUserAndOportunidad,
  create,
  findAllByUser,
  remove
};