// server/src/routes/payments.routes.js
const express = require('express');
const { createPayment, recordBounce } = require('../controllers/payments.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');

const router = express.Router();

router.post('/', authenticate, rolesMiddleware(['COLLECTION', 'OPERATION', 'MANAGER', 'ADMIN']), createPayment);
router.post('/bounce', authenticate, rolesMiddleware(['COLLECTION', 'OPERATION', 'MANAGER', 'ADMIN']), recordBounce);

module.exports = router;