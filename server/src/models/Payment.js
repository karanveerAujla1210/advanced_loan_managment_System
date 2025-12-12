const mongoose = require('mongoose');
const { PAYMENT_MODES, PAYMENT_STATUS } = require('../config/constants');

const paymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower', required: true },
  amount: { type: Number, required: true },
  paymentMode: { type: String, enum: Object.values(PAYMENT_MODES), required: true },
  paymentDate: { type: Date, required: true },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: Object.values(PAYMENT_STATUS), default: 'COMPLETED' },
  allocation: [{
    instalment: { type: mongoose.Schema.Types.ObjectId, ref: 'Instalment' },
    principalAmount: Number,
    interestAmount: Number,
    penaltyAmount: Number,
    totalAllocated: Number
  }],
  receiptNumber: String,
  chequeDetails: {
    chequeNumber: String,
    bankName: String,
    chequeDate: Date
  },
  upiDetails: {
    transactionId: String,
    upiId: String
  },
  notes: String,
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);