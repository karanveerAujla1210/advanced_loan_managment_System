const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const authController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      const user = await User.findOne({ username }).populate('branch');
      if (!user || !await user.comparePassword(password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      if (!user.isActive) {
        return res.status(401).json({ message: 'Account is deactivated' });
      }
      
      user.lastLogin = new Date();
      await user.save();
      
      const token = generateToken(user._id);
      
      res.json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          branch: user.branch,
          permissions: user.permissions
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  async register(req, res) {
    try {
      const { username, email, password, firstName, lastName, role, branch } = req.body;
      
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName,
        role,
        branch
      });
      
      await user.save();
      
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.userId)
        .select('-password')
        .populate('branch');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = authController;