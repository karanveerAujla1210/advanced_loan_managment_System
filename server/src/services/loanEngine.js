class LoanEngine {
  constructor(product) {
    this.product = product;
  }

  computePenaltyAmount(emiAmount, overdueDays) {
    if (overdueDays <= 0) return 0;
    
    const penaltyRate = this.product.penaltyRate || 0.02; // 2% per day default
    return Math.round(emiAmount * penaltyRate * overdueDays);
  }

  calculateClosingAmount(loan, instalments, payments) {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPayable = loan.totalPayable;
    const pendingInstalments = instalments.filter(i => i.status !== 'paid');
    
    const remainingPrincipal = pendingInstalments.reduce((sum, i) => sum + i.principalDue, 0);
    const remainingInterest = pendingInstalments.reduce((sum, i) => sum + i.interestDue, 0);
    const totalPenalty = pendingInstalments.reduce((sum, i) => {
      const overdueDays = i.status !== 'paid' && new Date() > i.dueDate 
        ? Math.floor((new Date() - i.dueDate) / (1000 * 60 * 60 * 24)) : 0;
      return sum + this.computePenaltyAmount(i.principalDue + i.interestDue, overdueDays);
    }, 0);

    return {
      remainingPrincipal,
      remainingInterest,
      totalPenalty,
      bounceCharges: loan.charges?.bounce || 0,
      legalCharges: loan.charges?.legal || 0,
      fieldVisitCharges: loan.charges?.fieldVisit || 0,
      totalClosingAmount: remainingPrincipal + remainingInterest + totalPenalty + 
        (loan.charges?.bounce || 0) + (loan.charges?.legal || 0) + (loan.charges?.fieldVisit || 0)
    };
  }

  calculateDPD(dueDate) {
    const now = new Date();
    if (now <= dueDate) return 0;
    return Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
  }

  getPARBucket(dpd) {
    if (dpd <= 7) return '1-7';
    if (dpd <= 30) return '8-30';
    if (dpd <= 60) return '31-60';
    return '60+';
  }
}

module.exports = LoanEngine;