// server/src/routes/legal.routes.js
const express = require('express');
const { createLegalCase, getLegalCases } = require('../controllers/legal.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');

const router = express.Router();

router.post('/case', authenticate, rolesMiddleware(['LEGAL', 'MANAGER', 'ADMIN']), createLegalCase);
router.get('/cases', authenticate, rolesMiddleware(['LEGAL', 'MANAGER', 'ADMIN']), getLegalCases);

module.exports = router;