const Instalment = require('../models/Instalment');

class ScheduleService {
  /**
   * Generate EMI schedule using reducing balance method
   * @param {Object} loanData - Loan details
   * @returns {Array} Array of instalments
   */
  generateSchedule(loanData) {
    const {
      loanAmount,
      interestRate,
      tenure,
      disbursementDate,
      emiStartDate,
      loanId
    } = loanData;

    const monthlyRate = interestRate / 100 / 12;
    const emi = this.calculateEMI(loanAmount, monthlyRate, tenure);
    
    const instalments = [];
    let outstandingPrincipal = loanAmount;
    let currentDate = new Date(emiStartDate);

    for (let i = 1; i <= tenure; i++) {
      const interestDue = outstandingPrincipal * monthlyRate;
      let principalDue = emi - interestDue;
      
      // Adjust last instalment for rounding differences
      if (i === tenure) {
        principalDue = outstandingPrincipal;
      }

      const instalment = {
        loan: loanId,
        instalmentNumber: i,
        dueDate: new Date(currentDate),
        principalDue: Math.round(principalDue * 100) / 100,
        interestDue: Math.round(interestDue * 100) / 100,
        totalDue: Math.round((principalDue + interestDue) * 100) / 100,
        outstandingPrincipal: Math.round((outstandingPrincipal - principalDue) * 100) / 100,
        status: 'PENDING'
      };

      instalments.push(instalment);
      outstandingPrincipal -= principalDue;
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return instalments;
  }

  /**
   * Calculate EMI using standard formula
   * @param {Number} principal - Loan amount
   * @param {Number} monthlyRate - Monthly interest rate
   * @param {Number} tenure - Loan tenure in months
   * @returns {Number} EMI amount
   */
  calculateEMI(principal, monthlyRate, tenure) {
    if (monthlyRate === 0) {
      return principal / tenure;
    }

    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    
    return Math.round(emi * 100) / 100;
  }

  /**
   * Save instalments to database
   * @param {Array} instalments - Array of instalment objects
   * @returns {Promise} Promise resolving to saved instalments
   */
  async saveInstalments(instalments) {
    try {
      const savedInstalments = await Instalment.insertMany(instalments);
      return savedInstalments;
    } catch (error) {
      throw new Error(`Failed to save instalments: ${error.message}`);
    }
  }

  /**
   * Regenerate schedule for existing loan
   * @param {String} loanId - Loan ID
   * @param {Object} loanData - Updated loan data
   * @returns {Promise} Promise resolving to new instalments
   */
  async regenerateSchedule(loanId, loanData) {
    try {
      // Delete existing instalments
      await Instalment.deleteMany({ loan: loanId });
      
      // Generate new schedule
      const instalments = this.generateSchedule({ ...loanData, loanId });
      
      // Save new instalments
      return await this.saveInstalments(instalments);
    } catch (error) {
      throw new Error(`Failed to regenerate schedule: ${error.message}`);
    }
  }

  /**
   * Calculate loan summary
   * @param {Object} loanData - Loan details
   * @returns {Object} Loan summary with totals
   */
  calculateLoanSummary(loanData) {
    const { loanAmount, interestRate, tenure } = loanData;
    const monthlyRate = interestRate / 100 / 12;
    const emi = this.calculateEMI(loanAmount, monthlyRate, tenure);
    
    const totalPayable = emi * tenure;
    const totalInterest = totalPayable - loanAmount;

    return {
      loanAmount,
      emi: Math.round(emi * 100) / 100,
      totalPayable: Math.round(totalPayable * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      tenure
    };
  }

  /**
   * Update instalment status and calculate penalties
   * @param {String} instalmentId - Instalment ID
   * @param {Object} paymentData - Payment details
   * @returns {Promise} Updated instalment
   */
  async updateInstalmentStatus(instalmentId, paymentData) {
    try {
      const instalment = await Instalment.findById(instalmentId);
      if (!instalment) {
        throw new Error('Instalment not found');
      }

      const { amountPaid, paymentDate, penaltyAmount = 0 } = paymentData;
      
      instalment.amountPaid = (instalment.amountPaid || 0) + amountPaid;
      instalment.penaltyAmount = penaltyAmount;
      instalment.lastPaymentDate = paymentDate;

      // Update status based on payment
      if (instalment.amountPaid >= instalment.totalDue + penaltyAmount) {
        instalment.status = 'PAID';
        instalment.paidDate = paymentDate;
      } else if (instalment.amountPaid > 0) {
        instalment.status = 'PARTIAL';
      }

      return await instalment.save();
    } catch (error) {
      throw new Error(`Failed to update instalment: ${error.message}`);
    }
  }

  /**
   * Calculate penalty for overdue instalments
   * @param {Object} instalment - Instalment object
   * @param {Number} penaltyRate - Penalty rate per month
   * @returns {Number} Penalty amount
   */
  calculatePenalty(instalment, penaltyRate) {
    const currentDate = new Date();
    const dueDate = new Date(instalment.dueDate);
    
    if (currentDate <= dueDate) {
      return 0;
    }

    const daysOverdue = Math.floor((currentDate - dueDate) / (1000 * 60 * 60 * 24));
    const monthsOverdue = Math.ceil(daysOverdue / 30);
    
    const outstandingAmount = instalment.totalDue - (instalment.amountPaid || 0);
    const penalty = outstandingAmount * (penaltyRate / 100) * monthsOverdue;
    
    return Math.round(penalty * 100) / 100;
  }

  /**
   * Update overdue status for instalments
   * @returns {Promise} Promise resolving to update result
   */
  async updateOverdueStatus() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueInstalments = await Instalment.updateMany(
        {
          dueDate: { $lt: today },
          status: { $in: ['PENDING', 'PARTIAL'] }
        },
        {
          $set: {
            status: 'OVERDUE'
          }
        }
      );

      console.log('🔄 Overdue status updated:', overdueInstalments.modifiedCount, 'instalments');
      return overdueInstalments;
    } catch (err) {
      console.error('❌ Error updating overdue status:', err);
      throw err;
    }
  }
}

module.exports = new ScheduleService();