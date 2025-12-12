const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');

// Apply auth middleware to all routes
router.use(authenticateToken);
router.use(rolesMiddleware(['ADMIN', 'MANAGER', 'COLLECTION', 'OPERATION']));

// Payment routes
router.post('/', paymentsController.addPayment);
router.get('/loan/:loanId', paymentsController.getPaymentHistory);

module.exports = router;