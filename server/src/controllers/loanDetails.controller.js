const Loan = require("../models/Loan");
const Instalment = require("../models/Instalment");
const Payment = require("../models/Payment");
const LoanEngine = require("../services/loanEngine");

module.exports.getLoanDetails = async (req, res) => {
  try {
    const { loanId } = req.params;

    const loan = await Loan.findById(loanId)
      .populate("borrower")
      .populate("product")
      .populate("branch")
      .populate("advisor", "name email")
      .lean();

    if (!loan) return res.status(404).json({ error: "Loan not found" });

    // Fetch instalments and payments
    const instalments = await Instalment.find({ loan: loanId }).sort({ instalmentNumber: 1 }).lean();
    const payments = await Payment.find({ loan: loanId }).sort({ createdAt: -1 }).lean();

    const engine = new LoanEngine(loan.product);
    const now = new Date();

    // Enhanced schedule with real-time calculations
    const schedule = instalments.map(inst => {
      const overdueDays = inst.status !== "paid" && now > inst.dueDate
        ? engine.calculateDPD(inst.dueDate) : 0;
      
      const penalty = engine.computePenaltyAmount(
        inst.principalDue + inst.interestDue,
        overdueDays
      );

      return {
        ...inst,
        overdueDays,
        penalty,
        parBucket: engine.getPARBucket(overdueDays),
        totalDueWithPenalty: inst.totalDue + penalty
      };
    });

    // Calculate comprehensive totals
    const totals = {
      totalPaid: payments.reduce((s, p) => s + p.amount, 0),
      totalPrincipalPaid: payments.reduce((s, p) => s + (p.principalPaid || 0), 0),
      totalInterestPaid: payments.reduce((s, p) => s + (p.interestPaid || 0), 0),
      totalPenaltyPaid: payments.reduce((s, p) => s + (p.penaltyPaid || 0), 0),
      totalPenalty: schedule.reduce((s, i) => s + i.penalty, 0),
      totalOutstanding: schedule
        .filter(i => i.status !== "paid")
        .reduce((s, i) => s + i.totalDueWithPenalty, 0),
      overdueAmount: schedule
        .filter(i => i.status !== "paid" && i.overdueDays > 0)
        .reduce((s, i) => s + i.totalDueWithPenalty, 0)
    };

    // Next due and overdue analysis
    const nextDue = schedule.find(i => i.status === "pending" || i.status === "partial");
    const overdueInstalments = schedule.filter(i => i.overdueDays > 0 && i.status !== "paid");
    
    // Charges breakdown
    const charges = {
      bounce: loan.charges?.bounce || 0,
      fieldVisit: loan.charges?.fieldVisit || 0,
      legal: loan.charges?.legal || 0,
      processing: loan.charges?.processing || 0,
      total: (loan.charges?.bounce || 0) + (loan.charges?.fieldVisit || 0) + 
             (loan.charges?.legal || 0) + (loan.charges?.processing || 0)
    };

    // Legal tracking
    const legal = loan.legal ? {
      ...loan.legal,
      weeklyCharges: loan.legal.weeklyChargeAmount || 200,
      totalWeeks: loan.legal.filingDate ? 
        Math.floor((now - new Date(loan.legal.filingDate)) / (7 * 24 * 60 * 60 * 1000)) : 0
    } : null;

    // Closing amount calculation
    const closingDetails = engine.calculateClosingAmount(loan, instalments, payments);

    // KPIs
    const kpis = {
      loanAge: Math.floor((now - new Date(loan.disbursementDate)) / (1000 * 60 * 60 * 24)),
      completionPercentage: Math.round((totals.totalPaid / loan.totalPayable) * 100),
      remainingInstalments: schedule.filter(i => i.status !== "paid").length,
      maxDPD: Math.max(...schedule.map(i => i.overdueDays)),
      currentPARBucket: overdueInstalments.length > 0 ? 
        engine.getPARBucket(Math.max(...overdueInstalments.map(i => i.overdueDays))) : 'Current'
    };

    const response = {
      loan,
      schedule,
      payments,
      legal,
      charges,
      totals,
      nextDue,
      overdueInstalments,
      closingDetails,
      kpis
    };

    return res.json(response);

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports.getClosingSummary = async (req, res) => {
  try {
    const { loanId } = req.params;
    
    const loan = await Loan.findById(loanId).populate("product").lean();
    if (!loan) return res.status(404).json({ error: "Loan not found" });

    const instalments = await Instalment.find({ loan: loanId }).lean();
    const payments = await Payment.find({ loan: loanId }).lean();

    const engine = new LoanEngine(loan.product);
    const closingDetails = engine.calculateClosingAmount(loan, instalments, payments);

    return res.json(closingDetails);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Something went wrong" });
  }
};