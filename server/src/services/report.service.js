const Borrower = require("../models/Borrower");
const Loan = require("../models/Loan");
const Instalment = require("../models/Instalment");
const Payment = require("../models/Payment");
const LegalCase = require("../models/LegalCase");

module.exports = {
  async portfolioSummary({ branch, from, to }) {
    const match = {};
    if (branch) match.branch = branch;
    
    const loans = await Loan.aggregate([
      { $match: match },
      { $group: {
          _id: null,
          totalLoans: { $sum: 1 },
          outstandingPrincipal: { $sum: "$outstandingPrincipal" },
          outstandingInterest: { $sum: "$outstandingInterest" },
          disbursedAmount: { $sum: "$disbursedAmount" }
      }}
    ]);
    
    const result = loans[0] || { 
      totalLoans: 0, 
      outstandingPrincipal: 0, 
      outstandingInterest: 0,
      disbursedAmount: 0 
    };
    
    const parBuckets = await Instalment.aggregate([
      { $match: { ...(branch ? { branch } : {}), status: "overdue" } },
      { $group: { _id: "$loan", count: { $sum: 1 } } }
    ]);
    
    return {
      totalLoans: result.totalLoans,
      disbursedAmount: result.disbursedAmount,
      outstanding: result.outstandingPrincipal + result.outstandingInterest,
      parCounts: parBuckets.length
    };
  },

  async collectionReport({ branch, from, to, agent }) {
    const match = {};
    if (branch) match.branch = branch;
    if (agent) match.collectedBy = agent;
    if (from || to) match.collectedAt = {};
    if (from) match.collectedAt.$gte = new Date(from);
    if (to) match.collectedAt.$lte = new Date(to);

    const payments = await Payment.aggregate([
      { $match: match },
      { $group: { 
        _id: "$collectedBy", 
        total: { $sum: "$amount" }, 
        count: { $sum: 1 } 
      }}
    ]);
    
    return payments;
  },

  async agingReport({ branch, bucket }) {
    const match = { status: "overdue", ...(branch ? { branch } : {}) };
    const instalments = await Instalment.find(match).lean().limit(5000);
    
    const now = Date.now();
    const rows = instalments.map(i => {
      const dpd = Math.floor((now - new Date(i.dueDate)) / (1000*60*60*24));
      return { ...i, dpd };
    });
    
    return rows.filter(r => {
      if (!bucket) return true;
      if (bucket === "1-7") return r.dpd >= 1 && r.dpd <= 7;
      if (bucket === "8-30") return r.dpd >= 8 && r.dpd <= 30;
      if (bucket === "31-60") return r.dpd >= 31 && r.dpd <= 60;
      if (bucket === "60+") return r.dpd >= 60;
      return true;
    });
  },

  async disbursementReport({ branch, from, to }) {
    const match = { status: "disbursed", ...(branch ? { branch } : {}) };
    if (from || to) match.startDate = {};
    if (from) match.startDate.$gte = new Date(from);
    if (to) match.startDate.$lte = new Date(to);
    
    const rows = await Loan.find(match).lean().limit(5000);
    return rows;
  },

  async branchPerformance({ branch, from, to }) {
    const loanMatch = { ...(branch ? { branch } : {}) };
    const paymentMatch = { ...(branch ? { branch } : {}) };
    
    if (from || to) {
      loanMatch.startDate = {};
      paymentMatch.collectedAt = {};
      if (from) {
        loanMatch.startDate.$gte = new Date(from);
        paymentMatch.collectedAt.$gte = new Date(from);
      }
      if (to) {
        loanMatch.startDate.$lte = new Date(to);
        paymentMatch.collectedAt.$lte = new Date(to);
      }
    }
    
    const loans = await Loan.find(loanMatch).lean();
    const payments = await Payment.find(paymentMatch).lean();
    
    return { 
      loansCount: loans.length, 
      paymentsCount: payments.length,
      totalDisbursed: loans.reduce((sum, l) => sum + (l.disbursedAmount || 0), 0),
      totalCollected: payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    };
  },

  async agentPerformance({ branch, from, to }) {
    const match = {};
    if (branch) match.branch = branch;
    if (from || to) match.collectedAt = {};
    if (from) match.collectedAt.$gte = new Date(from);
    if (to) match.collectedAt.$lte = new Date(to);
    
    const rows = await Payment.aggregate([
      { $match: match },
      { $group: { 
        _id: "$collectedBy", 
        total: { $sum: "$amount" }, 
        count: { $sum: 1 } 
      }}
    ]);
    
    return rows;
  },

  async legalReport({ branch, from, to }) {
    const match = {};
    if (branch) match.branch = branch;
    if (from || to) match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
    
    return await LegalCase.find(match).lean().limit(5000);
  },

  async exportBorrowers({ branch }) {
    return await Borrower.find({ ...(branch ? { branch } : {}) }).lean().limit(50000);
  },

  async exportLoans({ branch }) {
    return await Loan.find({ ...(branch ? { branch } : {}) }).lean().limit(50000);
  },

  async exportInstalments({ branch }) {
    return await Instalment.find({ ...(branch ? { branch } : {}) }).lean().limit(50000);
  },

  async exportPayments({ branch }) {
    return await Payment.find({ ...(branch ? { branch } : {}) }).lean().limit(50000);
  },

  async exportGeneric(type, opts = {}) {
    switch(type) {
      case "borrowers": return this.exportBorrowers(opts);
      case "loans": return this.exportLoans(opts);
      case "instalments": return this.exportInstalments(opts);
      case "payments": return this.exportPayments(opts);
      case "portfolio": return this.portfolioExport(opts);
      case "collections": return this.collectionExport(opts);
      default: return [];
    }
  },

  async portfolioExport(opts) {
    return await Loan.find({ ...(opts.branch ? { branch: opts.branch } : {}) }).lean().limit(50000);
  },

  async collectionExport(opts) {
    return await Payment.find({ ...(opts.branch ? { branch: opts.branch } : {}) }).lean().limit(50000);
  }
};