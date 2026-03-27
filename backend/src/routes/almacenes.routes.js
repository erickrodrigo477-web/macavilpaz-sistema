const express = require('express');
const router = express.Router();
const almacenesController = require('../controllers/almacenes.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, almacenesController.getAlmacenes);
router.post('/', authMiddleware, almacenesController.createAlmacen);
router.put('/:id', authMiddleware, almacenesController.updateAlmacen);
router.get('/:id/inventario', authMiddleware, almacenesController.getInventario);
router.post('/mover-stock', authMiddleware, almacenesController.moverStock);

module.exports = router;
