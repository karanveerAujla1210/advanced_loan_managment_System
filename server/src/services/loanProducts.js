// server/src/services/loanProducts.js
// Predefined NBFC loan products (30, 50, 100 days)

const LOAN_PRODUCTS = {
  // 30-Day Quick Loan
  QUICK_30: {
    key: "QUICK_30",
    name: "30 Day Quick Loan",
    termDays: 30,
    installments: 4,
    frequencyDays: 7, // Weekly
    pfRate: 0.10,     // 10% processing fee
    gstOnPfRate: 0.18, // 18% GST on PF
    interestType: "flat",
    interestRate: 0.12, // 12% for 30 days
    minAmount: 5000,
    maxAmount: 50000,
    description: "Quick 30-day loan with 4 weekly installments"
  },

  // 50-Day Flex Loan
  FLEX_50: {
    key: "FLEX_50",
    name: "50 Day Flex Loan",
    termDays: 50,
    installments: 7,
    frequencyDays: 7, // Weekly
    pfRate: 0.10,
    gstOnPfRate: 0.18,
    interestType: "flat",
    interestRate: 0.15, // 15% for 50 days
    minAmount: 10000,
    maxAmount: 100000,
    description: "Flexible 50-day loan with 7 weekly installments"
  },

  // 100-Day Standard Loan (Flat)
  STANDARD_100_FLAT: {
    key: "STANDARD_100_FLAT",
    name: "100 Day Standard (Flat)",
    termDays: 100,
    installments: 14,
    frequencyDays: 7, // Weekly
    pfRate: 0.10,
    gstOnPfRate: 0.18,
    interestType: "flat",
    interestRate: 0.20, // 20% for 100 days
    minAmount: 15000,
    maxAmount: 200000,
    description: "Standard 100-day loan with flat interest"
  },

  // 100-Day Reducing Balance Loan
  STANDARD_100_REDUCING: {
    key: "STANDARD_100_REDUCING",
    name: "100 Day Reducing Balance",
    termDays: 100,
    installments: 14,
    frequencyDays: 7,
    pfRate: 0.10,
    gstOnPfRate: 0.18,
    interestType: "reducing",
    interestRate: 0.20, // 20% for 100 days
    minAmount: 15000,
    maxAmount: 200000,
    description: "100-day loan with reducing balance interest"
  },

  // 100-Day APR-Based Loan
  PREMIUM_100_APR: {
    key: "PREMIUM_100_APR",
    name: "100 Day Premium (APR)",
    termDays: 100,
    installments: 14,
    frequencyDays: 7,
    pfRate: 0.08, // Lower PF for premium
    gstOnPfRate: 0.18,
    interestType: "dailyAPR",
    interestRate: 0.75, // 75% APR
    apr: 0.75,
    minAmount: 25000,
    maxAmount: 500000,
    description: "Premium loan with daily APR calculation"
  }
};

// Default engine configuration
const DEFAULT_ENGINE_CONFIG = {
  penaltyMonthlyRate: 0.02,    // 2% per month
  bounceCharge: 250,           // ₹250 per bounce
  fieldVisitCharge: 300,       // ₹300 per field visit
  legalOneTime: 5500,          // ₹5,500 per legal case
  legalWeeklyCharge: 200       // ₹200 per week in legal
};

// Helper functions
function getProductByKey(productKey) {
  return LOAN_PRODUCTS[productKey];
}

function getAllProducts() {
  return Object.values(LOAN_PRODUCTS);
}

function getProductsByTerm(termDays) {
  return Object.values(LOAN_PRODUCTS).filter(product => product.termDays === termDays);
}

function validateLoanAmount(productKey, amount) {
  const product = getProductByKey(productKey);
  if (!product) return { valid: false, error: "Product not found" };
  
  if (amount < product.minAmount) {
    return { valid: false, error: `Minimum amount is ₹${product.minAmount}` };
  }
  
  if (amount > product.maxAmount) {
    return { valid: false, error: `Maximum amount is ₹${product.maxAmount}` };
  }
  
  return { valid: true };
}

module.exports = {
  LOAN_PRODUCTS,
  DEFAULT_ENGINE_CONFIG,
  getProductByKey,
  getAllProducts,
  getProductsByTerm,
  validateLoanAmount
};