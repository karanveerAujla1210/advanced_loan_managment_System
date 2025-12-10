const express = require('express');
const { body } = require('express-validator');
const branchesController = require('../controllers/branches.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation schemas
const branchValidation = [
  body('name').notEmpty().withMessage('Branch name is required'),
  body('code').notEmpty().withMessage('Branch code is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits')
];

// All routes require authentication
router.use(authenticate);

// Routes
router.post('/', rolesMiddleware(['ADMIN']), branchValidation, validate, branchesController.create);
router.get('/', branchesController.list);
router.get('/:id', branchesController.getById);
router.put('/:id', rolesMiddleware(['ADMIN']), branchValidation, validate, branchesController.update);
router.delete('/:id', rolesMiddleware(['ADMIN']), branchesController.delete);

module.exports = router;