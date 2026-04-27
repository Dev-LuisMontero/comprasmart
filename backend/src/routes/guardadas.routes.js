const express = require('express');
const guardadasController = require('../controllers/guardadas.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/:idOportunidad', authMiddleware, guardadasController.guardarOportunidad);
router.get('/', authMiddleware, guardadasController.getMisGuardadas);
router.delete('/:idOportunidad', authMiddleware, guardadasController.eliminarGuardada);

module.exports = router;