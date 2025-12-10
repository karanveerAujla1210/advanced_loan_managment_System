const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Instalment = require('../models/Instalment');

exports.generateLoanStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const loan = await Loan.findById(id)
      .populate('borrower', 'name phone email')
      .populate('loanProduct', 'name')
      .populate('branch', 'name address');

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Get installments
    const installmentFilter = { loan: id };
    if (startDate && endDate) {
      installmentFilter.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const installments = await Instalment.find(installmentFilter)
      .sort({ installmentNumber: 1 });

    // Get payments
    const paymentFilter = { loan: id };
    if (startDate && endDate) {
      paymentFilter.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payments = await Payment.find(paymentFilter)
      .populate('collectedBy', 'displayName')
      .sort({ paymentDate: -1 });

    // Calculate summary
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalDue = installments.reduce((sum, i) => sum + i.emiAmount, 0);
    const overdueDue = installments
      .filter(i => i.status === 'OVERDUE')
      .reduce((sum, i) => sum + i.emiAmount, 0);

    res.json({
      loan: {
        loanId: loan.loanId,
        borrower: loan.borrower,
        product: loan.loanProduct,
        branch: loan.branch,
        principal: loan.principal,
        interestRate: loan.interestRate,
        tenure: loan.tenure,
        emiAmount: loan.emiAmount,
        outstanding: loan.outstanding,
        disbursementDate: loan.disbursementDate,
        status: loan.status
      },
      summary: {
        totalDue,
        totalPaid,
        overdueDue,
        balance: totalDue - totalPaid
      },
      installments,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};