const Loan = require('../models/Loan');
const Borrower = require('../models/Borrower');
const Payment = require('../models/Payment');
const Branch = require('../models/Branch');

// Get dashboard KPIs
exports.getDashboardKPIs = async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = branch ? { branch } : {};

    // Total loans
    const totalLoans = await Loan.countDocuments(filter);
    
    // Active loans
    const activeLoans = await Loan.countDocuments({ ...filter, status: 'ACTIVE' });
    
    // Total portfolio
    const portfolioResult = await Loan.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$principal' } } }
    ]);
    const totalPortfolio = portfolioResult[0]?.total || 0;
    
    // Outstanding amount
    const outstandingResult = await Loan.aggregate([
      { $match: { ...filter, status: 'ACTIVE' } },
      { $group: { _id: null, total: { $sum: '$outstanding' } } }
    ]);
    const totalOutstanding = outstandingResult[0]?.total || 0;
    
    // Overdue loans
    const overdueLoans = await Loan.countDocuments({ ...filter, status: 'ACTIVE', dpd: { $gt: 0 } });
    
    // Collections today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayCollections = await Payment.aggregate([
      { 
        $match: { 
          paymentDate: { $gte: today, $lt: tomorrow },
          ...(branch && { branch })
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const collectionsToday = todayCollections[0]?.total || 0;
    
    // Disbursements pending
    const pendingDisbursements = await Loan.countDocuments({ ...filter, status: 'APPROVED' });
    
    // NPA loans (90+ DPD)
    const npaLoans = await Loan.countDocuments({ ...filter, status: 'ACTIVE', dpd: { $gte: 90 } });

    res.json({
      totalLoans,
      activeLoans,
      totalPortfolio,
      totalOutstanding,
      overdueLoans,
      collectionsToday,
      pendingDisbursements,
      npaLoans,
      parPercentage: activeLoans ? ((overdueLoans / activeLoans) * 100).toFixed(2) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get recent activities
exports.getRecentActivities = async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = branch ? { branch } : {};

    // Recent loans
    const recentLoans = await Loan.find(filter)
      .populate('borrower', 'name')
      .populate('branch', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent payments
    const recentPayments = await Payment.find(branch ? { branch } : {})
      .populate('loan', 'loanId')
      .populate('borrower', 'name')
      .sort({ paymentDate: -1 })
      .limit(5);

    res.json({
      recentLoans: recentLoans.map(loan => ({
        id: loan._id,
        loanId: loan.loanId,
        borrower: loan.borrower?.name,
        amount: loan.principal,
        status: loan.status,
        date: loan.createdAt,
        branch: loan.branch?.name
      })),
      recentPayments: recentPayments.map(payment => ({
        id: payment._id,
        loanId: payment.loan?.loanId,
        borrower: payment.borrower?.name,
        amount: payment.amount,
        mode: payment.paymentMode,
        date: payment.paymentDate
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get portfolio distribution
exports.getPortfolioDistribution = async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = branch ? { branch } : {};

    const distribution = await Loan.aggregate([
      { $match: { ...filter, status: 'ACTIVE' } },
      {
        $bucket: {
          groupBy: '$dpd',
          boundaries: [0, 1, 8, 31, 61, 91, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            amount: { $sum: '$outstanding' }
          }
        }
      }
    ]);

    const buckets = {
      'Current': { count: 0, amount: 0 },
      '1-7 Days': { count: 0, amount: 0 },
      '8-30 Days': { count: 0, amount: 0 },
      '31-60 Days': { count: 0, amount: 0 },
      '61-90 Days': { count: 0, amount: 0 },
      '90+ Days': { count: 0, amount: 0 }
    };

    distribution.forEach(bucket => {
      if (bucket._id === 0) buckets['Current'] = bucket;
      else if (bucket._id === 1) buckets['1-7 Days'] = bucket;
      else if (bucket._id === 8) buckets['8-30 Days'] = bucket;
      else if (bucket._id === 31) buckets['31-60 Days'] = bucket;
      else if (bucket._id === 61) buckets['61-90 Days'] = bucket;
      else if (bucket._id === 91) buckets['90+ Days'] = bucket;
    });

    res.json(buckets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};