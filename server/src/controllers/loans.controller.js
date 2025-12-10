const Loan = require('../models/Loan');
const Borrower = require('../models/Borrower');
const LoanProduct = require('../models/LoanProduct');
const scheduleService = require('../services/schedule.service');
const multer = require('multer');
const path = require('path');

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/loans/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

class LoansController {
  // POST /loans
  async create(req, res) {
    try {
      const {
        borrowerId,
        loanProductId,
        loanAmount,
        tenure,
        purpose,
        emiStartDate
      } = req.body;

      // Validate borrower
      const borrower = await Borrower.findById(borrowerId);
      if (!borrower) {
        return res.status(404).json({ message: 'Borrower not found' });
      }

      if (borrower.kycStatus !== 'VERIFIED') {
        return res.status(400).json({ message: 'Borrower KYC not verified' });
      }

      // Validate loan product
      const loanProduct = await LoanProduct.findById(loanProductId);
      if (!loanProduct || !loanProduct.isActive) {
        return res.status(404).json({ message: 'Loan product not found or inactive' });
      }

      // Validate loan amount and tenure
      if (loanAmount < loanProduct.minAmount || loanAmount > loanProduct.maxAmount) {
        return res.status(400).json({ 
          message: `Loan amount must be between ${loanProduct.minAmount} and ${loanProduct.maxAmount}` 
        });
      }

      if (tenure < loanProduct.minTenure || tenure > loanProduct.maxTenure) {
        return res.status(400).json({ 
          message: `Tenure must be between ${loanProduct.minTenure} and ${loanProduct.maxTenure} months` 
        });
      }

      // Generate loan number
      const loanNumber = await this.generateLoanNumber();

      // Calculate loan summary
      const loanSummary = scheduleService.calculateLoanSummary({
        loanAmount,
        interestRate: loanProduct.interestRate,
        tenure
      });

      const loan = new Loan({
        loanNumber,
        borrower: borrowerId,
        loanProduct: loanProductId,
        loanAmount,
        tenure,
        interestRate: loanProduct.interestRate,
        emi: loanSummary.emi,
        totalPayable: loanSummary.totalPayable,
        totalInterest: loanSummary.totalInterest,
        purpose,
        emiStartDate,
        processingFee: loanAmount * (loanProduct.processingFeeRate || 0) / 100,
        branch: req.user.branchId,
        createdBy: req.user.userId,
        status: 'DRAFT'
      });

      await loan.save();
      await loan.populate(['borrower', 'loanProduct', 'branch']);

      res.status(201).json(loan);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // GET /loans
  async list(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        status, 
        branch,
        borrower 
      } = req.query;
      
      const query = {};

      // Branch-based filtering
      if (req.user.role !== 'ADMIN') {
        query.branch = req.user.branchId;
      } else if (branch) {
        query.branch = branch;
      }

      if (search) {
        // Search in loan number or borrower details
        const borrowers = await Borrower.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        }).select('_id');

        query.$or = [
          { loanNumber: { $regex: search, $options: 'i' } },
          { borrower: { $in: borrowers.map(b => b._id) } }
        ];
      }

      if (status) query.status = status;
      if (borrower) query.borrower = borrower;

      const loans = await Loan.find(query)
        .populate('borrower', 'name phone borrowerId')
        .populate('loanProduct', 'name interestRate')
        .populate('branch', 'name code')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Loan.countDocuments(query);

      res.json({
        loans,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /loans/:id
  async getById(req, res) {
    try {
      const loan = await Loan.findById(req.params.id)
        .populate('borrower')
        .populate('loanProduct')
        .populate('branch', 'name code address')
        .populate('createdBy', 'name username');
      
      if (!loan) {
        return res.status(404).json({ message: 'Loan not found' });
      }

      res.json(loan);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /loans/:id
  async update(req, res) {
    try {
      const loan = await Loan.findById(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ message: 'Loan not found' });
      }

      // Only allow updates for DRAFT status
      if (loan.status !== 'DRAFT') {
        return res.status(400).json({ message: 'Can only update draft loans' });
      }

      const updatedLoan = await Loan.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate(['borrower', 'loanProduct', 'branch']);

      res.json(updatedLoan);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // PUT /loans/:id/submit
  async submit(req, res) {
    try {
      const loan = await Loan.findById(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ message: 'Loan not found' });
      }

      if (loan.status !== 'DRAFT') {
        return res.status(400).json({ message: 'Only draft loans can be submitted' });
      }

      loan.status = 'SUBMITTED';
      loan.submittedAt = new Date();
      loan.submittedBy = req.user.userId;
      await loan.save();

      res.json({ message: 'Loan submitted for approval', loan });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /loans/:id/return
  async returnLoan(req, res) {
    try {
      const { remarks } = req.body;
      const loan = await Loan.findById(req.params.id);
      
      if (!loan) {
        return res.status(404).json({ message: 'Loan not found' });
      }

      loan.status = 'RETURNED';
      loan.returnedAt = new Date();
      loan.returnedBy = req.user.userId;
      loan.returnRemarks = remarks;
      await loan.save();

      res.json({ message: 'Loan returned for corrections', loan });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // POST /loans/:id/upload
  async uploadDocument(req, res) {
    try {
      upload.single('document')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }

        const { documentType } = req.body;
        const loan = await Loan.findById(req.params.id);

        if (!loan) {
          return res.status(404).json({ message: 'Loan not found' });
        }

        const document = {
          type: documentType,
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path,
          uploadedAt: new Date(),
          uploadedBy: req.user.userId
        };

        loan.documents.push(document);
        await loan.save();

        res.json({
          message: 'Document uploaded successfully',
          document
        });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /loans/:id/schedule
  async getSchedule(req, res) {
    try {
      const Instalment = require('../models/Instalment');
      const instalments = await Instalment.find({ loan: req.params.id })
        .sort({ instalmentNumber: 1 });

      res.json(instalments);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /loans/:id/schedule/regenerate
  async regenerateSchedule(req, res) {
    try {
      const loan = await Loan.findById(req.params.id)
        .populate('loanProduct');

      if (!loan) {
        return res.status(404).json({ message: 'Loan not found' });
      }

      const instalments = await scheduleService.regenerateSchedule(loan._id, {
        loanAmount: loan.loanAmount,
        interestRate: loan.interestRate,
        tenure: loan.tenure,
        disbursementDate: loan.disbursementDate,
        emiStartDate: loan.emiStartDate
      });

      res.json({
        message: 'Schedule regenerated successfully',
        instalments
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Helper method to generate loan number
  async generateLoanNumber() {
    const currentYear = new Date().getFullYear();
    const prefix = `LN${currentYear}`;
    
    const lastLoan = await Loan.findOne({
      loanNumber: { $regex: `^${prefix}` }
    }).sort({ loanNumber: -1 });

    let sequence = 1;
    if (lastLoan) {
      const lastSequence = parseInt(lastLoan.loanNumber.substring(prefix.length));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }
}

module.exports = new LoansController();