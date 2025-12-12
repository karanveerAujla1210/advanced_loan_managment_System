const express = require('express');
const { body } = require('express-validator');
const loansController = require('../controllers/loans.controller');
const loanDetailsController = require('../controllers/loanDetails.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation schemas
const loanValidation = [
  body('borrowerId').notEmpty().withMessage('Borrower ID is required'),
  body('loanProductId').notEmpty().withMessage('Loan product ID is required'),
  body('loanAmount').isInt({ min: 1000 }).withMessage('Loan amount must be at least 1000'),
  body('tenure').isInt({ min: 1, max: 360 }).withMessage('Tenure must be between 1 and 360 months'),
  body('purpose').notEmpty().withMessage('Loan purpose is required'),
  body('emiStartDate').isISO8601().withMessage('Valid EMI start date is required')
];

const returnLoanValidation = [
  body('remarks').notEmpty().withMessage('Return remarks are required')
];

// All routes require authentication
router.use(authenticate);

// Routes
router.post('/', rolesMiddleware(['COUNSELLOR', 'ADVISOR', 'MANAGER', 'ADMIN']), loanValidation, validate, loansController.create);
router.get('/all', async (req, res) => {
  try {
    const Disbursement = require('../models/Disbursement');
    const disbursements = await Disbursement.find({});
    res.json(disbursements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/', loansController.list);
router.get('/:id', loansController.getById);
router.put('/:id', rolesMiddleware(['COUNSELLOR', 'ADVISOR', 'MANAGER', 'ADMIN']), loanValidation, validate, loansController.update);
router.put('/:id/submit', rolesMiddleware(['COUNSELLOR', 'ADVISOR', 'MANAGER', 'ADMIN']), loansController.submit);
router.put('/:id/return', rolesMiddleware(['ADVISOR', 'MANAGER', 'ADMIN']), returnLoanValidation, validate, loansController.returnLoan);
router.post('/:id/upload', rolesMiddleware(['COUNSELLOR', 'ADVISOR', 'OPERATION', 'MANAGER', 'ADMIN']), loansController.uploadDocument);
router.get('/:id/schedule', loansController.getSchedule);
router.put('/:id/schedule/regenerate', rolesMiddleware(['OPERATION', 'MANAGER', 'ADMIN']), loansController.regenerateSchedule);

// Loan Intelligence Panel routes
router.get('/:loanId/details', loanDetailsController.getLoanDetails);
router.get('/:loanId/closing-summary', loanDetailsController.getClosingSummary);

module.exports = router;