const express = require('express');
const router = express.Router();
const comprasController = require('../controllers/compras.controller');
const verificarToken = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', comprasController.getCompras);
router.get('/:id', comprasController.getCompraById);
router.post('/', comprasController.createCompra);

module.exports = router;
