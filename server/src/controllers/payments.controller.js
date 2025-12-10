// server/src/controllers/payments.controller.js
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const Instalment = require('../models/Instalment');

// POST /api/payments - Record payment
exports.createPayment = async (req, res) => {
  try {
    const { loanId, amount, mode, note } = req.body;
    const userId = req.user.id;

    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    // Create payment record
    const payment = new Payment({
      loan: loanId,
      amount,
      mode,
      note,
      collectedBy: userId,
      status: 'completed'
    });

    // Apply payment to instalments (FIFO)
    let remainingAmount = amount;
    const overdueInstalments = await Instalment.find({
      loan: loanId,
      status: { $in: ['pending', 'overdue'] }
    }).sort({ dueDate: 1 });

    for (const instalment of overdueInstalments) {
      if (remainingAmount <= 0) break;

      const totalDue = instalment.principalDue + instalment.interestDue + (instalment.penaltyDue || 0);
      const paymentForThis = Math.min(remainingAmount, totalDue);

      // Allocate payment (penalty first, then interest, then principal)
      let allocated = paymentForThis;
      const penaltyPaid = Math.min(allocated, instalment.penaltyDue || 0);
      allocated -= penaltyPaid;
      
      const interestPaid = Math.min(allocated, instalment.interestDue);
      allocated -= interestPaid;
      
      const principalPaid = allocated;

      // Update instalment
      instalment.penaltyPaid = (instalment.penaltyPaid || 0) + penaltyPaid;
      instalment.interestPaid = (instalment.interestPaid || 0) + interestPaid;
      instalment.principalPaid = (instalment.principalPaid || 0) + principalPaid;
      
      instalment.penaltyDue = (instalment.penaltyDue || 0) - penaltyPaid;
      instalment.interestDue -= interestPaid;
      instalment.principalDue -= principalPaid;

      if (instalment.principalDue <= 0 && instalment.interestDue <= 0 && (instalment.penaltyDue || 0) <= 0) {
        instalment.status = 'paid';
        instalment.paidDate = new Date();
      }

      await instalment.save();
      remainingAmount -= paymentForThis;

      // Update payment allocation
      payment.principal = (payment.principal || 0) + principalPaid;
      payment.interest = (payment.interest || 0) + interestPaid;
      payment.penalty = (payment.penalty || 0) + penaltyPaid;
    }

    await payment.save();

    // Update loan totals
    const totalPaid = await Payment.aggregate([
      { $match: { loan: loan._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    loan.totalPaid = totalPaid[0]?.total || 0;
    loan.outstandingAmount = loan.totalPayable - loan.totalPaid;
    
    if (loan.outstandingAmount <= 0) {
      loan.status = 'closed';
      loan.closedDate = new Date();
    }

    await loan.save();

    res.json({ message: 'Payment recorded successfully', payment });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ message: 'Payment failed', error: error.message });
  }
};

// POST /api/payments/bounce - Record bounced payment
exports.recordBounce = async (req, res) => {
  try {
    const { loanId, amount, mode, note, bounceReason } = req.body;

    const payment = new Payment({
      loan: loanId,
      amount,
      mode,
      note: `BOUNCED: ${bounceReason}. ${note}`,
      collectedBy: req.user.id,
      status: 'bounced',
      bounceReason
    });

    await payment.save();
    res.json({ message: 'Bounce recorded', payment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record bounce', error: error.message });
  }
};