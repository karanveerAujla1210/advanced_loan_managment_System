import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../mongoose-models/User.js';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username, is_active: true });
    
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    user.last_login_at = new Date();
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
