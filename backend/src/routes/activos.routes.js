const express = require('express');
const router = express.Router();
const activosController = require('../controllers/activos.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', activosController.getActivos);
router.post('/', activosController.createActivo);
router.put('/:id', activosController.updateActivo);
router.delete('/:id', activosController.deleteActivo);

module.exports = router;
