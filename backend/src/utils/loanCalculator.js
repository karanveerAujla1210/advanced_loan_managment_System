export const calculateInstallments = (principal, annualRate, months, startDate) => {
  const monthlyRate = annualRate / 100 / 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  
  const installments = [];
  let balance = principal;
  
  for (let i = 1; i <= months; i++) {
    const interest = balance * monthlyRate;
    const principalPart = emi - interest;
    balance -= principalPart;
    
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    installments.push({
      number: i,
      dueDate: dueDate.toISOString().split('T')[0],
      principal: Math.round(principalPart * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      emi: Math.round(emi * 100) / 100
    });
  }
  
  return installments;
};
