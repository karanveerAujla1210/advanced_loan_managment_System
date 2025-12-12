const express = require('express');
const router = express.Router();
const collectionsController = require('../controllers/collections.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');

// Apply auth middleware to all routes
router.use(authenticateToken);
router.use(rolesMiddleware(['ADMIN', 'MANAGER', 'COLLECTION']));

// Collections routes
router.get('/due-today', collectionsController.getDueToday);
router.get('/overdue', collectionsController.getOverdue);
router.get('/outstanding', collectionsController.getAllOutstanding);
router.get('/summary', collectionsController.getCollectionSummary);
router.get('/timeline/:loanId', collectionsController.getLoanTimeline);
router.post('/ptp', collectionsController.recordPTP);
router.post('/note', collectionsController.addAgentNote);

module.exports = router;