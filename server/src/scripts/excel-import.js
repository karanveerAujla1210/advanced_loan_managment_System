require('dotenv').config();
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');

const Borrower = require('../models/Borrower');
const Loan = require('../models/Loan');
const Branch = require('../models/Branch');
const User = require('../models/User');
const LoanProduct = require('../models/LoanProduct');

async function importFromExcel() {
  try {
    console.log('🚀 Starting Excel data import...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Read Excel file
    const excelPath = path.join(__dirname, '../../../Data/Disbursement Data.xlsx');
    console.log('📊 Reading Excel file:', excelPath);
    
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📋 Found ${data.length} records in Excel`);

    // Get or create admin user
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@loancrm.com',
        password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        role: 'ADMIN',
        displayName: 'System Administrator'
      });
      console.log('✅ Created admin user');
    }

    // Create default branches
    const branches = [
      { name: 'Main Branch', code: 'MAIN' },
      { name: 'North Branch', code: 'NORTH' },
      { name: 'South Branch', code: 'SOUTH' },
      { name: 'East Branch', code: 'EAST' },
      { name: 'West Branch', code: 'WEST' }
    ];

    const branchMap = {};
    for (const branchData of branches) {
      let branch = await Branch.findOne({ code: branchData.code });
      if (!branch) {
        branch = await Branch.create({
          name: branchData.name,
          code: branchData.code,
          address: `${branchData.name} Address`,
          phone: '9876543200',
          manager: adminUser._id,
          isActive: true
        });
        console.log(`✅ Created branch: ${branchData.name}`);
      }
      branchMap[branchData.name] = branch._id;
    }

    // Create loan products
    const products = [
      { name: 'Personal Loan', code: 'PL', interestRate: 12, maxAmount: 500000 },
      { name: 'Business Loan', code: 'BL', interestRate: 10, maxAmount: 1000000 },
      { name: 'Home Loan', code: 'HL', interestRate: 9, maxAmount: 5000000 },
      { name: 'Micro Loan', code: 'ML', interestRate: 18, maxAmount: 100000 },
      { name: 'Vehicle Loan', code: 'VL', interestRate: 11, maxAmount: 800000 },
      { name: 'Education Loan', code: 'EL', interestRate: 8, maxAmount: 1500000 }
    ];

    const productMap = {};
    for (const productData of products) {
      let product = await LoanProduct.findOne({ code: productData.code });
      if (!product) {
        product = await LoanProduct.create({
          ...productData,
          description: `${productData.name} with competitive rates`,
          processingFee: 1000,
          minTenure: 6,
          maxTenure: 60,
          isActive: true
        });
        console.log(`✅ Created product: ${productData.name}`);
      }
      productMap[productData.name] = product._id;
    }

    let importedBorrowers = 0;
    let importedLoans = 0;
    let skippedRecords = 0;

    // Process each row from Excel
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Extract data from Excel row (adjust field names based on your Excel structure)
        const borrowerName = row['Borrower Name'] || row['Name'] || row['Customer Name'] || `Borrower ${i + 1}`;
        const phone = row['Phone'] || row['Mobile'] || row['Contact'] || `987654${String(i).padStart(4, '0')}`;
        const email = row['Email'] || `borrower${i + 1}@example.com`;
        const loanAmount = parseFloat(row['Loan Amount'] || row['Amount'] || row['Principal'] || 50000);
        const interestRate = parseFloat(row['Interest Rate'] || row['Rate'] || 12);
        const tenure = parseInt(row['Tenure'] || row['Term'] || row['Months'] || 12);
        const branchName = row['Branch'] || 'Main Branch';
        const productName = row['Product'] || row['Loan Type'] || 'Personal Loan';
        const disbursementDate = row['Disbursement Date'] || new Date();

        // Parse borrower name
        const nameParts = borrowerName.split(' ');
        const firstName = nameParts[0] || `Borrower${i + 1}`;
        const lastName = nameParts.slice(1).join(' ') || 'Kumar';

        // Get branch and product IDs
        const branchId = branchMap[branchName] || branchMap['Main Branch'];
        const productId = productMap[productName] || productMap['Personal Loan'];

        // Create borrower if not exists
        let borrower = await Borrower.findOne({ phone: phone });
        if (!borrower) {
          borrower = await Borrower.create({
            branch: branchId,
            firstName,
            lastName,
            phone,
            email,
            dob: new Date('1990-01-01'),
            gender: 'MALE',
            address: {
              line1: '123 Main Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001'
            },
            createdBy: adminUser._id
          });
          importedBorrowers++;
          console.log(`✅ Created borrower: ${firstName} ${lastName}`);
        }

        // Calculate loan details
        const processingFee = 1000;
        const gstOnProcessingFee = Math.round(processingFee * 0.18);
        const netDisbursed = loanAmount - processingFee - gstOnProcessingFee;
        const monthlyRate = interestRate / (12 * 100);
        const emi = Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));
        const totalPayable = emi * tenure;
        const interestTotal = totalPayable - loanAmount;

        // Create unique loan number
        const loanNumber = `LN${Date.now()}${String(i).padStart(3, '0')}`;

        // Create loan
        const loan = await Loan.create({
          branch: branchId,
          borrower: borrower._id,
          product: productId,
          principal: loanAmount,
          processingFee,
          gstOnProcessingFee,
          netDisbursed,
          interestRate,
          interestTotal,
          totalPayable,
          termMonths: tenure,
          termDays: tenure * 30,
          installments: tenure,
          frequencyDays: 30,
          emi,
          status: 'disbursed',
          startDate: new Date(disbursementDate),
          createdBy: adminUser._id,
          disbursedBy: adminUser._id,
          disbursedAt: new Date(disbursementDate),
          outstandingPrincipal: loanAmount,
          outstandingInterest: 0
        });

        importedLoans++;
        console.log(`✅ Created loan ${loanNumber} for ${firstName} ${lastName} - ₹${loanAmount.toLocaleString()}`);

      } catch (error) {
        console.error(`❌ Error importing row ${i + 1}:`, error.message);
        skippedRecords++;
      }
    }

    console.log(`\n🎉 Excel import completed!`);
    console.log(`📊 Import Statistics:`);
    console.log(`   Total records processed: ${data.length}`);
    console.log(`   New borrowers created: ${importedBorrowers}`);
    console.log(`   New loans created: ${importedLoans}`);
    console.log(`   Skipped records: ${skippedRecords}`);
    console.log(`\n📊 Database Statistics:`);
    console.log(`   Total borrowers: ${await Borrower.countDocuments()}`);
    console.log(`   Total loans: ${await Loan.countDocuments()}`);
    console.log(`   Total branches: ${await Branch.countDocuments()}`);
    console.log(`   Total products: ${await LoanProduct.countDocuments()}`);

    // Show sample data
    const sampleLoans = await Loan.find().limit(3).populate('borrower', 'firstName lastName phone').populate('branch', 'name');
    console.log(`\n📋 Sample imported loans:`);
    sampleLoans.forEach(loan => {
      console.log(`   ${loan.borrower.firstName} ${loan.borrower.lastName} - ₹${loan.principal.toLocaleString()} - ${loan.branch.name}`);
    });

  } catch (error) {
    console.error('❌ Excel import failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  importFromExcel();
}

module.exports = { importFromExcel };