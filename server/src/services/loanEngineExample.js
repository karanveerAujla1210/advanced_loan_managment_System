// server/src/services/loanEngineExample.js
// Example usage of the NBFC Loan Engine

const LoanEngine = require('./loanEngine');
const { LOAN_PRODUCTS, DEFAULT_ENGINE_CONFIG } = require('./loanProducts');

// Example 1: 100-Day Flat Interest Loan (₹10,000)
function example100DayFlat() {
  console.log("=== 100-Day Flat Interest Loan Example ===");
  
  const product = LOAN_PRODUCTS.STANDARD_100_FLAT;
  const engine = new LoanEngine(product, DEFAULT_ENGINE_CONFIG);
  
  const principal = 10000;
  const startDate = "2025-01-01";
  
  // Calculate upfront charges
  const upfront = engine.computeUpfrontCharges(principal);
  console.log("Upfront Charges:", upfront);
  
  // Generate schedule
  const schedule = engine.generateSchedule(principal, startDate);
  console.log("Schedule Summary:", {
    method: schedule.method,
    principal: schedule.principal,
    interestTotal: schedule.interestTotal,
    totalPayable: schedule.totalPayable,
    emi: schedule.emi
  });
  
  // Show first 3 installments
  console.log("First 3 Installments:");
  schedule.schedule.slice(0, 3).forEach(inst => {
    console.log(`EMI ${inst.installmentNo}: Principal=₹${inst.principalComponent}, Interest=₹${inst.interestComponent}, Outstanding=₹${inst.outstandingPrincipal}`);
  });
  
  return { upfront, schedule };
}

// Example 2: 100-Day Reducing Balance Loan (₹25,000)
function example100DayReducing() {
  console.log("\n=== 100-Day Reducing Balance Loan Example ===");
  
  const product = LOAN_PRODUCTS.STANDARD_100_REDUCING;
  const engine = new LoanEngine(product, DEFAULT_ENGINE_CONFIG);
  
  const principal = 25000;
  const startDate = "2025-01-01";
  
  const upfront = engine.computeUpfrontCharges(principal);
  const schedule = engine.generateSchedule(principal, startDate);
  
  console.log("Upfront Charges:", upfront);
  console.log("Schedule Summary:", {
    method: schedule.method,
    principal: schedule.principal,
    interestTotal: schedule.interestTotal,
    totalPayable: schedule.totalPayable,
    emi: schedule.emi
  });
  
  // Show first 3 installments
  console.log("First 3 Installments:");
  schedule.schedule.slice(0, 3).forEach(inst => {
    console.log(`EMI ${inst.installmentNo}: Principal=₹${inst.principalComponent}, Interest=₹${inst.interestComponent}, Outstanding=₹${inst.outstandingPrincipal}`);
  });
  
  return { upfront, schedule };
}

// Example 3: Penalty Calculation
function examplePenaltyCalculation() {
  console.log("\n=== Penalty Calculation Example ===");
  
  const product = LOAN_PRODUCTS.STANDARD_100_FLAT;
  const engine = new LoanEngine(product, DEFAULT_ENGINE_CONFIG);
  
  // EMI of ₹857 overdue by 15 days
  const outstandingAmount = 857;
  const overdueDays = 15;
  const penalty = engine.computePenalty(outstandingAmount, overdueDays);
  
  console.log(`Outstanding: ₹${outstandingAmount}`);
  console.log(`Overdue Days: ${overdueDays}`);
  console.log(`Daily Penalty Rate: ${(engine.dailyPenaltyRate * 100).toFixed(4)}%`);
  console.log(`Penalty Amount: ₹${penalty}`);
  
  return penalty;
}

// Example 4: Payment Application
function examplePaymentApplication() {
  console.log("\n=== Payment Application Example ===");
  
  const product = LOAN_PRODUCTS.STANDARD_100_FLAT;
  const engine = new LoanEngine(product, DEFAULT_ENGINE_CONFIG);
  
  // Create a loan with schedule
  const principal = 10000;
  const schedule = engine.generateSchedule(principal, "2025-01-01");
  
  // Simulate overdue penalty on first installment
  schedule.schedule[0].penaltyComponent = 50; // ₹50 penalty
  schedule.schedule[0].status = "overdue";
  
  // Apply payment of ₹900
  const payment = {
    amount: 900,
    paidAt: "2025-01-15",
    mode: "cash"
  };
  
  console.log("Before Payment:");
  console.log(`EMI 1: Principal=₹${schedule.schedule[0].principalComponent}, Interest=₹${schedule.schedule[0].interestComponent}, Penalty=₹${schedule.schedule[0].penaltyComponent}`);
  
  const result = engine.applyPayment(schedule, payment);
  
  console.log("After Payment:");
  console.log(`EMI 1: Principal=₹${result.loan.schedule[0].principalComponent}, Interest=₹${result.loan.schedule[0].interestComponent}, Penalty=₹${result.loan.schedule[0].penaltyComponent}`);
  console.log(`Status: ${result.loan.schedule[0].status}`);
  console.log(`Prepayment: ₹${result.prepayment}`);
  
  return result;
}

// Example 5: Legal Charges Application
function exampleLegalCharges() {
  console.log("\n=== Legal Charges Example ===");
  
  const product = LOAN_PRODUCTS.STANDARD_100_FLAT;
  const engine = new LoanEngine(product, DEFAULT_ENGINE_CONFIG);
  
  // Create a loan
  const loan = {
    principal: 15000,
    schedule: [],
    legal: null
  };
  
  // Apply legal charges (3 weeks in legal)
  const legalCharges = engine.applyLegalCharges(loan, "2025-02-01", 3);
  
  console.log("Legal Charges Applied:");
  console.log(`One-time Legal Fee: ₹${legalCharges.oneTimeCharge}`);
  console.log(`Weekly Charges (3 weeks): ₹${legalCharges.weeklyCharges}`);
  console.log(`Total Legal Charges: ₹${legalCharges.totalLegalCharges}`);
  
  return legalCharges;
}

// Example 6: Top-up Loan
function exampleTopUp() {
  console.log("\n=== Top-up Loan Example ===");
  
  const product = LOAN_PRODUCTS.STANDARD_100_FLAT;
  const engine = new LoanEngine(product, DEFAULT_ENGINE_CONFIG);
  
  // Original loan
  const principal = 10000;
  const schedule = engine.generateSchedule(principal, "2025-01-01");
  
  // Simulate 5 EMIs paid
  for (let i = 0; i < 5; i++) {
    schedule.schedule[i].status = "paid";
    schedule.schedule[i].principalComponent = 0;
    schedule.schedule[i].interestComponent = 0;
  }
  
  // Top-up with ₹5,000
  const topUpAmount = 5000;
  const topUpDate = "2025-02-05";
  
  const result = engine.topUpLoan(schedule, topUpAmount, topUpDate);
  
  console.log("Top-up Details:");
  console.log(`Top-up Amount: ₹${result.topUpDetails.amount}`);
  console.log(`Previous Outstanding: ₹${result.topUpDetails.previousOutstanding}`);
  console.log(`New Principal: ₹${result.topUpDetails.newPrincipal}`);
  console.log(`Remaining Installments: ${result.loan.schedule.filter(s => s.status !== "paid").length}`);
  
  return result;
}

// Run all examples
function runAllExamples() {
  console.log("🚀 NBFC Loan Engine Examples\n");
  
  example100DayFlat();
  example100DayReducing();
  examplePenaltyCalculation();
  examplePaymentApplication();
  exampleLegalCharges();
  exampleTopUp();
  
  console.log("\n✅ All examples completed!");
}

// Export for testing
module.exports = {
  example100DayFlat,
  example100DayReducing,
  examplePenaltyCalculation,
  examplePaymentApplication,
  exampleLegalCharges,
  exampleTopUp,
  runAllExamples
};

// Run examples if called directly
if (require.main === module) {
  runAllExamples();
}