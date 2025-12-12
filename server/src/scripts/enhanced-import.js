const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Loan = require('../models/Loan');
const Borrower = require('../models/Borrower');
const Branch = require('../models/Branch');
const User = require('../models/User');
const emiService = require('../services/emi.service');

class EnhancedDataImporter {
  constructor() {
    this.successCount = 0;
    this.errorCount = 0;
    this.errors = [];
  }

  async importDisbursementData() {
    try {
      console.log('🚀 Starting enhanced disbursement data import...');
      
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');

      // Read and clean data
      const dataPath = path.join(__dirname, '..', '..', '..', 'Data', 'Disbursement Data.json');
      let rawData = fs.readFileSync(dataPath, 'utf8');
      rawData = rawData.replace(/:\\s*NaN/g, ': null');
      
      const disbursementData = JSON.parse(rawData);
      console.log(`📊 Processing ${disbursementData.length} records...`);

      // Get or create default branch and user
      const defaultBranch = await this.ensureDefaultBranch();
      const defaultUser = await this.ensureDefaultUser();

      // Process each record
      for (let i = 0; i < disbursementData.length; i++) {
        try {
          await this.processRecord(disbursementData[i], defaultBranch, defaultUser);
          this.successCount++;
          
          if ((i + 1) % 100 === 0) {
            console.log(`📈 Processed ${i + 1}/${disbursementData.length} records`);
          }
        } catch (error) {
          this.errorCount++;
          this.errors.push({
            record: i + 1,
            data: disbursementData[i],
            error: error.message
          });
        }
      }

      // Save error log
      if (this.errors.length > 0) {
        const errorPath = path.join(__dirname, '..', '..', 'import-errors.json');
        fs.writeFileSync(errorPath, JSON.stringify(this.errors, null, 2));
        console.log(`⚠️  ${this.errors.length} errors saved to import-errors.json`);
      }

      console.log(`✅ Import completed: ${this.successCount} success, ${this.errorCount} errors`);
      
    } catch (error) {
      console.error('❌ Import failed:', error.message);
    } finally {
      await mongoose.connection.close();
    }
  }

  async processRecord(record, defaultBranch, defaultUser) {
    // Validate required fields
    if (!record['Loan ID'] || !record['Customer Name']) {
      throw new Error('Missing required fields: Loan ID or Customer Name');
    }

    // Parse and validate dates
    const disbursementDate = this.parseDate(record['Date of Disbursement']);
    if (!disbursementDate) {
      throw new Error('Invalid disbursement date');
    }

    // Create or find borrower
    const borrower = await this.createOrFindBorrower({
      name: record['Customer Name'],
      mobile: record['Mobile Number'],
      branch: defaultBranch._id
    });

    // Create loan record
    const loanData = {
      branch: defaultBranch._id,
      borrower: borrower._id,
      product: null, // Will need to create loan products separately
      
      applicationId: record['Loan ID'],
      principal: this.parseNumber(record['Loan Amount']),
      processingFee: this.parseNumber(record['Processing Fees']),
      gstOnProcessingFee: this.parseNumber(record['Gst']),
      netDisbursed: this.parseNumber(record['Net Disbursement']),
      disbursedAmount: this.parseNumber(record['Net Disbursement']),
      
      // Default loan terms (can be updated later)
      interestType: 'reducing',
      interestRate: 24, // Default 24% annual
      termMonths: 12, // Default 12 months
      installments: 12,
      repaymentFrequency: 'monthly',
      
      status: 'disbursed',
      disbursedAt: disbursementDate,
      disbursedBy: defaultUser._id,
      createdBy: defaultUser._id,
      
      createdAt: disbursementDate,
      updatedAt: new Date()
    };

    // Calculate EMI and totals
    if (loanData.principal && loanData.interestRate && loanData.termMonths) {
      const summary = emiService.calculateLoanSummary({
        principal: loanData.principal,
        interestRate: loanData.interestRate,
        termMonths: loanData.termMonths
      });
      
      loanData.emi = summary.emi;
      loanData.interestTotal = summary.totalInterest;
      loanData.totalPayable = summary.totalPayable;
      loanData.outstandingPrincipal = loanData.principal;
    }

    // Check if loan already exists
    const existingLoan = await Loan.findOne({ applicationId: record['Loan ID'] });
    if (existingLoan) {
      console.log(`⚠️  Loan ${record['Loan ID']} already exists, skipping...`);
      return;
    }

    // Create loan
    const loan = new Loan(loanData);
    await loan.save();

    // Generate repayment schedule if loan terms are available
    if (loanData.principal && loanData.interestRate && loanData.termMonths) {
      await this.generateRepaymentSchedule(loan);
    }
  }

  async createOrFindBorrower(borrowerData) {
    // Try to find existing borrower by mobile or name
    let borrower = null;
    
    if (borrowerData.mobile) {
      borrower = await Borrower.findOne({ mobile: borrowerData.mobile });
    }
    
    if (!borrower) {
      borrower = await Borrower.findOne({ 
        name: borrowerData.name,
        branch: borrowerData.branch
      });
    }

    if (!borrower) {
      borrower = new Borrower({
        name: borrowerData.name,
        mobile: borrowerData.mobile,
        branch: borrowerData.branch,
        status: 'active',
        createdAt: new Date()
      });
      await borrower.save();
    }

    return borrower;
  }

  async generateRepaymentSchedule(loan) {
    const scheduleData = {
      principal: loan.principal,
      interestRate: loan.interestRate,
      termMonths: loan.termMonths,
      startDate: loan.disbursedAt,
      frequency: loan.repaymentFrequency
    };
    
    const schedule = emiService.generateSchedule(scheduleData);
    
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
    await loan.save();
  }

  async ensureDefaultBranch() {
    let branch = await Branch.findOne({ code: 'HQ' });
    
    if (!branch) {
      branch = new Branch({
        name: 'Head Office',
        code: 'HQ',
        address: 'Default Address',
        active: true,
        createdAt: new Date()
      });
      await branch.save();
      console.log('✅ Created default branch: Head Office');
    }
    
    return branch;
  }

  async ensureDefaultUser() {
    let user = await User.findOne({ username: 'system' });
    
    if (!user) {
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('system123', 10);
      
      user = new User({
        username: 'system',
        passwordHash,
        displayName: 'System User',
        role: 'ADMIN',
        active: true,
        createdAt: new Date()
      });
      await user.save();
      console.log('✅ Created default system user');
    }
    
    return user;
  }

  parseDate(dateString) {
    if (!dateString || dateString === 'NaN' || dateString === null) {
      return null;
    }
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  }

  parseNumber(value) {
    if (value === null || value === undefined || value === 'NaN' || value === '') {
      return 0;
    }
    
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
}

// Run import if called directly
if (require.main === module) {
  const importer = new EnhancedDataImporter();
  importer.importDisbursementData();
}

module.exports = EnhancedDataImporter;