const Loan = require('../models/Loan');
const Instalment = require('../models/Instalment');
const Payment = require('../models/Payment');

class CollectionsService {
  async getDueToday() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dueInstalments = await Instalment.find({
        dueDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['PENDING', 'PARTIAL'] }
      })
      .populate({
        path: 'loan',
        populate: [
          { path: 'borrower', select: 'customerId personalInfo contact' },
          { path: 'assignedCollector', select: 'name username' }
        ]
      })
      .sort({ dueDate: 1 });

      const summary = {
        totalDue: dueInstalments.reduce((sum, inst) => sum + (inst.totalAmount - inst.paidAmount), 0),
        totalCount: dueInstalments.length,
        totalAmount: dueInstalments.reduce((sum, inst) => sum + inst.totalAmount, 0)
      };

      return {
        success: true,
        data: {
          instalments: dueInstalments,
          summary
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getOverdue() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueInstalments = await Instalment.find({
        dueDate: { $lt: today },
        status: { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] }
      })
      .populate({
        path: 'loan',
        populate: [
          { path: 'borrower', select: 'customerId personalInfo contact' },
          { path: 'assignedCollector', select: 'name username' }
        ]
      })
      .sort({ dueDate: 1 });

      // Calculate days overdue for each installment
      const overdueWithDays = overdueInstalments.map(inst => {
        const daysOverdue = Math.floor((today - new Date(inst.dueDate)) / (1000 * 60 * 60 * 24));
        return {
          ...inst.toObject(),
          daysOverdue,
          outstandingAmount: inst.totalAmount - inst.paidAmount
        };
      });

      // Group by overdue buckets
      const buckets = {
        '1-7': [],
        '8-30': [],
        '31-90': [],
        '90+': []
      };

      overdueWithDays.forEach(inst => {
        if (inst.daysOverdue <= 7) buckets['1-7'].push(inst);
        else if (inst.daysOverdue <= 30) buckets['8-30'].push(inst);
        else if (inst.daysOverdue <= 90) buckets['31-90'].push(inst);
        else buckets['90+'].push(inst);
      });

      const summary = {
        totalOverdue: overdueWithDays.reduce((sum, inst) => sum + inst.outstandingAmount, 0),
        totalCount: overdueWithDays.length,
        buckets: Object.keys(buckets).map(key => ({
          range: key,
          count: buckets[key].length,
          amount: buckets[key].reduce((sum, inst) => sum + inst.outstandingAmount, 0)
        }))
      };

      return {
        success: true,
        data: {
          instalments: overdueWithDays,
          buckets,
          summary
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAllOutstanding() {
    try {
      const outstandingInstalments = await Instalment.find({
        status: { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] }
      })
      .populate({
        path: 'loan',
        populate: [
          { path: 'borrower', select: 'customerId personalInfo contact' },
          { path: 'assignedCollector', select: 'name username' }
        ]
      })
      .sort({ dueDate: 1 });

      const today = new Date();
      const outstandingWithStatus = outstandingInstalments.map(inst => {
        const daysOverdue = Math.floor((today - new Date(inst.dueDate)) / (1000 * 60 * 60 * 24));
        const outstandingAmount = inst.totalAmount - inst.paidAmount;
        
        let status = 'CURRENT';
        if (daysOverdue > 0) status = 'OVERDUE';
        if (daysOverdue > 90) status = 'NPA';

        return {
          ...inst.toObject(),
          daysOverdue: Math.max(0, daysOverdue),
          outstandingAmount,
          collectionStatus: status
        };
      });

      const summary = {
        totalOutstanding: outstandingWithStatus.reduce((sum, inst) => sum + inst.outstandingAmount, 0),
        totalCount: outstandingWithStatus.length,
        current: outstandingWithStatus.filter(inst => inst.collectionStatus === 'CURRENT').length,
        overdue: outstandingWithStatus.filter(inst => inst.collectionStatus === 'OVERDUE').length,
        npa: outstandingWithStatus.filter(inst => inst.collectionStatus === 'NPA').length
      };

      return {
        success: true,
        data: {
          instalments: outstandingWithStatus,
          summary
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async recordPTP(ptpData) {
    try {
      const { loanId, amount, promiseDate, collectorId, notes } = ptpData;

      const loan = await Loan.findById(loanId);
      if (!loan) {
        return { success: false, error: 'Loan not found' };
      }

      // Add PTP to loan notes
      if (!loan.notes) loan.notes = [];
      loan.notes.push({
        text: `PTP: ₹${amount} promised for ${new Date(promiseDate).toDateString()}${notes ? ` - ${notes}` : ''}`,
        createdBy: collectorId,
        createdAt: new Date()
      });

      await loan.save();

      return {
        success: true,
        data: { message: 'PTP recorded successfully' }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addAgentNote(noteData) {
    try {
      const { loanId, note, agentId } = noteData;

      const loan = await Loan.findById(loanId);
      if (!loan) {
        return { success: false, error: 'Loan not found' };
      }

      if (!loan.notes) loan.notes = [];
      loan.notes.push({
        text: note,
        createdBy: agentId,
        createdAt: new Date()
      });

      await loan.save();

      return {
        success: true,
        data: { message: 'Note added successfully' }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getLoanTimeline(loanId) {
    try {
      const loan = await Loan.findById(loanId)
        .populate('notes.createdBy', 'name username');

      const payments = await Payment.find({ loan: loanId })
        .populate('collectedBy', 'name username')
        .sort({ paymentDate: -1 });

      const instalments = await Instalment.find({ loan: loanId })
        .sort({ instalmentNumber: 1 });

      // Create timeline events
      const events = [];

      // Loan creation
      events.push({
        type: 'LOAN_CREATED',
        date: loan.createdAt,
        description: 'Loan account created',
        amount: loan.principal
      });

      // Disbursement
      if (loan.disbursedDate) {
        events.push({
          type: 'LOAN_DISBURSED',
          date: loan.disbursedDate,
          description: 'Loan amount disbursed',
          amount: loan.disbursedAmount
        });
      }

      // Payments
      payments.forEach(payment => {
        events.push({
          type: 'PAYMENT_RECEIVED',
          date: payment.paymentDate,
          description: `Payment received via ${payment.paymentMode}`,
          amount: payment.amount,
          collectedBy: payment.collectedBy
        });
      });

      // Notes and PTPs
      if (loan.notes) {
        loan.notes.forEach(note => {
          events.push({
            type: note.text.startsWith('PTP:') ? 'PTP_RECORDED' : 'NOTE_ADDED',
            date: note.createdAt,
            description: note.text,
            createdBy: note.createdBy
          });
        });
      }

      // Sort by date (newest first)
      events.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        success: true,
        data: {
          loan,
          events,
          instalments,
          payments
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCollectionSummary(collectorId = null) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const filter = {};
      if (collectorId) {
        filter.assignedCollector = collectorId;
      }

      // Get all active loans
      const loans = await Loan.find({ ...filter, status: { $in: ['ACTIVE', 'DISBURSED'] } });
      const loanIds = loans.map(loan => loan._id);

      // Due today
      const dueToday = await Instalment.countDocuments({
        loan: { $in: loanIds },
        dueDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
        status: { $in: ['PENDING', 'PARTIAL'] }
      });

      // Overdue
      const overdue = await Instalment.countDocuments({
        loan: { $in: loanIds },
        dueDate: { $lt: today },
        status: { $in: ['PENDING', 'PARTIAL', 'OVERDUE'] }
      });

      // Collections today
      const collectionsToday = await Payment.aggregate([
        {
          $match: {
            loan: { $in: loanIds },
            paymentDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalCount: { $sum: 1 }
          }
        }
      ]);

      return {
        success: true,
        data: {
          dueToday,
          overdue,
          collectionsToday: collectionsToday[0] || { totalAmount: 0, totalCount: 0 },
          totalActiveLoans: loans.length
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new CollectionsService();