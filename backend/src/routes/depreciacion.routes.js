const express = require('express');
const router = express.Router();
const { getDepreciaciones, syncDepreciacion } = require('../controllers/depreciacion.controller');
const verificarToken = require('../middlewares/auth.middleware');

router.get('/', verificarToken, getDepreciaciones);
router.post('/sync', verificarToken, syncDepreciacion);

module.exports = router;
