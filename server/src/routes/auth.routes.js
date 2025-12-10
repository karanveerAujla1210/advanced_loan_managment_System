const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const router = express.Router();

// Validation schemas
const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const forgotPasswordValidation = [
  body('username').optional(),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body().custom((value, { req }) => {
    if (!req.body.username && !req.body.email) {
      throw new Error('Either username or email is required');
    }
    return true;
  })
];

const resetPasswordValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// Routes
router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authMiddleware.authenticateToken, authController.me);
router.post('/change-password', authMiddleware.authenticateToken, changePasswordValidation, validate, authController.changePassword);
router.post('/forgot-password', forgotPasswordValidation, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, authController.resetPassword);

module.exports = router;