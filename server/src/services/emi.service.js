// EMI Calculation Service
class EMIService {
  // Calculate EMI using reducing balance method
  static calculateEMI(principal, annualRate, tenureMonths) {
    const monthlyRate = annualRate / (12 * 100);
    if (monthlyRate === 0) return principal / tenureMonths;
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    return Math.round(emi);
  }

  // Generate EMI schedule
  static generateSchedule(principal, annualRate, tenureMonths, startDate) {
    const emi = this.calculateEMI(principal, annualRate, tenureMonths);
    const monthlyRate = annualRate / (12 * 100);
    const schedule = [];
    let balance = principal;
    
    for (let i = 1; i <= tenureMonths; i++) {
      const interestAmount = Math.round(balance * monthlyRate);
      const principalAmount = emi - interestAmount;
      balance = Math.max(0, balance - principalAmount);
      
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      schedule.push({
        installmentNumber: i,
        dueDate,
        emiAmount: emi,
        principalAmount,
        interestAmount,
        balanceAmount: balance,
        status: 'PENDING'
      });
    }
    
    return schedule;
  }

  // Calculate overdue amount and penalty
  static calculateOverdue(installments, currentDate) {
    let overdueAmount = 0;
    let dpd = 0;
    
    const overdue = installments.filter(inst => 
      inst.status === 'PENDING' && new Date(inst.dueDate) < currentDate
    );
    
    if (overdue.length > 0) {
      overdueAmount = overdue.reduce((sum, inst) => sum + inst.emiAmount, 0);
      const oldestDue = new Date(Math.min(...overdue.map(inst => new Date(inst.dueDate))));
      dpd = Math.floor((currentDate - oldestDue) / (1000 * 60 * 60 * 24));
    }
    
    return { overdueAmount, dpd };
  }

  // Apply payment to installments
  static applyPayment(installments, paymentAmount) {
    let remainingAmount = paymentAmount;
    const updatedInstallments = [...installments];
    
    // Sort by due date to pay oldest first
    const pendingInstallments = updatedInstallments
      .filter(inst => inst.status === 'PENDING')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    for (const installment of pendingInstallments) {
      if (remainingAmount <= 0) break;
      
      if (remainingAmount >= installment.emiAmount) {
        installment.status = 'PAID';
        installment.paidAmount = installment.emiAmount;
        installment.paidDate = new Date();
        remainingAmount -= installment.emiAmount;
      } else {
        installment.partialAmount = (installment.partialAmount || 0) + remainingAmount;
        if (installment.partialAmount >= installment.emiAmount) {
          installment.status = 'PAID';
          installment.paidAmount = installment.emiAmount;
          installment.paidDate = new Date();
          remainingAmount = installment.partialAmount - installment.emiAmount;
          installment.partialAmount = 0;
        } else {
          remainingAmount = 0;
        }
      }
    }
    
    return { updatedInstallments, excessAmount: remainingAmount };
  }

  // Calculate loan closure amount
  static calculateClosureAmount(installments, closureDate) {
    const pendingInstallments = installments.filter(inst => inst.status === 'PENDING');
    const totalPrincipal = pendingInstallments.reduce((sum, inst) => sum + inst.principalAmount, 0);
    
    // Simple closure - just remaining principal (can be enhanced with prepayment charges)
    return {
      principalAmount: totalPrincipal,
      interestAmount: 0,
      prepaymentCharges: 0,
      totalAmount: totalPrincipal
    };
  }
}

module.exports = EMIService;