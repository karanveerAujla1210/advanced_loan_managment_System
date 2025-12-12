const mongoose = require('mongoose');
const { LOAN_STATUS } = require('../config/constants');

const loanSchema = new mongoose.Schema({
  loanId: { type: String, required: true, unique: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower', required: true },
  loanProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanProduct', required: true },
  principal: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  tenure: { type: Number, required: true }, // in months
  emi: { type: Number, required: true },
  processingFee: { type: Number, default: 0 },
  disbursedAmount: Number,
  disbursedDate: Date,
  maturityDate: Date,
  status: { type: String, enum: Object.values(LOAN_STATUS), default: 'PENDING' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedDate: Date,
  disbursedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  assignedCollector: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalPaid: { type: Number, default: 0 },
  outstandingPrincipal: Number,
  outstandingInterest: Number,
  penaltyAmount: { type: Number, default: 0 },
  lastPaymentDate: Date,
  nextDueDate: Date,
  daysOverdue: { type: Number, default: 0 },
  guarantors: [{
    name: String,
    phone: String,
    address: String,
    relationship: String
  }],
  collateral: [{
    type: String,
    description: String,
    value: Number
  }],
  notes: [{ text: String, createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: Date }]
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);