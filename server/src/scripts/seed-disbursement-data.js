const mongoose = require('mongoose');
require('dotenv').config();

const Disbursement = require('../models/Disbursement');
const Loan = require('../models/Loan');
const Borrower = require('../models/Borrower');
const Branch = require('../models/Branch');
const User = require('../models/User');
const LoanProduct = require('../models/LoanProduct');
const Instalment = require('../models/Instalment');

// Sample data from Excel
const disbursementCases = [
  {
    borrowerName: "Rajesh Kumar",
    phone: "9876543210",
    email: "rajesh.kumar@example.com",
    principalAmount: 50000,
    interestRate: 12,
    tenure: 12,
    loanProduct: "Personal Loan",
    branch: "Main Branch",
    disbursementDate: "2024-01-20",
    disbursementMethod: "BANK_TRANSFER"
  },
  {
    borrowerName: "Priya Sharma", 
    phone: "9876543211",
    email: "priya.sharma@example.com",
    principalAmount: 75000,
    interestRate: 10,
    tenure: 24,
    loanProduct: "Business Loan",
    branch: "Main Branch",
    disbursementDate: "2024-01-25",
    disbursementMethod: "NEFT"
  },
  {
    borrowerName: "Amit Singh",
    phone: "9876543212", 
    email: "amit.singh@example.com",
    principalAmount: 100000,
    interestRate: 11,
    tenure: 18,
    loanProduct: "Home Loan",
    branch: "North Branch",
    disbursementDate: "2024-02-10",
    disbursementMethod: "RTGS"
  },
  {
    borrowerName: "Sunita Devi",
    phone: "9876543213",
    email: "sunita.devi@example.com", 
    principalAmount: 25000,
    interestRate: 15,
    tenure: 6,
    loanProduct: "Micro Loan",
    branch: "Main Branch",
    disbursementDate: "2024-02-15",
    disbursementMethod: "CASH"
  },
  {
    borrowerName: "Vikram Patel",
    phone: "9876543214",
    email: "vikram.patel@example.com",
    principalAmount: 80000,
    interestRate: 12,
    tenure: 15,
    loanProduct: "Personal Loan", 
    branch: "South Branch",
    disbursementDate: "2024-02-20",
    disbursementMethod: "BANK_TRANSFER"
  }
];

async function seedDisbursementData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin user if not exists
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@loancrm.com',
        password: 'admin123',
        role: 'ADMIN',
        displayName: 'System Administrator',
        isActive: true
      });
      console.log('✅ Created admin user');
    }

    // Create branches
    const branchData = [
      { name: 'Main Branch', code: 'MAIN' },
      { name: 'North Branch', code: 'NORTH' },
      { name: 'South Branch', code: 'SOUTH' }
    ];

    for (const branchInfo of branchData) {
      let branch = await Branch.findOne({ name: branchInfo.name });
      if (!branch) {
        await Branch.create({
          name: branchInfo.name,
          code: branchInfo.code,
          address: `${branchInfo.name} Address`,
          phone: '9876543200',
          email: `${branchInfo.code.toLowerCase()}@loancrm.com`,
          manager: adminUser._id,
          isActive: true
        });
        console.log(`✅ Created branch: ${branchInfo.name}`);
      }
    }

    // Create loan products
    const productData = [
      { name: 'Personal Loan', interestRate: 12, maxAmount: 500000 },
      { name: 'Business Loan', interestRate: 10, maxAmount: 1000000 },
      { name: 'Home Loan', interestRate: 9, maxAmount: 5000000 },
      { name: 'Micro Loan', interestRate: 18, maxAmount: 100000 }
    ];

    for (const product of productData) {
      let loanProduct = await LoanProduct.findOne({ name: product.name });
      if (!loanProduct) {
        await LoanProduct.create({
          ...product,
          description: `${product.name} with competitive rates`,
          processingFee: 1000,
          minTenure: 6,
          maxTenure: 60,
          isActive: true
        });
        console.log(`✅ Created loan product: ${product.name}`);
      }
    }

    // Create disbursement records
    let createdCount = 0;
    
    for (const data of disbursementCases) {
      try {
        // Create or find borrower
        let borrower = await Borrower.findOne({ phone: data.phone });
        if (!borrower) {
          const [firstName, ...lastNameParts] = data.borrowerName.split(' ');
          borrower = await Borrower.create({
            borrowerId: `BOR${Date.now()}${Math.floor(Math.random() * 1000)}`,
            firstName,
            lastName: lastNameParts.join(' '),
            phone: data.phone,
            email: data.email,
            dateOfBirth: new Date('1990-01-01'),
            gender: 'MALE',
            address: {
              street: '123 Main Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001'
            },
            kycStatus: 'VERIFIED',
            isActive: true
          });
        }

        // Get references
        const branch = await Branch.findOne({ name: data.branch });
        const loanProduct = await LoanProduct.findOne({ name: data.loanProduct });

        // Create loan
        const emi = calculateEMI(data.principalAmount, data.interestRate, data.tenure);
        
        const loan = await Loan.create({
          loanNumber: `LN${Date.now()}${Math.floor(Math.random() * 1000)}`,
          borrowerId: borrower._id,
          loanProductId: loanProduct._id,
          branchId: branch._id,
          principalAmount: data.principalAmount,
          interestRate: data.interestRate,
          tenure: data.tenure,
          emiAmount: emi,
          applicationDate: new Date(data.disbursementDate),
          disbursementDate: new Date(data.disbursementDate),
          status: 'ACTIVE',
          approvedBy: adminUser._id,
          disbursedBy: adminUser._id
        });

        // Create disbursement record
        const disbursement = await Disbursement.create({
          loanId: loan._id,
          borrowerId: borrower._id,
          branchId: branch._id,
          disbursementAmount: data.principalAmount,
          disbursementDate: new Date(data.disbursementDate),
          disbursementMethod: data.disbursementMethod,
          disbursedBy: adminUser._id,
          approvedBy: adminUser._id,
          status: 'COMPLETED',
          processingFee: 1000,
          netDisbursementAmount: data.principalAmount - 1000,
          remarks: `Disbursed via ${data.disbursementMethod}`,
          transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
        });

        // Generate instalment schedule
        const instalments = generateInstalmentSchedule(
          loan._id,
          data.principalAmount,
          data.interestRate,
          data.tenure,
          new Date(data.disbursementDate)
        );

        await Instalment.insertMany(instalments);

        console.log(`✅ Created disbursement: ${disbursement.disbursementId} for ${data.borrowerName}`);
        createdCount++;

      } catch (error) {
        console.error(`❌ Error creating disbursement for ${data.borrowerName}:`, error.message);
      }
    }

    console.log(`\n🎉 Seeding completed!`);
    console.log(`📊 Statistics:`);
    console.log(`   Disbursements created: ${createdCount}`);
    console.log(`   Total borrowers: ${await Borrower.countDocuments()}`);
    console.log(`   Total loans: ${await Loan.countDocuments()}`);
    console.log(`   Total disbursements: ${await Disbursement.countDocuments()}`);
    console.log(`   Total instalments: ${await Instalment.countDocuments()}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// EMI calculation function
function calculateEMI(principal, rate, tenure) {
  const monthlyRate = rate / (12 * 100);
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
              (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi);
}

// Generate instalment schedule
function generateInstalmentSchedule(loanId, principal, rate, tenure, startDate) {
  const instalments = [];
  const emi = calculateEMI(principal, rate, tenure);
  let balance = principal;
  
  for (let i = 1; i <= tenure; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);
    
    const interest = Math.round(balance * (rate / (12 * 100)));
    const principalAmount = emi - interest;
    balance = Math.max(0, balance - principalAmount);
    
    instalments.push({
      loanId,
      instalmentNumber: i,
      dueDate,
      emiAmount: emi,
      principalAmount: Math.round(principalAmount),
      interestAmount: interest,
      outstandingBalance: Math.round(balance),
      status: 'PENDING'
    });
  }
  
  return instalments;
}

// Run seeding
if (require.main === module) {
  seedDisbursementData();
}

module.exports = { seedDisbursementData };