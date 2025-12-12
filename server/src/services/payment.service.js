const Payment = require('../models/Payment');
const Instalment = require('../models/Instalment');
const Loan = require('../models/Loan');

class PaymentService {
  async addPayment(paymentData) {
    try {
      const {
        loanId,
        amount,
        paymentMode,
        paymentDate,
        collectedBy,
        branchId,
        notes
      } = paymentData;

      // Validate loan
      const loan = await Loan.findById(loanId).populate('borrower');
      if (!loan) {
        return { success: false, error: 'Loan not found' };
      }

      // Generate payment ID
      const paymentId = await this.generatePaymentId();

      // Create payment record
      const payment = new Payment({
        paymentId,
        loan: loanId,
        borrower: loan.borrower._id,
        amount,
        paymentMode,
        paymentDate,
        collectedBy,
        branch: branchId,
        notes,
        status: 'COMPLETED'
      });

      // Auto-allocate payment to earliest unpaid installments
      const allocation = await this.allocatePayment(loanId, amount);
      payment.allocation = allocation.allocations;

      await payment.save();

      // Update installment statuses
      await this.updateInstallmentStatuses(allocation.allocations, paymentDate);

      // Update loan totals
      await this.updateLoanTotals(loanId);

      // Add to loan events
      await this.addLoanEvent(loanId, {
        type: 'PAYMENT_RECEIVED',
        amount,
        paymentMode,
        collectedBy,
        date: paymentDate,
        notes
      });

      return {
        success: true,
        data: {
          payment,
          allocation: allocation.allocations,
          remainingAmount: allocation.remainingAmount
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async allocatePayment(loanId, amount) {
    try {
      // Get unpaid installments in order
      const installments = await Instalment.find({
        loan: loanId,
        status: { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] }
      }).sort({ instalmentNumber: 1 });

      const allocations = [];
      let remainingAmount = amount;

      for (const installment of installments) {
        if (remainingAmount <= 0) break;

        const outstandingAmount = installment.totalAmount + installment.penaltyAmount - installment.paidAmount;
        
        if (outstandingAmount > 0) {
          const allocationAmount = Math.min(remainingAmount, outstandingAmount);
          
          // Allocate to interest first, then principal
          const interestDue = installment.interestAmount - installment.paidInterest;
          const principalDue = installment.principalAmount - installment.paidPrincipal;
          const penaltyDue = installment.penaltyAmount - installment.paidPenalty;

          let interestAllocation = Math.min(allocationAmount, interestDue);
          let principalAllocation = Math.min(allocationAmount - interestAllocation, principalDue);
          let penaltyAllocation = Math.min(allocationAmount - interestAllocation - principalAllocation, penaltyDue);

          allocations.push({
            instalment: installment._id,
            principalAmount: principalAllocation,
            interestAmount: interestAllocation,
            penaltyAmount: penaltyAllocation,
            totalAllocated: allocationAmount
          });

          remainingAmount -= allocationAmount;
        }
      }

      return { allocations, remainingAmount };
    } catch (error) {
      throw new Error(`Payment allocation failed: ${error.message}`);
    }
  }

  async updateInstallmentStatuses(allocations, paymentDate) {
    try {
      for (const allocation of allocations) {
        const installment = await Instalment.findById(allocation.instalment);
        
        installment.paidAmount += allocation.totalAllocated;
        installment.paidPrincipal += allocation.principalAmount;
        installment.paidInterest += allocation.interestAmount;
        installment.paidPenalty += allocation.penaltyAmount;

        // Update status
        const totalDue = installment.totalAmount + installment.penaltyAmount;
        if (installment.paidAmount >= totalDue) {
          installment.status = 'COMPLETED';
          installment.paidDate = paymentDate;
        } else if (installment.paidAmount > 0) {
          installment.status = 'PARTIAL';
        }

        await installment.save();
      }
    } catch (error) {
      throw new Error(`Failed to update installment statuses: ${error.message}`);
    }
  }

  async updateLoanTotals(loanId) {
    try {
      const loan = await Loan.findById(loanId);
      const payments = await Payment.find({ loan: loanId, status: 'COMPLETED' });
      const installments = await Instalment.find({ loan: loanId });

      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const totalScheduled = installments.reduce((sum, inst) => sum + inst.totalAmount, 0);
      const outstandingAmount = totalScheduled - totalPaid;

      // Find next due date
      const nextDueInstallment = installments.find(inst => 
        inst.status === 'PENDING' || inst.status === 'PARTIAL'
      );

      loan.totalPaid = totalPaid;
      loan.outstandingPrincipal = outstandingAmount;
      loan.lastPaymentDate = new Date();
      loan.nextDueDate = nextDueInstallment ? nextDueInstallment.dueDate : null;

      // Update loan status
      if (outstandingAmount <= 0) {
        loan.status = 'CLOSED';
      } else if (loan.status === 'DISBURSED') {
        loan.status = 'ACTIVE';
      }

      await loan.save();
    } catch (error) {
      throw new Error(`Failed to update loan totals: ${error.message}`);
    }
  }

  async addLoanEvent(loanId, eventData) {
    try {
      const loan = await Loan.findById(loanId);
      if (!loan.notes) loan.notes = [];
      
      loan.notes.push({
        text: `${eventData.type}: ₹${eventData.amount} via ${eventData.paymentMode}${eventData.notes ? ` - ${eventData.notes}` : ''}`,
        createdBy: eventData.collectedBy,
        createdAt: eventData.date
      });

      await loan.save();
    } catch (error) {
      throw new Error(`Failed to add loan event: ${error.message}`);
    }
  }

  async getPaymentHistory(loanId) {
    try {
      const payments = await Payment.find({ loan: loanId })
        .populate('collectedBy', 'name username')
        .populate('allocation.instalment', 'instalmentNumber dueDate')
        .sort({ paymentDate: -1 });

      return { success: true, data: payments };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generatePaymentId() {
    const currentYear = new Date().getFullYear();
    const prefix = `PY${currentYear}`;
    
    const lastPayment = await Payment.findOne({
      paymentId: { $regex: `^${prefix}` }
    }).sort({ paymentId: -1 });

    let sequence = 1;
    if (lastPayment) {
      const lastSequence = parseInt(lastPayment.paymentId.substring(prefix.length));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }
}

module.exports = new PaymentService();