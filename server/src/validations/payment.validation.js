/**
 * Payment Validation Schemas
 * Enterprise-grade payment validation for CRM
 */

const Joi = require('joi');

const paymentValidation = {
  // Create payment validation
  createPayment: Joi.object({
    loanId: Joi.string().required().messages({
      'string.empty': 'Loan ID is required',
      'any.required': 'Loan ID is required'
    }),
    
    amount: Joi.number().positive().required().messages({
      'number.base': 'Payment amount must be a number',
      'number.positive': 'Payment amount must be positive',
      'any.required': 'Payment amount is required'
    }),
    
    paymentMethod: Joi.string().valid('cash', 'cheque', 'bank_transfer', 'upi', 'card', 'online').required().messages({
      'any.only': 'Payment method must be one of: cash, cheque, bank_transfer, upi, card, online',
      'any.required': 'Payment method is required'
    }),
    
    paymentDate: Joi.date().max('now').required().messages({
      'date.base': 'Payment date must be a valid date',
      'date.max': 'Payment date cannot be in the future',
      'any.required': 'Payment date is required'
    }),
    
    referenceNumber: Joi.string().max(100).optional(),
    
    collectedBy: Joi.string().required().messages({
      'string.empty': 'Collector ID is required',
      'any.required': 'Collector ID is required'
    }),
    
    notes: Joi.string().max(500).optional(),
    
    // For cheque payments
    chequeDetails: Joi.when('paymentMethod', {
      is: 'cheque',
      then: Joi.object({
        chequeNumber: Joi.string().required(),
        bankName: Joi.string().required(),
        chequeDate: Joi.date().required()
      }).required(),
      otherwise: Joi.optional()
    }),
    
    // For bank transfer
    bankDetails: Joi.when('paymentMethod', {
      is: 'bank_transfer',
      then: Joi.object({
        accountNumber: Joi.string().required(),
        ifscCode: Joi.string().required(),
        bankName: Joi.string().required()
      }).required(),
      otherwise: Joi.optional()
    })
  }),

  // Bulk payment validation
  bulkPayment: Joi.object({
    payments: Joi.array().items(
      Joi.object({
        loanId: Joi.string().required(),
        amount: Joi.number().positive().required(),
        paymentMethod: Joi.string().valid('cash', 'cheque', 'bank_transfer', 'upi', 'card', 'online').required(),
        paymentDate: Joi.date().max('now').required(),
        referenceNumber: Joi.string().max(100).optional(),
        notes: Joi.string().max(500).optional()
      })
    ).min(1).max(1000).required().messages({
      'array.min': 'At least one payment is required',
      'array.max': 'Cannot process more than 1000 payments at once'
    }),
    
    collectedBy: Joi.string().required(),
    batchReference: Joi.string().max(100).optional()
  }),

  // Payment search/filter validation
  searchPayments: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    loanId: Joi.string().optional(),
    borrowerId: Joi.string().optional(),
    collectedBy: Joi.string().optional(),
    paymentMethod: Joi.string().valid('cash', 'cheque', 'bank_transfer', 'upi', 'card', 'online').optional(),
    status: Joi.string().valid('pending', 'cleared', 'bounced', 'cancelled').optional(),
    fromDate: Joi.date().optional(),
    toDate: Joi.date().optional(),
    minAmount: Joi.number().positive().optional(),
    maxAmount: Joi.number().positive().optional(),
    search: Joi.string().max(100).optional()
  }),

  // Payment allocation validation
  allocatePayment: Joi.object({
    paymentId: Joi.string().required(),
    allocations: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('principal', 'interest', 'penalty', 'fee').required(),
        amount: Joi.number().positive().required(),
        instalmentId: Joi.string().optional()
      })
    ).required().messages({
      'array.base': 'Allocations must be an array',
      'any.required': 'Payment allocations are required'
    })
  }),

  // Update payment status
  updatePaymentStatus: Joi.object({
    status: Joi.string().valid('pending', 'cleared', 'bounced', 'cancelled').required(),
    reason: Joi.string().max(500).optional(),
    updatedBy: Joi.string().required()
  })
};

module.exports = paymentValidation;