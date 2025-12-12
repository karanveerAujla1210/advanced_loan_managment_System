const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/constants');

const instalmentSchema = new mongoose.Schema({
  loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  instalmentNumber: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  principalAmount: { type: Number, required: true },
  interestAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  paidPrincipal: { type: Number, default: 0 },
  paidInterest: { type: Number, default: 0 },
  penaltyAmount: { type: Number, default: 0 },
  paidPenalty: { type: Number, default: 0 },
  status: { type: String, enum: Object.values(PAYMENT_STATUS), default: 'PENDING' },
  paidDate: Date,
  daysOverdue: { type: Number, default: 0 },
  outstandingAmount: { type: Number, default: 0 }
}, { timestamps: true });

instalmentSchema.pre('save', function(next) {
  this.outstandingAmount = this.totalAmount + this.penaltyAmount - this.paidAmount - this.paidPenalty;
  next();
});

module.exports = mongoose.model('Instalment', instalmentSchema);