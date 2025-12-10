// MongoDB Seed Data for Advanced Loan Management System
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../server/src/models/User');
const Branch = require('../server/src/models/Branch');
const LoanProduct = require('../server/src/models/LoanProduct');
const Borrower = require('../server/src/models/Borrower');
const Loan = require('../server/src/models/Loan');
const Payment = require('../server/src/models/Payment');
const Instalment = require('../server/src/models/Instalment');

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Branch.deleteMany({});
    await LoanProduct.deleteMany({});
    await Borrower.deleteMany({});
    await Loan.deleteMany({});
    await Payment.deleteMany({});
    await Instalment.deleteMany({});

    console.log('Cleared existing data');

    // Create Branches
    const branches = await Branch.insertMany([
      {
        name: 'Main Branch',
        code: 'MB001',
        address: '123 Main Street, City Center',
        phone: '+91-9876543210',
        email: 'main@loancrm.com',
        isActive: true
      },
      {
        name: 'North Branch',
        code: 'NB002',
        address: '456 North Avenue, North District',
        phone: '+91-9876543211',
        email: 'north@loancrm.com',
        isActive: true
      },
      {
        name: 'South Branch',
        code: 'SB003',
        address: '789 South Road, South District',
        phone: '+91-9876543212',
        email: 'south@loancrm.com',
        isActive: true
      }
    ]);

    console.log('Created branches');

    // Create Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@loancrm.com',
        password: hashedPassword,
        displayName: 'System Administrator',
        role: 'ADMIN',
        branch: branches[0]._id,
        isActive: true
      },
      {
        username: 'manager1',
        email: 'manager1@loancrm.com',
        password: hashedPassword,
        displayName: 'Branch Manager',
        role: 'MANAGER',
        branch: branches[0]._id,
        isActive: true
      },
      {
        username: 'counsellor1',
        email: 'counsellor1@loancrm.com',
        password: hashedPassword,
        displayName: 'Loan Counsellor',
        role: 'COUNSELLOR',
        branch: branches[0]._id,
        isActive: true
      },
      {
        username: 'collection1',
        email: 'collection1@loancrm.com',
        password: hashedPassword,
        displayName: 'Collection Agent',
        role: 'COLLECTION',
        branch: branches[0]._id,
        isActive: true
      }
    ]);

    console.log('Created users');

    // Create Loan Products
    const loanProducts = await LoanProduct.insertMany([
      {
        name: 'Personal Loan',
        code: 'PL001',
        description: 'Personal loan for individual needs',
        minAmount: 10000,
        maxAmount: 500000,
        interestRate: 12.5,
        minTenure: 6,
        maxTenure: 60,
        processingFee: 2.5,
        isActive: true
      },
      {
        name: 'Business Loan',
        code: 'BL001',
        description: 'Business loan for entrepreneurs',
        minAmount: 50000,
        maxAmount: 2000000,
        interestRate: 14.0,
        minTenure: 12,
        maxTenure: 84,
        processingFee: 3.0,
        isActive: true
      },
      {
        name: 'Micro Finance',
        code: 'MF001',
        description: 'Small loans for micro enterprises',
        minAmount: 5000,
        maxAmount: 100000,
        interestRate: 18.0,
        minTenure: 3,
        maxTenure: 24,
        processingFee: 1.5,
        isActive: true
      }
    ]);

    console.log('Created loan products');

    // Create Borrowers
    const borrowers = await Borrower.insertMany([
      {
        borrowerId: 'BR001',
        name: 'Rajesh Kumar',
        phone: '+91-9876543220',
        email: 'rajesh@example.com',
        aadhaar: '1234-5678-9012',
        pan: 'ABCDE1234F',
        address: {
          line1: '123 Residential Area',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001'
        },
        kycStatus: 'COMPLETE',
        status: 'ACTIVE',
        branch: branches[0]._id,
        createdBy: users[0]._id
      },
      {
        borrowerId: 'BR002',
        name: 'Priya Sharma',
        phone: '+91-9876543221',
        email: 'priya@example.com',
        aadhaar: '2345-6789-0123',
        pan: 'BCDEF2345G',
        address: {
          line1: '456 Business District',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110001'
        },
        kycStatus: 'COMPLETE',
        status: 'ACTIVE',
        branch: branches[1]._id,
        createdBy: users[1]._id
      },
      {
        borrowerId: 'BR003',
        name: 'Amit Patel',
        phone: '+91-9876543222',
        email: 'amit@example.com',
        aadhaar: '3456-7890-1234',
        pan: 'CDEFG3456H',
        address: {
          line1: '789 Commercial Street',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001'
        },
        kycStatus: 'PENDING',
        status: 'ACTIVE',
        branch: branches[2]._id,
        createdBy: users[2]._id
      }
    ]);

    console.log('Created borrowers');

    // Create Loans
    const loans = await Loan.insertMany([
      {
        loanId: 'LN001',
        borrower: borrowers[0]._id,
        loanProduct: loanProducts[0]._id,
        branch: branches[0]._id,
        principal: 100000,
        interestRate: 12.5,
        tenure: 24,
        emiAmount: 4707,
        outstanding: 85000,
        status: 'ACTIVE',
        disbursementDate: new Date('2024-01-15'),
        maturityDate: new Date('2026-01-15'),
        dpd: 5,
        overdueAmount: 4707,
        createdBy: users[1]._id
      },
      {
        loanId: 'LN002',
        borrower: borrowers[1]._id,
        loanProduct: loanProducts[1]._id,
        branch: branches[1]._id,
        principal: 250000,
        interestRate: 14.0,
        tenure: 36,
        emiAmount: 8516,
        outstanding: 200000,
        status: 'ACTIVE',
        disbursementDate: new Date('2024-03-01'),
        maturityDate: new Date('2027-03-01'),
        dpd: 0,
        overdueAmount: 0,
        createdBy: users[1]._id
      },
      {
        loanId: 'LN003',
        borrower: borrowers[2]._id,
        loanProduct: loanProducts[2]._id,
        branch: branches[2]._id,
        principal: 50000,
        interestRate: 18.0,
        tenure: 12,
        emiAmount: 4811,
        outstanding: 30000,
        status: 'ACTIVE',
        disbursementDate: new Date('2024-06-01'),
        maturityDate: new Date('2025-06-01'),
        dpd: 15,
        overdueAmount: 9622,
        createdBy: users[2]._id
      }
    ]);

    console.log('Created loans');

    // Create Sample Payments
    const payments = await Payment.insertMany([
      {
        loan: loans[0]._id,
        borrower: borrowers[0]._id,
        amount: 4707,
        paymentDate: new Date('2024-02-15'),
        paymentMode: 'CASH',
        installmentNumber: 1,
        collectedBy: users[3]._id,
        branch: branches[0]._id,
        status: 'COMPLETED'
      },
      {
        loan: loans[1]._id,
        borrower: borrowers[1]._id,
        amount: 8516,
        paymentDate: new Date('2024-04-01'),
        paymentMode: 'ONLINE',
        installmentNumber: 1,
        utrNumber: 'UTR123456789',
        collectedBy: users[3]._id,
        branch: branches[1]._id,
        status: 'COMPLETED'
      }
    ]);

    console.log('Created payments');

    // Create Sample Installments
    const installments = [];
    for (let loan of loans) {
      for (let i = 1; i <= loan.tenure; i++) {
        const dueDate = new Date(loan.disbursementDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        installments.push({
          loan: loan._id,
          borrower: loan.borrower,
          installmentNumber: i,
          dueDate,
          emiAmount: loan.emiAmount,
          principalAmount: Math.round(loan.principal / loan.tenure),
          interestAmount: loan.emiAmount - Math.round(loan.principal / loan.tenure),
          balanceAmount: loan.principal - (Math.round(loan.principal / loan.tenure) * i),
          status: i <= 2 ? 'PAID' : (dueDate < new Date() ? 'OVERDUE' : 'PENDING')
        });
      }
    }

    await Instalment.insertMany(installments);
    console.log('Created installments');

    console.log('✅ Database seeded successfully!');
    console.log(`
    📊 Seed Data Summary:
    - Branches: ${branches.length}
    - Users: ${users.length}
    - Loan Products: ${loanProducts.length}
    - Borrowers: ${borrowers.length}
    - Loans: ${loans.length}
    - Payments: ${payments.length}
    - Installments: ${installments.length}
    
    🔐 Login Credentials:
    - Username: admin, Password: admin123
    - Username: manager1, Password: admin123
    - Username: counsellor1, Password: admin123
    - Username: collection1, Password: admin123
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

module.exports = seedData;