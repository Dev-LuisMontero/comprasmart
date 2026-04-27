const express = require('express');
const usuariosController = require('../controllers/usuarios.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.get(
  '/',
  authMiddleware,
  roleMiddleware('administrador'),
  usuariosController.getUsuarios
);

router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('administrador'),
  usuariosController.getUsuarioById
);

router.patch(
  '/:id/estado',
  authMiddleware,
  roleMiddleware('administrador'),
  usuariosController.actualizarEstadoUsuario
);

module.exports = router;