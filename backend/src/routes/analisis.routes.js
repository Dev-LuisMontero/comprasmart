const express = require('express');
const analisisController = require('../controllers/analisis.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/oportunidades/:id', authMiddleware, analisisController.analizarOportunidad);
router.get('/', authMiddleware, analisisController.getMisAnalisis);
router.get('/:id', authMiddleware, analisisController.getAnalisisById);

module.exports = router;