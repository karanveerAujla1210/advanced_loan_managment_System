import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  borrower_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  loan_number: { type: String, unique: true },
  principal_amount: { type: Number, required: true },
  interest_rate: { type: Number, required: true },
  tenure_months: { type: Number, required: true },
  emi_amount: Number,
  status: { type: String, default: 'pending' },
  application_date: { type: Date, default: Date.now },
  approval_date: Date,
  disbursement_date: Date,
  outstanding_balance: Number
}, { timestamps: true });

export default mongoose.model('Loan', loanSchema);
