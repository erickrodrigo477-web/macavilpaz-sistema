const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/login', authController.login);
router.post('/recuperar-password', authController.recuperarPassword);
router.patch('/cambiar-password', authMiddleware, authController.cambiarPassword);

module.exports = router;
