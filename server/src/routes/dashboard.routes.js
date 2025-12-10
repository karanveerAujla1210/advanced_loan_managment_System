const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Get dashboard KPIs
router.get('/kpis', authenticateToken, dashboardController.getDashboardKPIs);

// Get recent activities
router.get('/activities', authenticateToken, dashboardController.getRecentActivities);

// Get portfolio distribution
router.get('/distribution', authenticateToken, dashboardController.getPortfolioDistribution);

module.exports = router;