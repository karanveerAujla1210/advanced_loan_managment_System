const express = require('express');
const router = express.Router();
const { 
  getDisbursementQueue, 
  disburseLoan, 
  getDisbursementStats 
} = require('../controllers/disbursement.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');

// Get disbursement queue
router.get('/queue', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'OPERATION']), 
  getDisbursementQueue
);

// Disburse a loan
router.post('/disburse/:loanId', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'OPERATION']), 
  disburseLoan
);

// Get disbursement statistics
router.get('/stats', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'OPERATION']), 
  getDisbursementStats
);

module.exports = router;