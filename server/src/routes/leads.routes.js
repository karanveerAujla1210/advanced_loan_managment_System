const express = require('express');
const { body } = require('express-validator');
const leadsController = require('../controllers/leads.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation schemas
const leadValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('phone').isMobilePhone('en-IN').withMessage('Valid phone number is required'),
  body('source').isIn(['WALK_IN', 'REFERRAL', 'ONLINE', 'CAMPAIGN', 'COLD_CALL'])
    .withMessage('Invalid source'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority')
];

const statusUpdateValidation = [
  body('status').isIn(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED'])
    .withMessage('Invalid status'),
  body('remarks').optional().isString()
];

const noteValidation = [
  body('note').notEmpty().withMessage('Note is required')
];

// All routes require authentication
router.use(authenticate);

// Routes
router.post('/', rolesMiddleware(['COUNSELLOR', 'MANAGER', 'ADMIN']), leadValidation, validate, leadsController.create);
router.get('/', leadsController.list);
router.get('/:id', leadsController.getById);
router.put('/:id', rolesMiddleware(['COUNSELLOR', 'MANAGER', 'ADMIN']), leadValidation, validate, leadsController.update);
router.put('/:id/status', rolesMiddleware(['COUNSELLOR', 'MANAGER', 'ADMIN']), statusUpdateValidation, validate, leadsController.updateStatus);
router.post('/:id/convert', rolesMiddleware(['COUNSELLOR', 'MANAGER', 'ADMIN']), leadsController.convert);
router.post('/:id/note', noteValidation, validate, leadsController.addNote);

module.exports = router;