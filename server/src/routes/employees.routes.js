const express = require('express');
const { body } = require('express-validator');
const employeesController = require('../controllers/employees.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation schemas
const employeeValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isMobilePhone('en-IN').withMessage('Valid phone number is required'),
  body('role').isIn(['ADMIN', 'MANAGER', 'COUNSELLOR', 'ADVISOR', 'OPERATION', 'COLLECTION', 'LEGAL'])
    .withMessage('Invalid role'),
  body('branch').notEmpty().withMessage('Branch is required')
];

const createEmployeeValidation = [
  ...employeeValidation,
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const roleUpdateValidation = [
  body('role').isIn(['ADMIN', 'MANAGER', 'COUNSELLOR', 'ADVISOR', 'OPERATION', 'COLLECTION', 'LEGAL'])
    .withMessage('Invalid role')
];

const branchUpdateValidation = [
  body('branchId').notEmpty().withMessage('Branch ID is required')
];

// All routes require authentication
router.use(authenticate);

// Routes
router.post('/', rolesMiddleware(['ADMIN', 'MANAGER']), createEmployeeValidation, validate, employeesController.create);
router.get('/', employeesController.list);
router.get('/:id', employeesController.getById);
router.put('/:id', rolesMiddleware(['ADMIN', 'MANAGER']), employeeValidation, validate, employeesController.update);
router.delete('/:id', rolesMiddleware(['ADMIN']), employeesController.delete);
router.put('/:id/role', rolesMiddleware(['ADMIN']), roleUpdateValidation, validate, employeesController.updateRole);
router.put('/:id/branch', rolesMiddleware(['ADMIN']), branchUpdateValidation, validate, employeesController.updateBranch);

module.exports = router;