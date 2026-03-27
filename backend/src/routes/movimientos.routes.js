const express = require('express');
const router = express.Router();
const movimientosController = require('../controllers/movimientos.controller');

router.get('/', movimientosController.getMovimientos);
router.post('/', movimientosController.createMovimiento);

module.exports = router;
