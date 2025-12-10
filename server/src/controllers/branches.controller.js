const Branch = require('../models/Branch');
const User = require('../models/User');

class BranchesController {
  // POST /branches
  async create(req, res) {
    try {
      const branch = new Branch(req.body);
      await branch.save();
      res.status(201).json(branch);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // GET /branches
  async list(req, res) {
    try {
      const { page = 1, limit = 10, search, status } = req.query;
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } }
        ];
      }

      if (status) {
        query.isActive = status === 'active';
      }

      const branches = await Branch.find(query)
        .populate('manager', 'name username')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Branch.countDocuments(query);

      res.json({
        branches,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /branches/:id
  async getById(req, res) {
    try {
      const branch = await Branch.findById(req.params.id)
        .populate('manager', 'name username email phone');
      
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }

      // Get branch statistics
      const employeeCount = await User.countDocuments({ branch: branch._id });
      
      res.json({
        ...branch.toObject(),
        stats: {
          employeeCount
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /branches/:id
  async update(req, res) {
    try {
      const branch = await Branch.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }

      res.json(branch);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // DELETE /branches/:id
  async delete(req, res) {
    try {
      const branch = await Branch.findById(req.params.id);
      
      if (!branch) {
        return res.status(404).json({ message: 'Branch not found' });
      }

      // Check if branch has employees
      const employeeCount = await User.countDocuments({ branch: branch._id });
      if (employeeCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete branch with active employees' 
        });
      }

      await Branch.findByIdAndDelete(req.params.id);
      res.json({ message: 'Branch deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new BranchesController();