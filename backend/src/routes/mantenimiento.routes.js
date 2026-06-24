const express = require('express');
const router = express.Router();
const mantenimientoController = require('../controllers/mantenimiento.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', mantenimientoController.getMantenimientos);
router.post('/iniciar', mantenimientoController.iniciarMantenimiento);
router.patch('/finalizar/:id', mantenimientoController.finalizarMantenimiento);
router.get('/:activoId', mantenimientoController.getMantenimientoByActivo);

module.exports = router;
