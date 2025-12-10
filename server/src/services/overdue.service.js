const Loan = require('../models/Loan');
const Instalment = require('../models/Instalment');
const cron = require('node-cron');

class OverdueService {
  // Update DPD for all active loans
  static async updateDPD() {
    try {
      const activeLoans = await Loan.find({ status: 'ACTIVE' });
      const currentDate = new Date();
      
      for (const loan of activeLoans) {
        const overdueInstallments = await Instalment.find({
          loan: loan._id,
          status: 'PENDING',
          dueDate: { $lt: currentDate }
        }).sort({ dueDate: 1 });
        
        if (overdueInstallments.length > 0) {
          const oldestDue = overdueInstallments[0].dueDate;
          const dpd = Math.floor((currentDate - oldestDue) / (1000 * 60 * 60 * 24));
          const overdueAmount = overdueInstallments.reduce((sum, inst) => sum + inst.emiAmount, 0);
          
          await Loan.findByIdAndUpdate(loan._id, {
            dpd,
            overdueAmount,
            lastUpdated: currentDate
          });
          
          // Mark installments as overdue
          await Instalment.updateMany(
            {
              loan: loan._id,
              status: 'PENDING',
              dueDate: { $lt: currentDate }
            },
            { status: 'OVERDUE' }
          );
        } else {
          // No overdue installments
          await Loan.findByIdAndUpdate(loan._id, {
            dpd: 0,
            overdueAmount: 0,
            lastUpdated: currentDate
          });
        }
      }
      
      console.log(`Updated DPD for ${activeLoans.length} loans`);
    } catch (error) {
      console.error('Error updating DPD:', error);
    }
  }
  
  // Get overdue loans by bucket
  static async getOverdueBuckets(branchId = null) {
    try {
      const filter = { status: 'ACTIVE', dpd: { $gt: 0 } };
      if (branchId) filter.branch = branchId;
      
      const overdueLoans = await Loan.find(filter)
        .populate('borrower', 'name phone')
        .populate('branch', 'name')
        .populate('loanProduct', 'name');
      
      const buckets = {
        '1-7': [],
        '8-30': [],
        '31-60': [],
        '61-90': [],
        '90+': []
      };
      
      overdueLoans.forEach(loan => {
        const dpd = loan.dpd;
        if (dpd <= 7) buckets['1-7'].push(loan);
        else if (dpd <= 30) buckets['8-30'].push(loan);
        else if (dpd <= 60) buckets['31-60'].push(loan);
        else if (dpd <= 90) buckets['61-90'].push(loan);
        else buckets['90+'].push(loan);
      });
      
      return buckets;
    } catch (error) {
      throw error;
    }
  }
  
  // Calculate collection priority score
  static calculatePriorityScore(loan) {
    let score = 0;
    
    // DPD weight (higher DPD = higher priority)
    score += loan.dpd * 2;
    
    // Outstanding amount weight
    if (loan.outstanding > 100000) score += 20;
    else if (loan.outstanding > 50000) score += 10;
    else score += 5;
    
    // Previous payment behavior
    if (loan.paymentHistory?.irregularPayments > 3) score += 15;
    
    // Borrower contact attempts
    if (loan.contactAttempts > 5) score += 10;
    
    return score;
  }
  
  // Start DPD update cron job (runs daily at midnight)
  static startDPDUpdateJob() {
    cron.schedule('0 0 * * *', () => {
      console.log('Running daily DPD update...');
      this.updateDPD();
    });
    
    console.log('DPD update cron job started');
  }
}

module.exports = OverdueService;