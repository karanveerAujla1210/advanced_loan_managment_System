require('dotenv').config();
const mongoose = require('mongoose');

const Borrower = require('../models/Borrower');
const Loan = require('../models/Loan');
const Branch = require('../models/Branch');
const User = require('../models/User');
const LoanProduct = require('../models/LoanProduct');

async function importData() {
  try {
    console.log('🚀 Starting final data import...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user
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

    // Create branches
    const branches = [
      { name: 'Main Branch', code: 'MAIN', address: 'Mumbai', phone: '9876543200' },
      { name: 'North Branch', code: 'NORTH', address: 'Delhi', phone: '9876543201' },
      { name: 'South Branch', code: 'SOUTH', address: 'Bangalore', phone: '9876543202' }
    ];

    const branchIds = {};
    for (const branchData of branches) {
      let branch = await Branch.findOne({ code: branchData.code });
      if (!branch) {
        branch = await Branch.create({
          ...branchData,
          manager: adminUser._id,
          isActive: true
        });
        console.log(`✅ Created branch: ${branchData.name}`);
      }
      branchIds[branchData.name] = branch._id;
    }

    // Create loan products
    const products = [
      { name: 'Personal Loan', code: 'PL', interestRate: 12, maxAmount: 500000 },
      { name: 'Business Loan', code: 'BL', interestRate: 10, maxAmount: 1000000 },
      { name: 'Home Loan', code: 'HL', interestRate: 9, maxAmount: 5000000 },
      { name: 'Micro Loan', code: 'ML', interestRate: 18, maxAmount: 100000 }
    ];

    const productIds = {};
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
      productIds[productData.name] = product._id;
    }

    // Sample disbursement data
    const disbursementData = [
      {
        firstName: "Rajesh", lastName: "Kumar", phone: "9876543210", email: "rajesh@example.com",
        principal: 50000, interestRate: 12, termMonths: 12, branch: "Main Branch", product: "Personal Loan"
      },
      {
        firstName: "Priya", lastName: "Sharma", phone: "9876543211", email: "priya@example.com", 
        principal: 75000, interestRate: 10, termMonths: 24, branch: "Main Branch", product: "Business Loan"
      },
      {
        firstName: "Amit", lastName: "Singh", phone: "9876543212", email: "amit@example.com",
        principal: 100000, interestRate: 11, termMonths: 18, branch: "North Branch", product: "Home Loan"
      },
      {
        firstName: "Sunita", lastName: "Devi", phone: "9876543213", email: "sunita@example.com",
        principal: 25000, interestRate: 15, termMonths: 6, branch: "Main Branch", product: "Micro Loan"
      },
      {
        firstName: "Vikram", lastName: "Patel", phone: "9876543214", email: "vikram@example.com",
        principal: 80000, interestRate: 12, termMonths: 15, branch: "South Branch", product: "Personal Loan"
      }
    ];

    let importedCount = 0;

    for (const data of disbursementData) {
      try {
        // Create borrower
        let borrower = await Borrower.findOne({ phone: data.phone });
        if (!borrower) {
          borrower = await Borrower.create({
            branch: branchIds[data.branch],
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
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
          console.log(`✅ Created borrower: ${data.firstName} ${data.lastName}`);
        }

        // Calculate loan details
        const processingFee = 1000;
        const gstOnProcessingFee = processingFee * 0.18;
        const netDisbursed = data.principal - processingFee - gstOnProcessingFee;
        const monthlyRate = data.interestRate / (12 * 100);
        const emi = Math.round((data.principal * monthlyRate * Math.pow(1 + monthlyRate, data.termMonths)) / (Math.pow(1 + monthlyRate, data.termMonths) - 1));
        const totalPayable = emi * data.termMonths;
        const interestTotal = totalPayable - data.principal;

        // Create loan
        const loanNumber = `LN${Date.now()}${Math.floor(Math.random() * 1000)}`;
        await Loan.create({
          branch: branchIds[data.branch],
          borrower: borrower._id,
          product: productIds[data.product],
          principal: data.principal,
          processingFee,
          gstOnProcessingFee,
          netDisbursed,
          interestRate: data.interestRate,
          interestTotal,
          totalPayable,
          termMonths: data.termMonths,
          termDays: data.termMonths * 30,
          installments: data.termMonths,
          frequencyDays: 30,
          emi,
          status: 'disbursed',
          startDate: new Date(),
          createdBy: adminUser._id,
          disbursedBy: adminUser._id,
          disbursedAt: new Date()
        });

        console.log(`✅ Created loan for ${data.firstName} ${data.lastName}`);
        importedCount++;

      } catch (error) {
        console.error(`❌ Error importing ${data.firstName} ${data.lastName}:`, error.message);
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`📊 Final Statistics:`);
    console.log(`   Records imported: ${importedCount}`);
    console.log(`   Total borrowers: ${await Borrower.countDocuments()}`);
    console.log(`   Total loans: ${await Loan.countDocuments()}`);
    console.log(`   Total branches: ${await Branch.countDocuments()}`);
    console.log(`   Total products: ${await LoanProduct.countDocuments()}`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  importData();
}

module.exports = { importData };