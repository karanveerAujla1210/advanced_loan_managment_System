import { addMonths, format } from 'date-fns';

export const calculateInstallments = (principal, annualRate, months, startDate) => {
  const monthlyRate = annualRate / 100 / 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  
  const installments = [];
  let balance = principal;
  
  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principalPart = emi - interest;
    balance -= principalPart;
    
    installments.push({
      number: i,
      dueDate: format(addMonths(new Date(startDate), i), 'yyyy-MM-dd'),
      principal: Math.round(principalPart * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      emi: Math.round(emi * 100) / 100
    });
  }
  
  return installments;
};

export const calculateLoanSummary = (installments) => {
  return installments.reduce((acc, inst) => ({
    totalPrincipal: acc.totalPrincipal + inst.principal_due,
    totalInterest: acc.totalInterest + inst.interest_due,
    totalPaid: acc.totalPaid + inst.principal_paid + inst.interest_paid,
    totalDue: acc.totalDue + inst.principal_due + inst.interest_due - inst.principal_paid - inst.interest_paid
  }), { totalPrincipal: 0, totalInterest: 0, totalPaid: 0, totalDue: 0 });
};
