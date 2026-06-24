const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/stats', authMiddleware, dashboardController.getStats);

module.exports = router;
