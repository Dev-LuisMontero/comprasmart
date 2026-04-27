const express = require('express');
const oportunidadesController = require('../controllers/oportunidades.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/', authMiddleware, oportunidadesController.getOportunidades);
router.get('/perfil/recomendadas', authMiddleware, oportunidadesController.getRecomendadasPorPerfil);
router.post('/sincronizar',  authMiddleware,  roleMiddleware('administrador'),  oportunidadesController.sincronizarOportunidades);
router.get('/:id', authMiddleware, oportunidadesController.getOportunidadById);

module.exports = router;