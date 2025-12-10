// server/src/routes/loanEngine.routes.js
const express = require('express');
const router = express.Router();
const {
  calculateLoanPreview,
  createLoanWithSchedule,
  applyPayment,
  applyCharges,
  getLoanProducts
} = require('../controllers/loanEngine.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');

// Get available loan products (public for preview)
router.get('/products', getLoanProducts);

// Calculate loan preview (requires auth)
router.post('/preview', authenticate, calculateLoanPreview);

// Create loan with full schedule (requires COUNSELLOR, ADVISOR, or ADMIN)
router.post('/create', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'COUNSELLOR', 'ADVISOR']), 
  createLoanWithSchedule
);

// Apply payment to loan (requires COLLECTION, OPERATION, or ADMIN)
router.post('/:loanId/payment', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'OPERATION', 'COLLECTION']), 
  applyPayment
);

// Apply charges (bounce, field visit, legal) - requires appropriate roles
router.post('/:loanId/charges', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'COLLECTION', 'LEGAL']), 
  applyCharges
);

module.exports = router;