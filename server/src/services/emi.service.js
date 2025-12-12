class EMICalculatorService {
  /**
   * Calculate EMI using reducing balance method
   * @param {number} principal - Loan amount
   * @param {number} annualRate - Annual interest rate (%)
   * @param {number} tenureMonths - Loan tenure in months
   * @returns {number} EMI amount
   */
  calculateEMI(principal, annualRate, tenureMonths) {
    const monthlyRate = annualRate / (12 * 100);
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    return Math.round(emi * 100) / 100;
  }

  /**
   * Generate complete repayment schedule
   * @param {Object} loanDetails - Loan parameters
   * @returns {Array} Repayment schedule
   */
  generateSchedule(loanDetails) {
    const { 
      principal, 
      interestRate, 
      termMonths, 
      startDate, 
      frequency = 'monthly',
      interestType = 'reducing'
    } = loanDetails;

    const schedule = [];
    let balance = principal;
    const emi = this.calculateEMI(principal, interestRate, termMonths);
    
    for (let i = 1; i <= termMonths; i++) {
      const dueDate = this.calculateDueDate(startDate, i, frequency);
      const interestAmount = Math.round((balance * interestRate / (12 * 100)) * 100) / 100;
      const principalAmount = Math.round((emi - interestAmount) * 100) / 100;
      
      balance = Math.max(0, Math.round((balance - principalAmount) * 100) / 100);

      schedule.push({
        installmentNo: i,
        dueDate,
        emi,
        principalAmount,
        interestAmount,
        outstandingBalance: balance,
        status: 'pending'
      });
    }

    return schedule;
  }

  /**
   * Calculate due date based on frequency
   * @param {Date} startDate - Loan start date
   * @param {number} installmentNo - Installment number
   * @param {string} frequency - Payment frequency
   * @returns {Date} Due date
   */
  calculateDueDate(startDate, installmentNo, frequency) {
    const date = new Date(startDate);
    
    switch (frequency) {
      case 'weekly':
        date.setDate(date.getDate() + (installmentNo * 7));
        break;
      case 'daily':
        date.setDate(date.getDate() + installmentNo);
        break;
      case 'monthly':
      default:
        date.setMonth(date.getMonth() + installmentNo);
        break;
    }
    
    return date;
  }

  /**
   * Calculate overdue amount and penalties
   * @param {Object} installment - Installment details
   * @param {number} penaltyRate - Daily penalty rate (%)
   * @returns {Object} Overdue calculation
   */
  calculateOverdue(installment, penaltyRate = 0.1) {
    const today = new Date();
    const dueDate = new Date(installment.dueDate);
    
    if (today <= dueDate || installment.status === 'paid') {
      return { overdueDays: 0, penaltyAmount: 0, totalDue: installment.emi };
    }

    const overdueDays = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
    const penaltyAmount = Math.round((installment.emi * penaltyRate * overdueDays / 100) * 100) / 100;
    const totalDue = installment.emi + penaltyAmount;

    return { overdueDays, penaltyAmount, totalDue };
  }

  /**
   * Calculate loan summary
   * @param {Object} loanDetails - Loan parameters
   * @returns {Object} Loan summary
   */
  calculateLoanSummary(loanDetails) {
    const { principal, interestRate, termMonths } = loanDetails;
    const emi = this.calculateEMI(principal, interestRate, termMonths);
    const totalPayable = Math.round((emi * termMonths) * 100) / 100;
    const totalInterest = Math.round((totalPayable - principal) * 100) / 100;

    return {
      principal,
      emi,
      totalPayable,
      totalInterest,
      termMonths,
      interestRate
    };
  }
}

module.exports = new EMICalculatorService();