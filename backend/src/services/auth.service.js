const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');

const register = async ({ nombre, apellido, correo, contrasena, rol = 'proveedor' }) => {
  const existingUser = await usuarioModel.findByEmail(correo);

  if (existingUser) {
    throw new Error('El correo ya se encuentra registrado');
  }

  const role = await usuarioModel.findRoleByName(rol);

  if (!role) {
    throw new Error('El rol indicado no existe');
  }

  const contrasenaHash = await bcrypt.hash(contrasena, 10);

  const user = await usuarioModel.create({
    idRol: role.id_rol,
    nombre,
    apellido,
    correo,
    contrasenaHash
  });

  return {
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    apellido: user.apellido,
    correo: user.correo,
    rol: role.nombre_rol,
    estado: user.estado
  };
};

const login = async ({ correo, contrasena }) => {
  const user = await usuarioModel.findByEmail(correo);

  if (!user) {
    throw new Error('Credenciales inválidas');
  }

  if (user.estado !== 'activo') {
    throw new Error('El usuario se encuentra inactivo');
  }

  const validPassword = await bcrypt.compare(contrasena, user.contrasena);

  if (!validPassword) {
    throw new Error('Credenciales inválidas');
  }

  const token = jwt.sign(
    {
      id_usuario: user.id_usuario,
      correo: user.correo,
      rol: user.nombre_rol
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    }
  );

  return {
    token,
    user: {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      rol: user.nombre_rol,
      estado: user.estado
    }
  };
};

module.exports = {
  register,
  login
};