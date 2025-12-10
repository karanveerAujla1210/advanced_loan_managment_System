const mongoose = require('mongoose');

const createSampleLoanData = () => {
  const sampleLoan = {
    _id: new mongoose.Types.ObjectId(),
    branch: new mongoose.Types.ObjectId(),
    borrower: new mongoose.Types.ObjectId(),
    product: new mongoose.Types.ObjectId(),
    applicationId: 'LOAN001',
    principal: 50000,
    processingFee: 2500,
    gstOnProcessingFee: 450,
    netDisbursed: 47050,
    interestType: 'reducing',
    interestRate: 24,
    interestTotal: 12000,
    totalPayable: 62000,
    termMonths: 12,
    termDays: 365,
    installments: 14,
    frequencyDays: 7,
    emi: 1192,
    startDate: new Date('2024-01-01'),
    status: 'active',
    charges: {
      bounce: 1500,
      fieldVisit: 800,
      legal: 5700,
      processing: 2500
    },
    legal: {
      caseId: 'LEGAL001',
      filingDate: new Date('2024-02-01'),
      oneTimeFee: 5500,
      weeklyChargeAmount: 200,
      totalWeeksCharged: 4,
      totalLegalCharges: 6300,
      status: 'in_court',
      nextHearingDate: new Date('2024-03-15')
    }
  };

  const sampleInstalments = [];
  for (let i = 1; i <= 14; i++) {
    const dueDate = new Date('2024-01-01');
    dueDate.setDate(dueDate.getDate() + (i * 7));
    
    sampleInstalments.push({
      _id: new mongoose.Types.ObjectId(),
      loan: sampleLoan._id,
      instalmentNumber: i,
      dueDate: dueDate,
      principalDue: 3500,
      interestDue: 692,
      totalDue: 1192,
      status: i <= 8 ? 'paid' : i <= 10 ? 'partial' : 'pending',
      paidAmount: i <= 8 ? 1192 : i <= 10 ? 600 : 0
    });
  }

  const samplePayments = [];
  for (let i = 1; i <= 10; i++) {
    samplePayments.push({
      _id: new mongoose.Types.ObjectId(),
      loan: sampleLoan._id,
      amount: i <= 8 ? 1192 : 600,
      principalPaid: i <= 8 ? 3500 : 300,
      interestPaid: i <= 8 ? 692 : 300,
      mode: 'Cash',
      createdAt: new Date()
    });
  }

  return { loan: sampleLoan, instalments: sampleInstalments, payments: samplePayments };
};

module.exports = { createSampleLoanData };