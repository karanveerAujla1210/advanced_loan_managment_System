const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const Branch = require('../models/Branch');
const Borrower = require('../models/Borrower');
const Loan = require('../models/Loan');
const Disbursement = require('../models/Disbursement');

// Connect to MongoDB
const connectDB = async () => {
  try {
    require('dotenv').config();
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/loancrm';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Helper function to parse date
const parseDate = (dateStr) => {
  if (!dateStr || dateStr === '#N/A') return null;
  
  // Handle MM/DD/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const month = parseInt(parts[0]) - 1; // Month is 0-indexed
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  
  return new Date(dateStr);
};

// Helper function to clean phone number
const cleanPhone = (phone) => {
  if (!phone) return null;
  return phone.toString().replace(/[^\d]/g, '');
};

// Helper function to find or create branch with caching
const findOrCreateBranch = async (branchName, cache) => {
  if (!branchName) return null;
  
  const branchCode = branchName.toUpperCase().replace(/\s+/g, '_');
  
  if (cache.has(branchCode)) {
    return cache.get(branchCode);
  }
  
  let branch = await Branch.findOne({ code: branchCode });
  
  if (!branch) {
    branch = new Branch({
      code: branchCode,
      name: branchName,
      city: branchName
    });
    await branch.save();
    console.log(`✅ Created branch: ${branchName}`);
  }
  
  cache.set(branchCode, branch);
  return branch;
};

// Helper function to find or create borrower with caching
const findOrCreateBorrower = async (customerName, phone, branchId, cache) => {
  if (!customerName || !phone) return null;
  
  const cleanedPhone = cleanPhone(phone);
  if (!cleanedPhone) return null;
  
  if (cache.has(cleanedPhone)) {
    return cache.get(cleanedPhone);
  }
  
  let borrower = await Borrower.findOne({ phone: cleanedPhone });
  
  if (!borrower) {
    const nameParts = customerName.trim().split(' ');
    const firstName = nameParts[0] || customerName;
    const lastName = nameParts.slice(1).join(' ') || '';
    
    borrower = new Borrower({
      branch: branchId,
      firstName: firstName,
      lastName: lastName,
      phone: cleanedPhone
    });
    await borrower.save();
    if (cache.size < 10) console.log(`✅ Created borrower: ${customerName}`);
  }
  
  cache.set(cleanedPhone, borrower);
  return borrower;
};

// Main import function
const importDisbursementData = async () => {
  try {
    console.log('🚀 Starting disbursement data import...');
    
    // Read JSON file
    const jsonPath = path.join(__dirname, '../../../Data/Disbursement Data.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    console.log(`📊 Found ${jsonData.length} records to import`);
    
    if (jsonData.length !== 1246) {
      console.log(`⚠️  Expected 1246 records, found ${jsonData.length}`);
    }
    
    let successCount = 0;
    let errorCount = 0;
    let branchCache = new Map();
    let borrowerCache = new Map();
    
    console.log('⚡ Processing in batches for optimal performance...');
    
    for (let i = 0; i < jsonData.length; i++) {
      const record = jsonData[i];
      
      try {
        if ((i + 1) % 50 === 0 || i === 0) {
          console.log(`\n📝 Processing record ${i + 1}/${jsonData.length}: ${record['Customer Name']}`);
        }
        
        // Find or create branch
        const branch = await findOrCreateBranch(record['Branch'], branchCache);
        if (!branch) {
          console.log(`❌ Could not create branch for: ${record['Branch']}`);
          errorCount++;
          continue;
        }
        
        // Find or create borrower
        const borrower = await findOrCreateBorrower(
          record['Customer Name'],
          record['Mobile Number'],
          branch._id,
          borrowerCache
        );
        if (!borrower) {
          console.log(`❌ Could not create borrower for: ${record['Customer Name']}`);
          errorCount++;
          continue;
        }
        
        // Parse financial data
        const loanAmount = parseFloat(record['Loan Amount']) || 0;
        const processingFees = parseFloat(record['Processing Fees']) || 0;
        const gst = parseFloat(record['Gst']) || 0;
        const netDisbursement = parseFloat(record['Net Disbursement']) || 0;
        
        // Create loan record
        const loan = new Loan({
          branch: branch._id,
          borrower: borrower._id,
          principal: loanAmount,
          processingFee: processingFees,
          gstOnProcessingFee: gst,
          netDisbursed: netDisbursement,
          disbursedAmount: netDisbursement,
          
          // Default values for required fields
          interestRate: 24, // Default 24% annual
          interestType: 'reducing',
          termMonths: 12, // Default 12 months
          termDays: 365,
          installments: 52, // Weekly installments
          frequencyDays: 7,
          emi: Math.round((loanAmount * 1.24) / 52), // Rough EMI calculation
          interestTotal: loanAmount * 0.24,
          totalPayable: loanAmount * 1.24,
          
          status: record['Status'] === 'ACTIVE' ? 'active' : 'disbursed',
          repaymentFrequency: 'weekly',
          appliedAt: parseDate(record['Date of Disbursement']),
          disbursedAt: parseDate(record['Date of Disbursement']),
          outstandingPrincipal: loanAmount,
          outstandingInterest: loanAmount * 0.24
        });
        
        await loan.save();
        if ((i + 1) % 50 === 0 || i < 5) {
          console.log(`✅ Created loan: ${record['Loan ID']}`);
        }
        
        // Create disbursement record
        const disbursement = new Disbursement({
          disbursementId: record['Unique ID'],
          loanId: loan._id,
          borrowerId: borrower._id,
          branchId: branch._id,
          disbursementAmount: loanAmount,
          disbursementDate: parseDate(record['Date of Disbursement']),
          disbursementMethod: 'BANK_TRANSFER',
          processingFee: processingFees,
          netDisbursementAmount: netDisbursement,
          status: 'COMPLETED',
          transactionId: record['UTR'],
          referenceNumber: record['Loan ID'],
          disbursedBy: null // Will need to be set to actual user
        });
        
        await disbursement.save();
        if ((i + 1) % 50 === 0 || i < 5) {
          console.log(`✅ Created disbursement: ${record['Unique ID']}`);
        }
        
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error processing record ${i + 1}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Import completed!`);
    console.log(`✅ Successfully imported: ${successCount} records`);
    console.log(`❌ Failed to import: ${errorCount} records`);
    console.log(`📊 Total branches created: ${branchCache.size}`);
    console.log(`👥 Total borrowers processed: ${borrowerCache.size}`);
    
    if (successCount === 1246) {
      console.log(`🎯 Perfect! All 1246 loan records imported successfully!`);
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
  }
};

// Run the import
const runImport = async () => {
  await connectDB();
  await importDisbursementData();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Handle command line execution
if (require.main === module) {
  runImport().catch(console.error);
}

module.exports = { importDisbursementData };