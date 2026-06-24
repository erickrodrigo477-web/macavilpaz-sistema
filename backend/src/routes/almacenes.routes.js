const express = require('express');
const router = express.Router();
const almacenesController = require('../controllers/almacenes.controller');
const activosController = require('../controllers/activos.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, almacenesController.getAlmacenes);
router.post('/', authMiddleware, almacenesController.createAlmacen);
router.put('/:id', authMiddleware, almacenesController.updateAlmacen);
router.get('/:id/inventario', authMiddleware, almacenesController.getInventario);
router.get('/:id/activos', authMiddleware, activosController.getActivosPorAlmacen);
router.post('/mover-stock', authMiddleware, almacenesController.moverStock);

module.exports = router;
