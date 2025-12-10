const Borrower = require('../models/Borrower');
const Loan = require('../models/Loan');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/kyc/');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

class BorrowersController {
  // POST /borrowers
  async create(req, res) {
    try {
      const borrower = new Borrower({
        ...req.body,
        branch: req.user.branchId,
        createdBy: req.user.userId
      });

      await borrower.save();
      await borrower.populate('branch', 'name code');
      
      res.status(201).json(borrower);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // GET /borrowers
  async list(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        kycStatus, 
        status,
        branch 
      } = req.query;
      
      const query = {};

      // Branch-based filtering
      if (req.user.role !== 'ADMIN') {
        query.branch = req.user.branchId;
      } else if (branch) {
        query.branch = branch;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { borrowerId: { $regex: search, $options: 'i' } }
        ];
      }

      if (kycStatus) query.kycStatus = kycStatus;
      if (status) query.status = status;

      const borrowers = await Borrower.find(query)
        .populate('branch', 'name code')
        .populate('createdBy', 'name username')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Borrower.countDocuments(query);

      res.json({
        borrowers,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /borrowers/:id
  async getById(req, res) {
    try {
      const borrower = await Borrower.findById(req.params.id)
        .populate('branch', 'name code address')
        .populate('createdBy', 'name username');
      
      if (!borrower) {
        return res.status(404).json({ message: 'Borrower not found' });
      }

      // Get loan statistics
      const loanStats = await Loan.aggregate([
        { $match: { borrower: borrower._id } },
        {
          $group: {
            _id: null,
            totalLoans: { $sum: 1 },
            totalDisbursed: { $sum: '$loanAmount' },
            totalOutstanding: { $sum: '$outstandingAmount' },
            activeLoans: {
              $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
            }
          }
        }
      ]);

      res.json({
        ...borrower.toObject(),
        loanStats: loanStats[0] || {
          totalLoans: 0,
          totalDisbursed: 0,
          totalOutstanding: 0,
          activeLoans: 0
        }
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /borrowers/:id
  async update(req, res) {
    try {
      const borrower = await Borrower.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('branch', 'name code');

      if (!borrower) {
        return res.status(404).json({ message: 'Borrower not found' });
      }

      res.json(borrower);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  // DELETE /borrowers/:id
  async delete(req, res) {
    try {
      const borrower = await Borrower.findById(req.params.id);
      
      if (!borrower) {
        return res.status(404).json({ message: 'Borrower not found' });
      }

      // Check if borrower has active loans
      const activeLoans = await Loan.countDocuments({ 
        borrower: borrower._id, 
        status: { $in: ['ACTIVE', 'OVERDUE'] } 
      });

      if (activeLoans > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete borrower with active loans' 
        });
      }

      await Borrower.findByIdAndDelete(req.params.id);
      res.json({ message: 'Borrower deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // POST /borrowers/:id/kyc/upload
  async uploadKyc(req, res) {
    try {
      upload.single('document')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }

        const { documentType } = req.body;
        const borrower = await Borrower.findById(req.params.id);

        if (!borrower) {
          return res.status(404).json({ message: 'Borrower not found' });
        }

        const kycDocument = {
          type: documentType,
          filename: req.file.filename,
          originalName: req.file.originalname,
          path: req.file.path,
          uploadedAt: new Date(),
          uploadedBy: req.user.userId
        };

        borrower.kycDocuments.push(kycDocument);
        await borrower.save();

        res.json({
          message: 'KYC document uploaded successfully',
          document: kycDocument
        });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /borrowers/:id/kyc/verify
  async verifyKyc(req, res) {
    try {
      const { documentId, remarks } = req.body;
      
      const borrower = await Borrower.findById(req.params.id);
      if (!borrower) {
        return res.status(404).json({ message: 'Borrower not found' });
      }

      const document = borrower.kycDocuments.id(documentId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      document.status = 'VERIFIED';
      document.verifiedAt = new Date();
      document.verifiedBy = req.user.userId;
      document.remarks = remarks;

      // Check if all required documents are verified
      const requiredDocs = ['AADHAAR', 'PAN', 'PHOTO'];
      const verifiedDocs = borrower.kycDocuments.filter(doc => 
        doc.status === 'VERIFIED' && requiredDocs.includes(doc.type)
      );

      if (verifiedDocs.length >= requiredDocs.length) {
        borrower.kycStatus = 'VERIFIED';
        borrower.kycVerifiedAt = new Date();
      }

      await borrower.save();
      res.json(borrower);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /borrowers/:id/kyc/reject
  async rejectKyc(req, res) {
    try {
      const { documentId, remarks } = req.body;
      
      const borrower = await Borrower.findById(req.params.id);
      if (!borrower) {
        return res.status(404).json({ message: 'Borrower not found' });
      }

      const document = borrower.kycDocuments.id(documentId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      document.status = 'REJECTED';
      document.rejectedAt = new Date();
      document.rejectedBy = req.user.userId;
      document.remarks = remarks;

      borrower.kycStatus = 'REJECTED';
      await borrower.save();

      res.json(borrower);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /borrowers/:id/loans
  async getBorrowerLoans(req, res) {
    try {
      const loans = await Loan.find({ borrower: req.params.id })
        .populate('loanProduct', 'name interestRate')
        .sort({ createdAt: -1 });

      res.json(loans);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new BorrowersController();