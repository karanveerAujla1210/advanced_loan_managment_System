const express = require('express');
const { body } = require('express-validator');
const loanProductsController = require('../controllers/loan-products.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation schemas
const loanProductValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('code').notEmpty().withMessage('Product code is required'),
  body('category').isIn(['PERSONAL', 'BUSINESS', 'GOLD', 'VEHICLE', 'HOME'])
    .withMessage('Invalid category'),
  body('interestRate').isFloat({ min: 0.1, max: 50 }).withMessage('Interest rate must be between 0.1 and 50'),
  body('minAmount').isInt({ min: 1000 }).withMessage('Minimum amount must be at least 1000'),
  body('maxAmount').isInt({ min: 1000 }).withMessage('Maximum amount must be at least 1000'),
  body('minTenure').isInt({ min: 1 }).withMessage('Minimum tenure must be at least 1 month'),
  body('maxTenure').isInt({ min: 1 }).withMessage('Maximum tenure must be at least 1 month'),
  body('processingFeeRate').optional().isFloat({ min: 0, max: 10 }).withMessage('Processing fee rate must be between 0 and 10'),
  body('penaltyRate').optional().isFloat({ min: 0, max: 5 }).withMessage('Penalty rate must be between 0 and 5')
];

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/active', loanProductsController.getActive);
router.post('/', rolesMiddleware(['ADMIN', 'MANAGER']), loanProductValidation, validate, loanProductsController.create);
router.get('/', loanProductsController.list);
router.get('/:id', loanProductsController.getById);
router.put('/:id', rolesMiddleware(['ADMIN', 'MANAGER']), loanProductValidation, validate, loanProductsController.update);
router.delete('/:id', rolesMiddleware(['ADMIN']), loanProductsController.delete);

module.exports = router;