const isEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRegister = ({ nombre, apellido, correo, contrasena }) => {
  if (!nombre || !apellido || !correo || !contrasena) {
    return 'Todos los campos son obligatorios';
  }

  if (!isEmail(correo)) {
    return 'El correo no tiene un formato válido';
  }

  if (contrasena.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }

  return null;
};

const validateLogin = ({ correo, contrasena }) => {
  if (!correo || !contrasena) {
    return 'Correo y contraseña son obligatorios';
  }

  if (!isEmail(correo)) {
    return 'El correo no tiene un formato válido';
  }

  return null;
};

module.exports = {
  validateRegister,
  validateLogin
};
