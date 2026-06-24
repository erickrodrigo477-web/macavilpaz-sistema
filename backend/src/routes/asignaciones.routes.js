const express = require('express');
const router = express.Router();
const asignacionesController = require('../controllers/asignaciones.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', asignacionesController.getAsignaciones);
router.post('/', asignacionesController.createAsignacion);
router.patch('/:id/estado', asignacionesController.updateEstado);

module.exports = router;
