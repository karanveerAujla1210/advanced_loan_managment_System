const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

class AuthController {
  // POST /auth/login
  async login(req, res) {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username }).populate('branch');
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role, branchId: user.branch?._id },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          displayName: user.displayName || user.name,
          role: user.role,
          branch: user.branch,
          permissions: user.permissions
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // POST /auth/logout
  async logout(req, res) {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just return success
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // POST /auth/refresh
  async refresh(req, res) {
    try {
      const { token } = req.body;
      
      const decoded = jwt.verify(token, config.JWT_SECRET, { ignoreExpiration: true });
      const user = await User.findById(decoded.userId).populate('branch');
      
      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const newToken = jwt.sign(
        { userId: user._id, role: user.role, branchId: user.branch?._id },
        config.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token: newToken });
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  }

  // GET /auth/me
  async me(req, res) {
    try {
      const user = await User.findById(req.user.userId)
        .populate('branch')
        .select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // POST /auth/change-password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // POST /auth/forgot-password
  async forgotPassword(req, res) {
    try {
      const { username, email } = req.body;
      
      const user = await User.findOne({ 
        $or: [{ username }, { email }] 
      });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      user.resetPasswordOTP = otp;
      user.resetPasswordExpiry = otpExpiry;
      await user.save();

      // TODO: Send OTP via SMS/Email
      console.log(`Password reset OTP for ${user.username}: ${otp}`);

      res.json({ 
        message: 'OTP sent successfully',
        // In development, return OTP for testing
        ...(process.env.NODE_ENV === 'development' && { otp })
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // POST /auth/reset-password
  async resetPassword(req, res) {
    try {
      const { username, otp, newPassword } = req.body;

      const user = await User.findOne({ 
        username,
        resetPasswordOTP: otp,
        resetPasswordExpiry: { $gt: new Date() }
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.passwordChangedAt = new Date();
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save();

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();