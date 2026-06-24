const express = require('express');
const router = express.Router();
const asignacionesController = require('../controllers/asignaciones.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(authMiddleware);

router.get('/', asignacionesController.getAsignaciones);
router.post('/', upload.single('pdf_entrega'), asignacionesController.createAsignacion);
router.patch('/:id/estado', upload.single('pdf_devolucion'), asignacionesController.updateEstado);

module.exports = router;
