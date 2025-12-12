const Loan = require('../models/Loan');
const Instalment = require('../models/Instalment');
const Borrower = require('../models/Borrower');
const LoanProduct = require('../models/LoanProduct');
const scheduleService = require('./schedule.service');

class LoanService {
  async createLoan(loanData) {
    try {
      const {
        borrowerId,
        loanProductId,
        principal,
        tenure = 14, // Default 14 weeks
        frequency = 'WEEKLY',
        disbursementDate,
        branchId,
        createdBy
      } = loanData;

      // Validate borrower
      const borrower = await Borrower.findById(borrowerId);
      if (!borrower) {
        return { success: false, error: 'Borrower not found' };
      }

      // Validate loan product
      const loanProduct = await LoanProduct.findById(loanProductId);
      if (!loanProduct) {
        return { success: false, error: 'Loan product not found' };
      }

      // Generate loan ID
      const loanId = await this.generateLoanId();

      // Calculate loan details
      const interestRate = loanProduct.interestRate;
      const weeklyRate = interestRate / 100 / 52; // Weekly rate
      const emi = this.calculateWeeklyEMI(principal, weeklyRate, tenure);
      const totalPayable = emi * tenure;
      const totalInterest = totalPayable - principal;

      // Create loan
      const loan = new Loan({
        loanId,
        borrower: borrowerId,
        loanProduct: loanProductId,
        principal,
        interestRate,
        tenure,
        emi,
        disbursedAmount: principal,
        disbursedDate: disbursementDate,
        status: 'DISBURSED',
        branch: branchId,
        outstandingPrincipal: principal,
        outstandingInterest: totalInterest,
        nextDueDate: this.calculateNextDueDate(disbursementDate)
      });

      await loan.save();

      // Generate repayment schedule
      const schedule = await this.generateRepaymentSchedule(loan._id, {
        principal,
        interestRate,
        tenure,
        emi,
        startDate: disbursementDate
      });

      await loan.populate(['borrower', 'loanProduct', 'branch']);

      return {
        success: true,
        data: {
          loan,
          schedule,
          summary: {
            principal,
            emi,
            totalPayable,
            totalInterest,
            tenure
          }
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getLoans(query = {}) {
    try {
      const { page = 1, limit = 10, search, status, borrowerId } = query;
      const filter = {};
      
      if (search) {
        const borrowers = await Borrower.find({
          $or: [
            { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
            { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
            { 'contact.phone': { $regex: search, $options: 'i' } }
          ]
        }).select('_id');

        filter.$or = [
          { loanId: { $regex: search, $options: 'i' } },
          { borrower: { $in: borrowers.map(b => b._id) } }
        ];
      }
      
      if (status) filter.status = status;
      if (borrowerId) filter.borrower = borrowerId;

      const loans = await Loan.find(filter)
        .populate('borrower', 'customerId personalInfo contact')
        .populate('loanProduct', 'name interestRate')
        .populate('branch', 'name code')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      const total = await Loan.countDocuments(filter);

      return {
        success: true,
        data: {
          loans,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          total
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getLoanById(id) {
    try {
      const loan = await Loan.findById(id)
        .populate('borrower')
        .populate('loanProduct')
        .populate('branch', 'name code address')
        .populate('assignedCollector', 'name username');

      if (!loan) {
        return { success: false, error: 'Loan not found' };
      }

      // Get repayment schedule
      const schedule = await Instalment.find({ loan: id })
        .sort({ instalmentNumber: 1 });

      // Get payment history
      const Payment = require('../models/Payment');
      const payments = await Payment.find({ loan: id })
        .populate('collectedBy', 'name username')
        .sort({ paymentDate: -1 });

      return {
        success: true,
        data: {
          loan,
          schedule,
          payments,
          summary: this.calculateLoanSummary(loan, schedule, payments)
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateRepaymentSchedule(loanId, scheduleData) {
    try {
      const { principal, interestRate, tenure, emi, startDate } = scheduleData;
      
      const instalments = [];
      let outstandingPrincipal = principal;
      let currentDate = new Date(startDate);
      
      // Move to next week for first installment
      currentDate.setDate(currentDate.getDate() + 7);

      for (let i = 1; i <= tenure; i++) {
        const weeklyRate = interestRate / 100 / 52;
        const interestAmount = outstandingPrincipal * weeklyRate;
        let principalAmount = emi - interestAmount;
        
        // Adjust last installment for rounding
        if (i === tenure) {
          principalAmount = outstandingPrincipal;
        }

        const instalment = new Instalment({
          loan: loanId,
          instalmentNumber: i,
          dueDate: new Date(currentDate),
          principalAmount: Math.round(principalAmount * 100) / 100,
          interestAmount: Math.round(interestAmount * 100) / 100,
          totalAmount: Math.round((principalAmount + interestAmount) * 100) / 100,
          status: 'PENDING'
        });

        instalments.push(instalment);
        outstandingPrincipal -= principalAmount;
        
        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      }

      await Instalment.insertMany(instalments);
      return instalments;
    } catch (error) {
      throw new Error(`Failed to generate schedule: ${error.message}`);
    }
  }

  calculateWeeklyEMI(principal, weeklyRate, tenure) {
    if (weeklyRate === 0) {
      return principal / tenure;
    }

    const emi = principal * weeklyRate * Math.pow(1 + weeklyRate, tenure) / 
                (Math.pow(1 + weeklyRate, tenure) - 1);
    
    return Math.round(emi * 100) / 100;
  }

  calculateNextDueDate(disbursementDate) {
    const nextDue = new Date(disbursementDate);
    nextDue.setDate(nextDue.getDate() + 7); // Next week
    return nextDue;
  }

  calculateLoanSummary(loan, schedule, payments) {
    const totalScheduled = schedule.reduce((sum, inst) => sum + inst.totalAmount, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOutstanding = totalScheduled - totalPaid;
    
    const overdueInstalments = schedule.filter(inst => 
      inst.status === 'OVERDUE' || 
      (inst.status === 'PENDING' && new Date(inst.dueDate) < new Date())
    );
    
    const overdueAmount = overdueInstalments.reduce((sum, inst) => 
      sum + (inst.totalAmount - inst.paidAmount), 0
    );

    return {
      totalScheduled: Math.round(totalScheduled * 100) / 100,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      overdueAmount: Math.round(overdueAmount * 100) / 100,
      overdueInstalments: overdueInstalments.length,
      nextDueDate: loan.nextDueDate,
      daysOverdue: loan.daysOverdue || 0
    };
  }

  async generateLoanId() {
    const currentYear = new Date().getFullYear();
    const prefix = `LN${currentYear}`;
    
    const lastLoan = await Loan.findOne({
      loanId: { $regex: `^${prefix}` }
    }).sort({ loanId: -1 });

    let sequence = 1;
    if (lastLoan) {
      const lastSequence = parseInt(lastLoan.loanId.substring(prefix.length));
      sequence = lastSequence + 1;
    }

    return `${prefix}${sequence.toString().padStart(6, '0')}`;
  }
}

module.exports = new LoanService();