const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const { checkPermission } = require('../middlewares/rbac.middleware');
const emiService = require('../services/emi.service');
const paymentService = require('../services/payment.service');
const analyticsService = require('../services/analytics.service');

// Import route modules
const authRoutes = require('./auth.routes');
const customersRoutes = require('./customers.routes');
const loansRoutes = require('./loans.routes');
const paymentsRoutes = require('./payments.routes');
const collectionsRoutes = require('./collections.routes');
const borrowersRoutes = require('./borrowers.routes');
const branchesRoutes = require('./branches.routes');
const reportsRoutes = require('./reports.routes');

// Mount route modules
router.use('/auth', authRoutes);
router.use('/customers', customersRoutes);
router.use('/loans', loansRoutes);
router.use('/payments', paymentsRoutes);
router.use('/collections', collectionsRoutes);
router.use('/borrowers', borrowersRoutes);
router.use('/branches', branchesRoutes);
router.use('/reports', reportsRoutes);

// EMI Calculator Routes
router.post('/emi/calculate', authenticateToken, checkPermission('loans:read'), async (req, res) => {
  try {
    const { principal, interestRate, termMonths } = req.body;
    
    if (!principal || !interestRate || !termMonths) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const emi = emiService.calculateEMI(principal, interestRate, termMonths);
    const summary = emiService.calculateLoanSummary({ principal, interestRate, termMonths });
    
    res.json({ emi, summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/emi/schedule', authenticateToken, checkPermission('loans:read'), async (req, res) => {
  try {
    const loanDetails = req.body;
    const schedule = emiService.generateSchedule(loanDetails);
    
    res.json({ schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Payment Processing Routes
router.post('/payments/process', authenticateToken, checkPermission('payments:write'), async (req, res) => {
  try {
    const paymentData = {
      ...req.body,
      collectedBy: req.user.id
    };
    
    const result = await paymentService.processPayment(paymentData);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/payments/history/:loanId', authenticateToken, checkPermission('payments:read'), async (req, res) => {
  try {
    const { loanId } = req.params;
    const options = req.query;
    
    const history = await paymentService.getPaymentHistory(loanId, options);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/payments/report', authenticateToken, checkPermission('reports:read'), async (req, res) => {
  try {
    const filters = req.query;
    const report = await paymentService.getCollectionReport(filters);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics & Dashboard Routes
router.get('/analytics/portfolio', authenticateToken, checkPermission('reports:read'), async (req, res) => {
  try {
    const filters = req.query;
    const overview = await analyticsService.getPortfolioOverview(filters);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/trends', authenticateToken, checkPermission('reports:read'), async (req, res) => {
  try {
    const filters = req.query;
    const trends = await analyticsService.getLoanTrends(filters);
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/performance', authenticateToken, checkPermission('reports:read'), async (req, res) => {
  try {
    const filters = req.query;
    const performance = await analyticsService.getPerformanceRankings(filters);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Overdue Management Routes
router.get('/overdue/analysis', authenticateToken, checkPermission('collections:read'), async (req, res) => {
  try {
    const filters = req.query;
    const analysis = await analyticsService.getOverdueAnalysis(filters);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Loan Operations Routes
router.post('/loans/:id/disburse', authenticateToken, checkPermission('loans:disburse'), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, reference } = req.body;
    
    const Loan = require('../models/Loan');
    const loan = await Loan.findById(id);
    
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.status !== 'approved') {
      return res.status(400).json({ error: 'Loan must be approved before disbursement' });
    }

    // Update loan with disbursement details
    loan.disbursement = {
      amount,
      dateOfDisbursement: new Date(),
      method,
      reference
    };
    loan.status = 'disbursed';
    loan.disbursedBy = req.user.id;
    loan.disbursedAt = new Date();
    
    await loan.save();

    // Generate repayment schedule
    const scheduleData = {
      principal: loan.principal,
      interestRate: loan.interestRate,
      termMonths: loan.termMonths,
      startDate: new Date(),
      frequency: loan.repaymentFrequency
    };
    
    const schedule = emiService.generateSchedule(scheduleData);
    
    // Save installments
    const Instalment = require('../models/Instalment');
    const installments = schedule.map(item => ({
      loan: loan._id,
      installmentNo: item.installmentNo,
      dueDate: item.dueDate,
      emi: item.emi,
      principalAmount: item.principalAmount,
      interestAmount: item.interestAmount,
      outstandingBalance: item.outstandingBalance,
      status: 'pending'
    }));
    
    await Instalment.insertMany(installments);
    
    loan.scheduleGenerated = true;
    loan.outstandingPrincipal = loan.principal;
    await loan.save();

    res.json({ 
      message: 'Loan disbursed successfully',
      loan,
      schedule: installments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check with system status
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;