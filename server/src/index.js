// server/src/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'dev' }));

// Mount routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/branches', require('./routes/branches.routes'));
app.use('/api/employees', require('./routes/employees.routes'));
app.use('/api/leads', require('./routes/leads.routes'));
app.use('/api/borrowers', require('./routes/borrowers.routes'));
app.use('/api/loan-products', require('./routes/loan-products.routes'));
app.use('/api/loans', require('./routes/loans.routes'));
// Add statement route to loans
const { generateLoanStatement } = require('./controllers/statements.controller');
const { authenticateToken } = require('./middlewares/auth.middleware');
app.get('/api/loans/:id/statement', authenticateToken, generateLoanStatement);
app.use('/api/payments', require('./routes/payments.routes'));
app.use('/api/collections', require('./routes/collections.routes'));
app.use('/api/legal-cases', require('./routes/legal.routes'));
app.use('/api/reports', require('./routes/reports.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/disbursement', require('./routes/disbursement.routes'));
app.use('/api/import', require('./routes/import.routes'));
app.use('/api/loan-engine', require('./routes/loanEngine.routes'));

// Enhanced API routes with RBAC
app.use('/api', require('./routes/api.routes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI not set in environment. Copy .env.example to server/.env and edit it.');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Start scheduler for overdue updates
    const { startScheduler } = require('./utils/scheduler');
    startScheduler();
    
    // Start scheduled reports
    const { scheduleDailyPortfolio, scheduleWeeklyCollections, scheduleMonthlyAging } = require('./cron/reports.cron');
    const reportService = require('./services/report.service');
    const xlsx = require('xlsx');
    
    // Schedule report jobs
    scheduleDailyPortfolio(async () => {
      const rows = await reportService.portfolioExport({});
      const ws = xlsx.utils.json_to_sheet(rows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'portfolio');
      return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    });
    
    scheduleWeeklyCollections(async () => {
      const rows = await reportService.collectionExport({});
      const ws = xlsx.utils.json_to_sheet(rows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'collections');
      return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    });
    
    scheduleMonthlyAging(async () => {
      const rows = await reportService.agingReport({});
      const ws = xlsx.utils.json_to_sheet(rows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, 'aging');
      return xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    });
    
    console.log('📅 Scheduled reports initialized');
    
    app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message || err);
    process.exit(1);
  });
