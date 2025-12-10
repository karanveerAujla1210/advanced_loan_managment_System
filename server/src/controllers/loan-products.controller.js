const LoanProduct = require('../models/LoanProduct');

class LoanProductsController {
  // POST /loan-products
  async create(req, res) {
    try {
      const loanProduct = new LoanProduct({
        ...req.body,
        createdBy: req.user.userId
      });

      await loanProduct.save();
      res.status(201).json(loanProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // GET /loan-products
  async list(req, res) {
    try {
      const { page = 1, limit = 10, search, status, category } = req.query;
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (status) {
        query.isActive = status === 'active';
      }

      if (category) {
        query.category = category;
      }

      const loanProducts = await LoanProduct.find(query)
        .populate('createdBy', 'name username')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await LoanProduct.countDocuments(query);

      res.json({
        loanProducts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /loan-products/:id
  async getById(req, res) {
    try {
      const loanProduct = await LoanProduct.findById(req.params.id)
        .populate('createdBy', 'name username email');
      
      if (!loanProduct) {
        return res.status(404).json({ message: 'Loan product not found' });
      }

      res.json(loanProduct);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /loan-products/:id
  async update(req, res) {
    try {
      const loanProduct = await LoanProduct.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          updatedBy: req.user.userId,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      if (!loanProduct) {
        return res.status(404).json({ message: 'Loan product not found' });
      }

      res.json(loanProduct);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // DELETE /loan-products/:id
  async delete(req, res) {
    try {
      const loanProduct = await LoanProduct.findById(req.params.id);
      
      if (!loanProduct) {
        return res.status(404).json({ message: 'Loan product not found' });
      }

      // Check if product is being used in any loans
      const Loan = require('../models/Loan');
      const loansCount = await Loan.countDocuments({ loanProduct: loanProduct._id });
      
      if (loansCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete loan product that is being used in loans' 
        });
      }

      await LoanProduct.findByIdAndDelete(req.params.id);
      res.json({ message: 'Loan product deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /loan-products/active (for dropdowns)
  async getActive(req, res) {
    try {
      const loanProducts = await LoanProduct.find({ isActive: true })
        .select('name code interestRate minAmount maxAmount tenure category')
        .sort({ name: 1 });

      res.json(loanProducts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new LoanProductsController();