const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// Nota: Aquí deberíamos aplicar un middleware de auth, pero por ahora lo dejaremos abierto para facilitar pruebas
router.get('/stats', dashboardController.getStats);

module.exports = router;
