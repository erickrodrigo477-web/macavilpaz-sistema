const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudes.controller');
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.get('/', auth, solicitudesController.getSolicitudes);
router.get('/consolidated-needs', auth, solicitudesController.getConsolidatedNeeds);
router.get('/reporte/entregados', auth, solicitudesController.getReporteEntregados);
router.get('/:id', auth, solicitudesController.getSolicitudById);
router.post('/', auth, solicitudesController.createSolicitud);
router.patch('/:id/estado', auth, solicitudesController.updateEstado);
router.post('/:id/aprobar', auth, solicitudesController.approveSolicitud);
router.post('/:id/entregar', auth, upload.single('pdf_entrega'), solicitudesController.entregarMateriales);

module.exports = router;
