const express = require('express');
const perfilesController = require('../controllers/perfiles.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', authMiddleware, perfilesController.createPerfil);
router.get('/me', authMiddleware, perfilesController.getMyPerfil);
router.put('/me', authMiddleware, perfilesController.updateMyPerfil);

module.exports = router;