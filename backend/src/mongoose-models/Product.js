import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  min_amount: Number,
  max_amount: Number,
  interest_rate: Number,
  min_tenure: Number,
  max_tenure: Number,
  processing_fee_percent: Number,
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
