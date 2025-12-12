const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Customer routes
router.post('/', customersController.create);
router.get('/', customersController.list);
router.get('/:id', customersController.getById);
router.put('/:id', customersController.update);

module.exports = router;