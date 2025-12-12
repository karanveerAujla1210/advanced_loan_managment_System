class LoanScheduleService {
  static generateEMISchedule(principal, annualRate, tenureMonths, startDate = new Date()) {
    const monthlyRate = annualRate / 100 / 12;
    const emi = this.calculateEMI(principal, monthlyRate, tenureMonths);
    
    const schedule = [];
    let outstandingPrincipal = principal;
    let currentDate = new Date(startDate);
    
    for (let i = 1; i <= tenureMonths; i++) {
      const interestAmount = outstandingPrincipal * monthlyRate;
      const principalAmount = emi - interestAmount;
      outstandingPrincipal -= principalAmount;
      
      // Ensure last instalment closes the loan completely
      if (i === tenureMonths) {
        outstandingPrincipal = 0;
      }
      
      schedule.push({
        instalmentNumber: i,
        dueDate: new Date(currentDate),
        principalAmount: Math.round(principalAmount * 100) / 100,
        interestAmount: Math.round(interestAmount * 100) / 100,
        totalAmount: Math.round(emi * 100) / 100,
        outstandingPrincipal: Math.round(outstandingPrincipal * 100) / 100
      });
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return schedule;
  }
  
  static calculateEMI(principal, monthlyRate, tenure) {
    if (monthlyRate === 0) return principal / tenure;
    
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
                (Math.pow(1 + monthlyRate, tenure) - 1);
    return Math.round(emi * 100) / 100;
  }
  
  static calculatePenalty(overdueAmount, daysOverdue, penaltyRate = 2) {
    // Penalty = (Overdue Amount * Penalty Rate * Days Overdue) / (100 * 30)
    const penalty = (overdueAmount * penaltyRate * daysOverdue) / (100 * 30);
    return Math.round(penalty * 100) / 100;
  }
  
  static updateOverdueStatus(instalments) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return instalments.map(instalment => {
      if (instalment.status === 'PENDING' && instalment.dueDate < today) {
        const daysOverdue = Math.floor((today - instalment.dueDate) / (1000 * 60 * 60 * 24));
        const overdueAmount = instalment.totalAmount - instalment.paidAmount;
        const penaltyAmount = this.calculatePenalty(overdueAmount, daysOverdue);
        
        return {
          ...instalment,
          status: 'OVERDUE',
          daysOverdue,
          penaltyAmount
        };
      }
      return instalment;
    });
  }
  
  static allocatePayment(payment, instalments) {
    let remainingAmount = payment.amount;
    const allocation = [];
    
    // Sort instalments by due date (oldest first)
    const sortedInstalments = instalments
      .filter(inst => inst.status !== 'COMPLETED')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    for (const instalment of sortedInstalments) {
      if (remainingAmount <= 0) break;
      
      const outstandingAmount = instalment.totalAmount + instalment.penaltyAmount - 
                               instalment.paidAmount - instalment.paidPenalty;
      
      if (outstandingAmount <= 0) continue;
      
      const allocatedAmount = Math.min(remainingAmount, outstandingAmount);
      let allocatedPenalty = 0;
      let allocatedInterest = 0;
      let allocatedPrincipal = 0;
      
      // Allocation priority: Penalty -> Interest -> Principal
      if (instalment.penaltyAmount > instalment.paidPenalty) {
        const pendingPenalty = instalment.penaltyAmount - instalment.paidPenalty;
        allocatedPenalty = Math.min(allocatedAmount, pendingPenalty);
      }
      
      let remainingForInterest = allocatedAmount - allocatedPenalty;
      if (remainingForInterest > 0 && instalment.interestAmount > instalment.paidInterest) {
        const pendingInterest = instalment.interestAmount - instalment.paidInterest;
        allocatedInterest = Math.min(remainingForInterest, pendingInterest);
      }
      
      let remainingForPrincipal = remainingForInterest - allocatedInterest;
      if (remainingForPrincipal > 0 && instalment.principalAmount > instalment.paidPrincipal) {
        const pendingPrincipal = instalment.principalAmount - instalment.paidPrincipal;
        allocatedPrincipal = Math.min(remainingForPrincipal, pendingPrincipal);
      }
      
      allocation.push({
        instalment: instalment._id,
        principalAmount: allocatedPrincipal,
        interestAmount: allocatedInterest,
        penaltyAmount: allocatedPenalty,
        totalAllocated: allocatedAmount
      });
      
      remainingAmount -= allocatedAmount;
    }
    
    return { allocation, unallocatedAmount: remainingAmount };
  }
}

module.exports = LoanScheduleService;