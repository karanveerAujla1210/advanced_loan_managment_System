import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  loan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  amount: { type: Number, required: true },
  payment_date: { type: Date, default: Date.now },
  payment_method: String,
  transaction_id: String,
  principal_paid: Number,
  interest_paid: Number,
  penalty_paid: Number,
  notes: String
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
