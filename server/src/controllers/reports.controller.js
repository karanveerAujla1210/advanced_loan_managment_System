const xlsx = require("xlsx");
const Loan = require("../models/Loan");
const Borrower = require("../models/Borrower");
const Payment = require("../models/Payment");
const LegalCase = require("../models/LegalCase");
const User = require("../models/User");
const Branch = require("../models/Branch");

// Helper function to export CSV
const exportCSV = (rows, filename, res) => {
  if (!rows.length) {
    return res.status(404).json({ message: "No data found" });
  }
  
  const header = Object.keys(rows[0]).join(",");
  const csv = rows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
  
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}.csv`);
  res.send(header + "\n" + csv);
};

// Helper function to export Excel
const exportExcel = (rows, filename, sheetName, res) => {
  if (!rows.length) {
    return res.status(404).json({ message: "No data found" });
  }
  
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(rows);
  xlsx.utils.book_append_sheet(wb, ws, sheetName);
  const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}.xlsx`);
  res.send(buffer);
};

// Portfolio Report
exports.portfolioReport = async (req, res) => {
  try {
    const { branch, product, format } = req.query;
    
    const filter = {};
    if (branch) filter.branch = branch;
    if (product) filter.loanProduct = product;

    const loans = await Loan.find(filter)
      .populate("borrower", "name phone")
      .populate("loanProduct", "name")
      .populate("branch", "name");

    const totalLoans = loans.length;
    const totalPrincipal = loans.reduce((sum, l) => sum + l.principal, 0);
    const totalOutstanding = loans.reduce((sum, l) => sum + l.outstanding, 0);
    const activeLoans = loans.filter(l => l.status === "ACTIVE").length;
    const closedLoans = loans.filter(l => l.status === "CLOSED").length;

    const rows = loans.map(l => ({
      loanId: l.loanId,
      borrower: l.borrower?.name || "N/A",
      phone: l.borrower?.phone || "N/A",
      branch: l.branch?.name || "N/A",
      product: l.loanProduct?.name || "N/A",
      principal: l.principal,
      outstanding: l.outstanding,
      status: l.status,
      disbursementDate: l.disbursementDate?.toISOString().split('T')[0] || "N/A"
    }));

    if (format === "excel") {
      return exportExcel(rows, "portfolio-report", "Portfolio", res);
    }
    if (format === "csv") {
      return exportCSV(rows, "portfolio-report", res);
    }

    res.json({
      summary: { totalLoans, totalPrincipal, totalOutstanding, activeLoans, closedLoans },
      data: rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Aging Summary Report
exports.agingReport = async (req, res) => {
  try {
    const { branch, format } = req.query;
    
    const filter = { status: "ACTIVE" };
    if (branch) filter.branch = branch;

    const loans = await Loan.find(filter)
      .populate("borrower", "name phone")
      .populate("branch", "name");

    const buckets = {
      "0 (Current)": { count: 0, amount: 0 },
      "1-7": { count: 0, amount: 0 },
      "8-30": { count: 0, amount: 0 },
      "31-60": { count: 0, amount: 0 },
      "60+": { count: 0, amount: 0 }
    };

    const rows = [];
    loans.forEach(loan => {
      const dpd = loan.dpd || 0;
      let bucket;
      
      if (dpd === 0) bucket = "0 (Current)";
      else if (dpd <= 7) bucket = "1-7";
      else if (dpd <= 30) bucket = "8-30";
      else if (dpd <= 60) bucket = "31-60";
      else bucket = "60+";

      buckets[bucket].count++;
      buckets[bucket].amount += loan.outstanding;

      rows.push({
        loanId: loan.loanId,
        borrower: loan.borrower?.name || "N/A",
        phone: loan.borrower?.phone || "N/A",
        branch: loan.branch?.name || "N/A",
        outstanding: loan.outstanding,
        dpd: dpd,
        bucket: bucket
      });
    });

    if (format === "excel") {
      return exportExcel(rows, "aging-report", "Aging", res);
    }
    if (format === "csv") {
      return exportCSV(rows, "aging-report", res);
    }

    res.json({ buckets, data: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Collection Report
exports.collectionReport = async (req, res) => {
  try {
    const { startDate, endDate, branch, agent, format } = req.query;
    
    const filter = {};
    if (startDate && endDate) {
      filter.paymentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (branch) filter.branch = branch;
    if (agent) filter.collectedBy = agent;

    const payments = await Payment.find(filter)
      .populate("loan", "loanId")
      .populate("borrower", "name phone")
      .populate("collectedBy", "name")
      .populate("branch", "name");

    const rows = payments.map(p => ({
      paymentDate: p.paymentDate?.toISOString().split('T')[0] || "N/A",
      loanId: p.loan?.loanId || "N/A",
      borrower: p.borrower?.name || "N/A",
      phone: p.borrower?.phone || "N/A",
      installmentNo: p.installmentNumber || "N/A",
      amount: p.amount,
      mode: p.paymentMode,
      collectedBy: p.collectedBy?.name || "N/A",
      branch: p.branch?.name || "N/A",
      utrNo: p.utrNumber || "N/A"
    }));

    if (format === "excel") {
      return exportExcel(rows, "collection-report", "Collections", res);
    }
    if (format === "csv") {
      return exportCSV(rows, "collection-report", res);
    }

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    res.json({ totalAmount, totalCount: payments.length, data: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Disbursement Report
exports.disbursementReport = async (req, res) => {
  try {
    const { startDate, endDate, branch, product, format } = req.query;
    
    const filter = { status: { $in: ["DISBURSED", "ACTIVE"] } };
    if (startDate && endDate) {
      filter.disbursementDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (branch) filter.branch = branch;
    if (product) filter.loanProduct = product;

    const loans = await Loan.find(filter)
      .populate("borrower", "name phone")
      .populate("loanProduct", "name")
      .populate("branch", "name");

    const rows = loans.map(l => ({
      loanId: l.loanId,
      borrower: l.borrower?.name || "N/A",
      phone: l.borrower?.phone || "N/A",
      amount: l.principal,
      product: l.loanProduct?.name || "N/A",
      disbursementDate: l.disbursementDate?.toISOString().split('T')[0] || "N/A",
      utrNo: l.disbursementUTR || "N/A",
      status: l.status,
      branch: l.branch?.name || "N/A"
    }));

    if (format === "excel") {
      return exportExcel(rows, "disbursement-report", "Disbursements", res);
    }
    if (format === "csv") {
      return exportCSV(rows, "disbursement-report", res);
    }

    const totalAmount = loans.reduce((sum, l) => sum + l.principal, 0);
    res.json({ totalAmount, totalCount: loans.length, data: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NPA Tracker Report
exports.npaReport = async (req, res) => {
  try {
    const { branch, format } = req.query;
    
    const filter = { status: "ACTIVE", dpd: { $gt: 90 } };
    if (branch) filter.branch = branch;

    const loans = await Loan.find(filter)
      .populate("borrower", "name phone")
      .populate("branch", "name");

    const rows = loans.map(l => ({
      loanId: l.loanId,
      borrower: l.borrower?.name || "N/A",
      phone: l.borrower?.phone || "N/A",
      outstanding: l.outstanding,
      dpd: l.dpd,
      lastPaymentDate: l.lastPaymentDate?.toISOString().split('T')[0] || "N/A",
      bucket: l.dpd > 180 ? "180+" : l.dpd > 120 ? "120-180" : "90-120",
      branch: l.branch?.name || "N/A"
    }));

    if (format === "excel") {
      return exportExcel(rows, "npa-report", "NPA", res);
    }
    if (format === "csv") {
      return exportCSV(rows, "npa-report", res);
    }

    const totalNPA = loans.reduce((sum, l) => sum + l.outstanding, 0);
    res.json({ totalNPA, totalCount: loans.length, data: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Legal Report
exports.legalReport = async (req, res) => {
  try {
    const { branch, status, format } = req.query;
    
    const filter = {};
    if (branch) filter.branch = branch;
    if (status) filter.status = status;

    const cases = await LegalCase.find(filter)
      .populate("loan", "loanId")
      .populate("borrower", "name phone")
      .populate("branch", "name");

    const rows = cases.map(c => ({
      caseId: c.caseId,
      loanId: c.loan?.loanId || "N/A",
      borrower: c.borrower?.name || "N/A",
      phone: c.borrower?.phone || "N/A",
      noticeDate: c.noticeDate?.toISOString().split('T')[0] || "N/A",
      caseFilingDate: c.caseFilingDate?.toISOString().split('T')[0] || "N/A",
      courtHearingDate: c.courtHearingDate?.toISOString().split('T')[0] || "N/A",
      caseStatus: c.status,
      branch: c.branch?.name || "N/A"
    }));

    if (format === "excel") {
      return exportExcel(rows, "legal-report", "Legal", res);
    }
    if (format === "csv") {
      return exportCSV(rows, "legal-report", res);
    }

    res.json({ totalCases: cases.length, data: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Agent Performance Report
exports.agentPerformanceReport = async (req, res) => {
  try {
    const { month, year, agent, format } = req.query;
    
    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) - 1, 1);
    const endDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth(), 0);

    const filter = {
      paymentDate: { $gte: startDate, $lte: endDate }
    };
    if (agent) filter.collectedBy = agent;

    const payments = await Payment.find(filter)
      .populate("collectedBy", "name role")
      .populate("branch", "name");

    const agentStats = {};
    payments.forEach(p => {
      const agentId = p.collectedBy?._id?.toString();
      const agentName = p.collectedBy?.name || "Unknown";
      
      if (!agentStats[agentId]) {
        agentStats[agentId] = {
          agentName,
          collectionsAmount: 0,
          collectionsCount: 0,
          branch: p.branch?.name || "N/A"
        };
      }
      
      agentStats[agentId].collectionsAmount += p.amount;
      agentStats[agentId].collectionsCount += 1;
    });

    const rows = Object.values(agentStats).map(stat => ({
      agentName: stat.agentName,
      collectionsAmount: stat.collectionsAmount,
      collectionsCount: stat.collectionsCount,
      efficiency: ((stat.collectionsAmount / 100000) * 100).toFixed(2) + "%",
      branch: stat.branch
    }));

    if (format === "excel") {
      return exportExcel(rows, "agent-performance-report", "Agent Performance", res);
    }
    if (format === "csv") {
      return exportCSV(rows, "agent-performance-report", res);
    }

    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Branch Performance Report
exports.branchPerformanceReport = async (req, res) => {
  try {
    const { month, year, format } = req.query;
    
    const branches = await Branch.find({});
    const rows = [];

    for (const branch of branches) {
      const loans = await Loan.find({ branch: branch._id });
      const activeLoans = loans.filter(l => l.status === "ACTIVE");
      const totalDisbursed = loans.reduce((sum, l) => sum + l.principal, 0);
      const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstanding, 0);
      const overdueLoans = activeLoans.filter(l => l.dpd > 0);
      const overduePercentage = activeLoans.length ? ((overdueLoans.length / activeLoans.length) * 100).toFixed(2) : 0;

      rows.push({
        branchName: branch.name,
        totalLoans: loans.length,
        activeLoans: activeLoans.length,
        totalDisbursed,
        totalOutstanding,
        overduePercentage: overduePercentage + "%",
        activeBorrowers: activeLoans.length
      });
    }

    if (format === "excel") {
      return exportExcel(rows, "branch-performance-report", "Branch Performance", res);
    }
    if (format === "csv") {
      return exportCSV(rows, "branch-performance-report", res);
    }

    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Borrower Master Export
exports.borrowerMasterReport = async (req, res) => {
  try {
    const { branch, city, format } = req.query;
    
    const filter = {};
    if (branch) filter.branch = branch;
    if (city) filter["address.city"] = city;

    const borrowers = await Borrower.find(filter)
      .populate("branch", "name");

    const rows = borrowers.map(b => ({
      borrowerId: b.borrowerId,
      name: b.name,
      phone: b.phone,
      email: b.email || "N/A",
      aadhaar: b.aadhaar || "N/A",
      pan: b.pan || "N/A",
      city: b.address?.city || "N/A",
      state: b.address?.state || "N/A",
      pincode: b.address?.pincode || "N/A",
      branch: b.branch?.name || "N/A",
      kycStatus: b.kycStatus,
      createdDate: b.createdAt?.toISOString().split('T')[0] || "N/A"
    }));

    if (format === "excel") {
      return exportExcel(rows, "borrower-master-report", "Borrowers", res);
    }
    if (format === "csv") {
      return exportCSV(rows, "borrower-master-report", res);
    }

    res.json({ totalBorrowers: borrowers.length, data: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};