const express = require('express');
const { body } = require('express-validator');
const borrowersController = require('../controllers/borrowers.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation schemas
const borrowerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').isMobilePhone('en-IN').withMessage('Valid phone number is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits')
];

const kycVerifyValidation = [
  body('documentId').notEmpty().withMessage('Document ID is required'),
  body('remarks').optional().isString()
];

const kycRejectValidation = [
  body('documentId').notEmpty().withMessage('Document ID is required'),
  body('remarks').notEmpty().withMessage('Rejection remarks are required')
];

// All routes require authentication
router.use(authenticate);

// Routes
router.post('/', rolesMiddleware(['COUNSELLOR', 'MANAGER', 'ADMIN']), borrowerValidation, validate, borrowersController.create);
router.get('/', borrowersController.list);
router.get('/:id', borrowersController.getById);
router.put('/:id', rolesMiddleware(['COUNSELLOR', 'MANAGER', 'ADMIN']), borrowerValidation, validate, borrowersController.update);
router.delete('/:id', rolesMiddleware(['ADMIN']), borrowersController.delete);
router.post('/:id/kyc/upload', rolesMiddleware(['COUNSELLOR', 'OPERATION', 'MANAGER', 'ADMIN']), borrowersController.uploadKyc);
router.put('/:id/kyc/verify', rolesMiddleware(['OPERATION', 'MANAGER', 'ADMIN']), kycVerifyValidation, validate, borrowersController.verifyKyc);
router.put('/:id/kyc/reject', rolesMiddleware(['OPERATION', 'MANAGER', 'ADMIN']), kycRejectValidation, validate, borrowersController.rejectKyc);
router.get('/:id/loans', borrowersController.getBorrowerLoans);

module.exports = router;