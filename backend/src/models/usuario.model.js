const db = require('../config/db');

const findRoleByName = async (nombreRol) => {
  const result = await db.query(
    'SELECT id_rol, nombre_rol FROM rol WHERE nombre_rol = $1',
    [nombreRol]
  );

  return result.rows[0];
};

const findByEmail = async (correo) => {
  const result = await db.query(
    `SELECT 
      u.id_usuario,
      u.id_rol,
      r.nombre_rol,
      u.nombre,
      u.apellido,
      u.correo,
      u.contrasena,
      u.estado,
      u.fecha_registro
    FROM usuario u
    INNER JOIN rol r ON r.id_rol = u.id_rol
    WHERE u.correo = $1`,
    [correo]
  );

  return result.rows[0];
};

const findById = async (idUsuario) => {
  const result = await db.query(
    `SELECT 
      u.id_usuario,
      u.id_rol,
      r.nombre_rol,
      u.nombre,
      u.apellido,
      u.correo,
      u.estado,
      u.fecha_registro
    FROM usuario u
    INNER JOIN rol r ON r.id_rol = u.id_rol
    WHERE u.id_usuario = $1`,
    [idUsuario]
  );

  return result.rows[0];
};

const create = async ({ idRol, nombre, apellido, correo, contrasenaHash }) => {
  const result = await db.query(
    `INSERT INTO usuario (
      id_rol,
      nombre,
      apellido,
      correo,
      contrasena,
      estado
    )
    VALUES ($1, $2, $3, $4, $5, 'activo')
    RETURNING id_usuario, id_rol, nombre, apellido, correo, estado, fecha_registro`,
    [idRol, nombre, apellido, correo, contrasenaHash]
  );

  return result.rows[0];
};

const findAll = async () => {
  const result = await db.query(
    `SELECT 
      u.id_usuario,
      u.id_rol,
      r.nombre_rol,
      u.nombre,
      u.apellido,
      u.correo,
      u.estado,
      u.fecha_registro
    FROM usuario u
    INNER JOIN rol r ON r.id_rol = u.id_rol
    ORDER BY u.fecha_registro DESC`
  );

  return result.rows;
};

const updateEstado = async (idUsuario, estado) => {
  const result = await db.query(
    `UPDATE usuario
    SET estado = $1
    WHERE id_usuario = $2
    RETURNING 
      id_usuario,
      id_rol,
      nombre,
      apellido,
      correo,
      estado,
      fecha_registro`,
    [estado, idUsuario]
  );

  return result.rows[0];
};

module.exports = {
  findRoleByName,
  findByEmail,
  findById,
  create,
  findAll,
  updateEstado
};