require('dotenv').config();
const mongoose = require('mongoose');

const Borrower = require('../models/Borrower');
const Loan = require('../models/Loan');
const Branch = require('../models/Branch');
const User = require('../models/User');
const LoanProduct = require('../models/LoanProduct');

async function cleanImport() {
  try {
    console.log('🚀 Starting clean data import...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin user
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      console.log('❌ Admin user not found. Please run direct-import.js first.');
      return;
    }

    // Get branches
    const mainBranch = await Branch.findOne({ name: 'Main Branch' });
    const northBranch = await Branch.findOne({ name: 'North Branch' });
    const southBranch = await Branch.findOne({ name: 'South Branch' });

    // Get products
    const personalLoan = await LoanProduct.findOne({ name: 'Personal Loan' });
    const businessLoan = await LoanProduct.findOne({ name: 'Business Loan' });
    const homeLoan = await LoanProduct.findOne({ name: 'Home Loan' });
    const microLoan = await LoanProduct.findOne({ name: 'Micro Loan' });

    // Sample disbursement data with unique identifiers
    const disbursementData = [
      {
        firstName: "Sunita", lastName: "Devi", phone: "9876543213", email: "sunita@example.com",
        principal: 25000, interestRate: 15, termMonths: 6, branch: mainBranch._id, product: microLoan._id
      },
      {
        firstName: "Vikram", lastName: "Patel", phone: "9876543214", email: "vikram@example.com",
        principal: 80000, interestRate: 12, termMonths: 15, branch: southBranch._id, product: personalLoan._id
      },
      {
        firstName: "Meera", lastName: "Gupta", phone: "9876543215", email: "meera@example.com",
        principal: 60000, interestRate: 13, termMonths: 12, branch: mainBranch._id, product: businessLoan._id
      }
    ];

    let importedCount = 0;

    for (const data of disbursementData) {
      try {
        // Check if borrower exists
        let borrower = await Borrower.findOne({ phone: data.phone });
        if (!borrower) {
          borrower = await Borrower.create({
            branch: data.branch,
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
        const gstOnProcessingFee = Math.round(processingFee * 0.18);
        const netDisbursed = data.principal - processingFee - gstOnProcessingFee;
        const monthlyRate = data.interestRate / (12 * 100);
        const emi = Math.round((data.principal * monthlyRate * Math.pow(1 + monthlyRate, data.termMonths)) / (Math.pow(1 + monthlyRate, data.termMonths) - 1));
        const totalPayable = emi * data.termMonths;
        const interestTotal = totalPayable - data.principal;

        // Create loan with unique loan number
        const loanNumber = `LN${Date.now()}${Math.floor(Math.random() * 10000)}`;
        
        const loan = await Loan.create({
          branch: data.branch,
          borrower: borrower._id,
          product: data.product,
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
          disbursedAt: new Date(),
          outstandingPrincipal: data.principal,
          outstandingInterest: 0
        });

        console.log(`✅ Created loan ${loanNumber} for ${data.firstName} ${data.lastName}`);
        importedCount++;

      } catch (error) {
        console.error(`❌ Error importing ${data.firstName} ${data.lastName}:`, error.message);
      }
    }

    console.log(`\n🎉 Disbursement data import completed!`);
    console.log(`📊 Final Statistics:`);
    console.log(`   New records imported: ${importedCount}`);
    console.log(`   Total borrowers: ${await Borrower.countDocuments()}`);
    console.log(`   Total loans: ${await Loan.countDocuments()}`);
    console.log(`   Total branches: ${await Branch.countDocuments()}`);
    console.log(`   Total products: ${await LoanProduct.countDocuments()}`);
    console.log(`   Total users: ${await User.countDocuments()}`);

    console.log(`\n🚀 Ready to start the application!`);
    console.log(`   Server: cd server && npm start`);
    console.log(`   Frontend: cd ui && npm run dev`);
    console.log(`   Login: admin / admin123`);

  } catch (error) {
    console.error('❌ Import failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

if (require.main === module) {
  cleanImport();
}

module.exports = { cleanImport };