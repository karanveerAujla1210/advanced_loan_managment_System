const Loan = require('../models/Loan');
const Instalment = require('../models/Instalment');
const Borrower = require('../models/Borrower');
const LoanProduct = require('../models/LoanProduct');

// Get disbursement queue (approved loans)
const getDisbursementQueue = async (req, res) => {
  try {
    const loans = await Loan.find({ status: 'APPROVED' })
      .populate('borrowerId', 'firstName lastName phone email')
      .populate('loanProductId', 'name interestRate')
      .populate('branchId', 'name')
      .sort({ applicationDate: 1 });

    const formattedLoans = loans.map(loan => ({
      _id: loan._id,
      loanNumber: loan.loanNumber,
      borrower: {
        firstName: loan.borrowerId?.firstName,
        lastName: loan.borrowerId?.lastName,
        phone: loan.borrowerId?.phone,
        email: loan.borrowerId?.email
      },
      loanProduct: {
        name: loan.loanProductId?.name
      },
      branch: {
        name: loan.branchId?.name
      },
      principalAmount: loan.principalAmount,
      interestRate: loan.interestRate,
      tenure: loan.tenure,
      emiAmount: loan.emiAmount,
      applicationDate: loan.applicationDate,
      status: loan.status
    }));

    res.json(formattedLoans);
  } catch (error) {
    console.error('Error fetching disbursement queue:', error);
    res.status(500).json({ message: 'Failed to fetch disbursement queue' });
  }
};

// Disburse a loan
const disburseLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { disbursementDate, disbursementMethod, remarks } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    if (loan.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Loan is not approved for disbursement' });
    }

    // Update loan status
    loan.status = 'ACTIVE';
    loan.disbursementDate = disbursementDate || new Date();
    loan.disbursementMethod = disbursementMethod || 'BANK_TRANSFER';
    loan.disbursedBy = req.user.id;
    loan.disbursementRemarks = remarks;
    
    await loan.save();

    // Generate instalment schedule if not exists
    const existingInstalments = await Instalment.find({ loanId: loan._id });
    
    if (existingInstalments.length === 0) {
      const instalments = generateInstalmentSchedule(
        loan._id,
        loan.principalAmount,
        loan.interestRate,
        loan.tenure,
        loan.disbursementDate
      );
      
      await Instalment.insertMany(instalments);
    }

    res.json({ 
      message: 'Loan disbursed successfully',
      loan: {
        _id: loan._id,
        loanNumber: loan.loanNumber,
        status: loan.status,
        disbursementDate: loan.disbursementDate
      }
    });

  } catch (error) {
    console.error('Error disbursing loan:', error);
    res.status(500).json({ message: 'Failed to disburse loan' });
  }
};

// Generate instalment schedule
function generateInstalmentSchedule(loanId, principal, rate, tenure, startDate) {
  const instalments = [];
  const monthlyRate = rate / (12 * 100);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
              (Math.pow(1 + monthlyRate, tenure) - 1);
  
  let balance = principal;
  
  for (let i = 1; i <= tenure; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    const interest = Math.round(balance * monthlyRate);
    const principalAmount = Math.round(emi) - interest;
    balance = Math.max(0, balance - principalAmount);
    
    instalments.push({
      loanId,
      instalmentNumber: i,
      dueDate,
      emiAmount: Math.round(emi),
      principalAmount,
      interestAmount: interest,
      outstandingBalance: Math.round(balance),
      status: 'PENDING'
    });
  }
  
  return instalments;
}

// Get disbursement statistics
const getDisbursementStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      pendingCount,
      pendingAmount,
      monthlyDisbursed,
      monthlyAmount,
      yearlyDisbursed,
      yearlyAmount
    ] = await Promise.all([
      Loan.countDocuments({ status: 'APPROVED' }),
      Loan.aggregate([
        { $match: { status: 'APPROVED' } },
        { $group: { _id: null, total: { $sum: '$principalAmount' } } }
      ]),
      Loan.countDocuments({ 
        status: 'ACTIVE',
        disbursementDate: { $gte: startOfMonth }
      }),
      Loan.aggregate([
        { 
          $match: { 
            status: 'ACTIVE',
            disbursementDate: { $gte: startOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$principalAmount' } } }
      ]),
      Loan.countDocuments({ 
        status: 'ACTIVE',
        disbursementDate: { $gte: startOfYear }
      }),
      Loan.aggregate([
        { 
          $match: { 
            status: 'ACTIVE',
            disbursementDate: { $gte: startOfYear }
          }
        },
        { $group: { _id: null, total: { $sum: '$principalAmount' } } }
      ])
    ]);

    res.json({
      pending: {
        count: pendingCount,
        amount: pendingAmount[0]?.total || 0
      },
      monthly: {
        count: monthlyDisbursed,
        amount: monthlyAmount[0]?.total || 0
      },
      yearly: {
        count: yearlyDisbursed,
        amount: yearlyAmount[0]?.total || 0
      }
    });

  } catch (error) {
    console.error('Error fetching disbursement stats:', error);
    res.status(500).json({ message: 'Failed to fetch disbursement statistics' });
  }
};

module.exports = {
  getDisbursementQueue,
  disburseLoan,
  getDisbursementStats
};