import mongoose from 'mongoose';

const borrowerSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: String,
  phone: { type: String, required: true },
  address: String,
  city: String,
  state: String,
  pincode: String,
  pan_number: String,
  aadhar_number: String,
  date_of_birth: Date,
  occupation: String,
  monthly_income: Number,
  credit_score: Number,
  status: { type: String, default: 'active' }
}, { timestamps: true });

export default mongoose.model('Borrower', borrowerSchema);
