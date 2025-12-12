const loanService = require('../services/loan.service');
const paymentService = require('../services/payment.service');
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
      const result = await loanService.createLoan({
        ...req.body,
        branchId: req.user.branchId || req.body.branchId,
        createdBy: req.user.userId
      });

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Loan created successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /loans
  async list(req, res) {
    try {
      const result = await loanService.getLoans(req.query);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /loans/:id
  async getById(req, res) {
    try {
      const result = await loanService.getLoanById(req.params.id);

      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.error
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
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