const db = require('../config/db');

const findByUserId = async (idUsuario) => {
  const result = await db.query(
    `SELECT 
      id_perfil,
      id_usuario,
      nombre_empresa,
      rut_empresa,
      rubro,
      region,
      tamano_empresa,
      categoria_interes,
      monto_min_interes,
      monto_max_interes
    FROM perfil_empresa
    WHERE id_usuario = $1`,
    [idUsuario]
  );

  return result.rows[0];
};

const create = async (perfil) => {
  const {
    idUsuario,
    nombreEmpresa,
    rutEmpresa,
    rubro,
    region,
    tamanoEmpresa,
    categoriaInteres,
    montoMinInteres,
    montoMaxInteres
  } = perfil;

  const result = await db.query(
    `INSERT INTO perfil_empresa (
      id_usuario,
      nombre_empresa,
      rut_empresa,
      rubro,
      region,
      tamano_empresa,
      categoria_interes,
      monto_min_interes,
      monto_max_interes
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *`,
    [
      idUsuario,
      nombreEmpresa,
      rutEmpresa,
      rubro,
      region,
      tamanoEmpresa,
      categoriaInteres,
      montoMinInteres,
      montoMaxInteres
    ]
  );

  return result.rows[0];
};

const updateByUserId = async (idUsuario, perfil) => {
  const {
    nombreEmpresa,
    rutEmpresa,
    rubro,
    region,
    tamanoEmpresa,
    categoriaInteres,
    montoMinInteres,
    montoMaxInteres
  } = perfil;

  const result = await db.query(
    `UPDATE perfil_empresa
    SET
      nombre_empresa = $1,
      rut_empresa = $2,
      rubro = $3,
      region = $4,
      tamano_empresa = $5,
      categoria_interes = $6,
      monto_min_interes = $7,
      monto_max_interes = $8
    WHERE id_usuario = $9
    RETURNING *`,
    [
      nombreEmpresa,
      rutEmpresa,
      rubro,
      region,
      tamanoEmpresa,
      categoriaInteres,
      montoMinInteres,
      montoMaxInteres,
      idUsuario
    ]
  );

  return result.rows[0];
};

module.exports = {
  findByUserId,
  create,
  updateByUserId
};