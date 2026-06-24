const express = require('express');
const router = express.Router();
const obrasController = require('../controllers/obras.controller');

router.get('/', obrasController.getObras);
router.get('/:id/detalles', obrasController.getObraDetails);
router.post('/', obrasController.createObra);
router.put('/:id', obrasController.updateObra);
router.delete('/:id', obrasController.deleteObra);

module.exports = router;
