const db = require('../config/db');

const create = async (idUsuario, alerta) => {
  const {
    palabraClave,
    categoria,
    region,
    montoMin,
    montoMax,
    frecuencia
  } = alerta;

  const result = await db.query(
    `INSERT INTO alerta (
      id_usuario,
      palabra_clave,
      categoria,
      region,
      monto_min,
      monto_max,
      frecuencia,
      estado_alerta
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'activa')
    RETURNING *`,
    [
      idUsuario,
      palabraClave,
      categoria,
      region,
      montoMin,
      montoMax,
      frecuencia
    ]
  );

  return result.rows[0];
};

const findAllByUser = async (idUsuario) => {
  const result = await db.query(
    `SELECT 
      id_alerta,
      id_usuario,
      palabra_clave,
      categoria,
      region,
      monto_min,
      monto_max,
      frecuencia,
      estado_alerta,
      fecha_creacion
    FROM alerta
    WHERE id_usuario = $1
    ORDER BY fecha_creacion DESC`,
    [idUsuario]
  );

  return result.rows;
};

const findByIdAndUser = async (idAlerta, idUsuario) => {
  const result = await db.query(
    `SELECT 
      id_alerta,
      id_usuario,
      palabra_clave,
      categoria,
      region,
      monto_min,
      monto_max,
      frecuencia,
      estado_alerta,
      fecha_creacion
    FROM alerta
    WHERE id_alerta = $1
      AND id_usuario = $2`,
    [idAlerta, idUsuario]
  );

  return result.rows[0];
};

const updateByIdAndUser = async (idAlerta, idUsuario, alerta) => {
  const {
    palabraClave,
    categoria,
    region,
    montoMin,
    montoMax,
    frecuencia
  } = alerta;

  const result = await db.query(
    `UPDATE alerta
    SET
      palabra_clave = $1,
      categoria = $2,
      region = $3,
      monto_min = $4,
      monto_max = $5,
      frecuencia = $6
    WHERE id_alerta = $7
      AND id_usuario = $8
    RETURNING *`,
    [
      palabraClave,
      categoria,
      region,
      montoMin,
      montoMax,
      frecuencia,
      idAlerta,
      idUsuario
    ]
  );

  return result.rows[0];
};

const updateEstado = async (idAlerta, idUsuario, estadoAlerta) => {
  const result = await db.query(
    `UPDATE alerta
    SET estado_alerta = $1
    WHERE id_alerta = $2
      AND id_usuario = $3
    RETURNING *`,
    [estadoAlerta, idAlerta, idUsuario]
  );

  return result.rows[0];
};

module.exports = {
  create,
  findAllByUser,
  findByIdAndUser,
  updateByIdAndUser,
  updateEstado
};