const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const rolesMiddleware = require('../middlewares/roles.middleware');
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');

// Get overdue loans by buckets
router.get('/overdue', authenticateToken, rolesMiddleware(['ADMIN', 'MANAGER', 'COLLECTION']), async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = { status: 'ACTIVE', dpd: { $gt: 0 } };
    if (branch) filter.branch = branch;

    const loans = await Loan.find(filter)
      .populate('borrower', 'name phone')
      .populate('branch', 'name')
      .populate('loanProduct', 'name');

    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get daily collections
router.get('/daily', authenticateToken, rolesMiddleware(['ADMIN', 'MANAGER', 'COLLECTION']), async (req, res) => {
  try {
    const { date, branch } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const filter = {
      paymentDate: { $gte: targetDate, $lt: nextDay }
    };
    if (branch) filter.branch = branch;

    const payments = await Payment.find(filter)
      .populate('loan', 'loanId')
      .populate('borrower', 'name phone')
      .populate('collectedBy', 'displayName');

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;