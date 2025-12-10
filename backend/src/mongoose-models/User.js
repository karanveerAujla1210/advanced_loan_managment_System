import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  first_name: String,
  last_name: String,
  role: { type: String, default: 'user' },
  phone: String,
  is_active: { type: Boolean, default: true },
  last_login_at: Date
}, { timestamps: true });

export default mongoose.model('User', userSchema);
