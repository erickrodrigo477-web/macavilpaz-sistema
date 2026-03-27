const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudes_activos.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(authMiddleware);

router.get('/', solicitudesController.getSolicitudes);
router.post('/', solicitudesController.createSolicitud);
router.patch('/:id/estado', upload.single('pdf_entrega'), solicitudesController.updateEstado);

module.exports = router;
