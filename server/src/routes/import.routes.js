const express = require('express');
const router = express.Router();
const importController = require('../controllers/import.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');

// Template downloads (no auth required for templates)
router.get('/template/borrowers', importController.getBorrowerTemplate);
router.get('/template/leads', importController.getLeadTemplate);
router.get('/template/payments', importController.getPaymentTemplate);

// Import routes (require authentication)
router.post('/borrowers/upload', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'COUNSELLOR']), 
  importController.uploadBorrowers
);

router.post('/borrowers/confirm', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'COUNSELLOR']), 
  importController.confirmBorrowerImport
);

router.post('/leads/upload', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'COUNSELLOR']), 
  importController.uploadLeads
);

router.post('/leads/confirm', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'COUNSELLOR']), 
  importController.confirmLeadImport
);

// Export routes
router.get('/export/borrowers', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'COUNSELLOR']), 
  importController.exportBorrowers
);

router.get('/export/loans', 
  authenticate, 
  rolesMiddleware(['ADMIN', 'MANAGER', 'ADVISOR', 'OPERATION']), 
  importController.exportLoans
);

module.exports = router;