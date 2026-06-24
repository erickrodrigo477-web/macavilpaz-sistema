const express = require('express');
const router = express.Router();
const suministrosController = require('../controllers/suministros.controller');
const auth = require('../middlewares/auth.middleware');

router.get('/', suministrosController.getSuministros);
router.get('/categorias', suministrosController.getCategorias);
router.post('/', auth, suministrosController.createSuministro);
router.put('/:id', auth, suministrosController.updateSuministro);
router.delete('/:id', auth, suministrosController.deleteSuministro);
router.post('/restock', auth, suministrosController.restockSuministros);

module.exports = router;
