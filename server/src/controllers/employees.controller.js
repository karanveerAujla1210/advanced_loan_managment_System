const bcrypt = require('bcryptjs');
const User = require('../models/User');

class EmployeesController {
  // POST /employees
  async create(req, res) {
    try {
      const { password, ...userData } = req.body;
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
        createdBy: req.user.userId
      });

      await user.save();
      await user.populate('branch', 'name code');

      const { password: _, ...userResponse } = user.toObject();
      res.status(201).json(userResponse);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // GET /employees
  async list(req, res) {
    try {
      const { page = 1, limit = 10, search, role, branch, status } = req.query;
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      if (role) query.role = role;
      if (branch) query.branch = branch;
      if (status) query.isActive = status === 'active';

      // Branch managers can only see their branch employees
      if (req.user.role === 'MANAGER') {
        query.branch = req.user.branchId;
      }

      const users = await User.find(query)
        .populate('branch', 'name code')
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(query);

      res.json({
        employees: users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /employees/:id
  async getById(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .populate('branch', 'name code address')
        .select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /employees/:id
  async update(req, res) {
    try {
      const { password, ...updateData } = req.body;
      
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
        updateData.passwordChangedAt = new Date();
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('branch', 'name code').select('-password');

      if (!user) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // DELETE /employees/:id
  async delete(req, res) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /employees/:id/role
  async updateRole(req, res) {
    try {
      const { role } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true, runValidators: true }
      ).populate('branch', 'name code').select('-password');

      if (!user) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // PUT /employees/:id/branch
  async updateBranch(req, res) {
    try {
      const { branchId } = req.body;
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { branch: branchId },
        { new: true, runValidators: true }
      ).populate('branch', 'name code').select('-password');

      if (!user) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new EmployeesController();