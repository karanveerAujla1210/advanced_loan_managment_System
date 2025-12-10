// server/src/controllers/legal.controller.js
const LegalCase = require('../models/LegalCase');
const Loan = require('../models/Loan');
const Instalment = require('../models/Instalment');

// POST /api/legal/case - Create legal case
exports.createLegalCase = async (req, res) => {
  try {
    const { loanId, note } = req.body;
    const userId = req.user.id;

    const loan = await Loan.findById(loanId).populate('borrower');
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    // Check if legal case already exists
    const existingCase = await LegalCase.findOne({ loan: loanId, status: { $ne: 'closed' } });
    if (existingCase) {
      return res.status(400).json({ message: 'Active legal case already exists' });
    }

    // Calculate overdue amount
    const overdueInstalments = await Instalment.find({
      loan: loanId,
      status: 'overdue'
    });

    const overdueAmount = overdueInstalments.reduce((sum, inst) => 
      sum + inst.principalDue + inst.interestDue + (inst.penaltyDue || 0), 0
    );

    // Create legal case
    const legalCase = new LegalCase({
      loan: loanId,
      borrower: loan.borrower._id,
      caseType: 'recovery',
      status: 'initiated',
      overdueAmount,
      legalCharges: Math.min(overdueAmount * 0.05, 5000), // 5% or max 5000
      initiatedBy: userId,
      note,
      timeline: [{
        action: 'case_initiated',
        date: new Date(),
        note,
        user: userId
      }]
    });

    await legalCase.save();

    // Update loan with legal case reference
    loan.legal = {
      status: 'initiated',
      caseId: legalCase._id,
      caseDate: new Date(),
      charges: legalCase.legalCharges
    };

    // Apply legal charges to loan
    loan.legalCharges = (loan.legalCharges || 0) + legalCase.legalCharges;
    loan.totalPayable += legalCase.legalCharges;
    loan.outstandingAmount += legalCase.legalCharges;

    await loan.save();

    res.json({ 
      message: 'Legal case created successfully', 
      legalCase,
      legalCharges: legalCase.legalCharges
    });
  } catch (error) {
    console.error('Legal case creation error:', error);
    res.status(500).json({ message: 'Failed to create legal case', error: error.message });
  }
};

// GET /api/legal/cases - List legal cases
exports.getLegalCases = async (req, res) => {
  try {
    const cases = await LegalCase.find()
      .populate('loan', 'loanNumber principal')
      .populate('borrower', 'firstName lastName phone')
      .sort({ createdAt: -1 });

    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch legal cases', error: error.message });
  }
};