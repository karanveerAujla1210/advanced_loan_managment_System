const mongoose = require('mongoose');
const { FREQUENCY } = require('../config/constants');

const loanProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  description: String,
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number, required: true },
  interestRate: { type: Number, required: true }, // Annual percentage
  processingFee: { type: Number, default: 0 },
  processingFeeType: { type: String, enum: ['FIXED', 'PERCENTAGE'], default: 'PERCENTAGE' },
  tenure: {
    min: Number, // in months
    max: Number
  },
  repaymentFrequency: { type: String, enum: Object.values(FREQUENCY), default: 'MONTHLY' },
  gracePeriod: { type: Number, default: 0 }, // days
  penaltyRate: { type: Number, default: 2 }, // percentage per month
  isActive: { type: Boolean, default: true },
  eligibilityCriteria: {
    minAge: Number,
    maxAge: Number,
    minIncome: Number,
    requiredDocuments: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('LoanProduct', loanProductSchema);