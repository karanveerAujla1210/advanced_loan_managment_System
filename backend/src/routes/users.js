import express from 'express';
import User from '../mongoose-models/User.js';
import { authenticate } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const users = await User.find().select('-password_hash').sort({ created_at: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password_hash');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { username, email, password, first_name, last_name, role, phone } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    
    const user = await User.create({ username, email, password_hash, first_name, last_name, role, phone });
    res.status(201).json({ success: true, data: { id: user._id } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { email, first_name, last_name, phone, is_active } = req.body;
    await User.findByIdAndUpdate(req.params.id, { email, first_name, last_name, phone, is_active });
    res.json({ success: true, message: 'User updated' });
  } catch (error) {
    next(error);
  }
});

export default router;
