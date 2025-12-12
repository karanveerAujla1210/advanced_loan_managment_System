/**
 * Loan Validation Schemas
 * Enterprise-grade input validation using Joi
 */

const Joi = require('joi');

const loanValidation = {
  // Create loan validation
  createLoan: Joi.object({
    borrowerId: Joi.string().required().messages({
      'string.empty': 'Borrower ID is required',
      'any.required': 'Borrower ID is required'
    }),
    
    loanAmount: Joi.number().positive().required().messages({
      'number.base': 'Loan amount must be a number',
      'number.positive': 'Loan amount must be positive',
      'any.required': 'Loan amount is required'
    }),
    
    interestRate: Joi.number().positive().max(100).required().messages({
      'number.base': 'Interest rate must be a number',
      'number.positive': 'Interest rate must be positive',
      'number.max': 'Interest rate cannot exceed 100%',
      'any.required': 'Interest rate is required'
    }),
    
    tenure: Joi.number().integer().positive().required().messages({
      'number.base': 'Tenure must be a number',
      'number.integer': 'Tenure must be an integer',
      'number.positive': 'Tenure must be positive',
      'any.required': 'Tenure is required'
    }),
    
    tenureType: Joi.string().valid('days', 'weeks', 'months', 'years').required().messages({
      'any.only': 'Tenure type must be one of: days, weeks, months, years',
      'any.required': 'Tenure type is required'
    }),
    
    purpose: Joi.string().max(500).required().messages({
      'string.max': 'Purpose cannot exceed 500 characters',
      'any.required': 'Loan purpose is required'
    }),
    
    collateral: Joi.string().max(1000).optional(),
    
    guarantor: Joi.object({
      name: Joi.string().required(),
      phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
      address: Joi.string().required(),
      relationship: Joi.string().required()
    }).optional(),
    
    processingFee: Joi.number().min(0).optional(),
    
    notes: Joi.string().max(1000).optional()
  }),

  // Update loan validation
  updateLoan: Joi.object({
    status: Joi.string().valid('pending', 'approved', 'rejected', 'disbursed', 'closed').optional(),
    
    approvedAmount: Joi.number().positive().optional(),
    
    approvedBy: Joi.string().optional(),
    
    approvalDate: Joi.date().optional(),
    
    rejectionReason: Joi.string().max(500).optional(),
    
    disbursementDate: Joi.date().optional(),
    
    notes: Joi.string().max(1000).optional()
  }),

  // EMI calculation validation
  calculateEMI: Joi.object({
    principal: Joi.number().positive().required(),
    rate: Joi.number().positive().max(100).required(),
    tenure: Joi.number().integer().positive().required(),
    tenureType: Joi.string().valid('days', 'weeks', 'months', 'years').required()
  }),

  // Loan search/filter validation
  searchLoans: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('pending', 'approved', 'rejected', 'disbursed', 'closed').optional(),
    borrowerId: Joi.string().optional(),
    agentId: Joi.string().optional(),
    branchId: Joi.string().optional(),
    fromDate: Joi.date().optional(),
    toDate: Joi.date().optional(),
    minAmount: Joi.number().positive().optional(),
    maxAmount: Joi.number().positive().optional(),
    search: Joi.string().max(100).optional()
  })
};

module.exports = loanValidation;