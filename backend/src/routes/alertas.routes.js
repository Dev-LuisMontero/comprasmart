const express = require('express');
const alertasController = require('../controllers/alertas.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, alertasController.crearAlerta);
router.get('/', authMiddleware, alertasController.getMisAlertas);
router.put('/:id', authMiddleware, alertasController.actualizarAlerta);
router.patch('/:id/estado', authMiddleware, alertasController.cambiarEstadoAlerta);

module.exports = router;