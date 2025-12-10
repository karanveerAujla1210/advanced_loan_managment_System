// MongoDB Indexes for Advanced Loan Management System
const mongoose = require('mongoose');

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;

    // Users Collection Indexes
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ branch: 1 });
    await db.collection('users').createIndex({ isActive: 1 });

    // Branches Collection Indexes
    await db.collection('branches').createIndex({ code: 1 }, { unique: true });
    await db.collection('branches').createIndex({ isActive: 1 });

    // Borrowers Collection Indexes
    await db.collection('borrowers').createIndex({ borrowerId: 1 }, { unique: true });
    await db.collection('borrowers').createIndex({ phone: 1 });
    await db.collection('borrowers').createIndex({ aadhaar: 1 });
    await db.collection('borrowers').createIndex({ pan: 1 });
    await db.collection('borrowers').createIndex({ branch: 1 });
    await db.collection('borrowers').createIndex({ status: 1 });
    await db.collection('borrowers').createIndex({ kycStatus: 1 });
    await db.collection('borrowers').createIndex({ createdAt: -1 });

    // Loan Products Collection Indexes
    await db.collection('loanproducts').createIndex({ code: 1 }, { unique: true });
    await db.collection('loanproducts').createIndex({ isActive: 1 });

    // Loans Collection Indexes
    await db.collection('loans').createIndex({ loanId: 1 }, { unique: true });
    await db.collection('loans').createIndex({ borrower: 1 });
    await db.collection('loans').createIndex({ loanProduct: 1 });
    await db.collection('loans').createIndex({ branch: 1 });
    await db.collection('loans').createIndex({ status: 1 });
    await db.collection('loans').createIndex({ disbursementDate: -1 });
    await db.collection('loans').createIndex({ maturityDate: 1 });
    await db.collection('loans').createIndex({ dpd: 1 });
    await db.collection('loans').createIndex({ outstanding: 1 });
    await db.collection('loans').createIndex({ createdAt: -1 });
    
    // Compound indexes for loans
    await db.collection('loans').createIndex({ status: 1, branch: 1 });
    await db.collection('loans').createIndex({ status: 1, dpd: 1 });
    await db.collection('loans').createIndex({ borrower: 1, status: 1 });

    // Payments Collection Indexes
    await db.collection('payments').createIndex({ loan: 1 });
    await db.collection('payments').createIndex({ borrower: 1 });
    await db.collection('payments').createIndex({ paymentDate: -1 });
    await db.collection('payments').createIndex({ paymentMode: 1 });
    await db.collection('payments').createIndex({ collectedBy: 1 });
    await db.collection('payments').createIndex({ branch: 1 });
    await db.collection('payments').createIndex({ status: 1 });
    await db.collection('payments').createIndex({ utrNumber: 1 });
    
    // Compound indexes for payments
    await db.collection('payments').createIndex({ loan: 1, paymentDate: -1 });
    await db.collection('payments').createIndex({ branch: 1, paymentDate: -1 });
    await db.collection('payments').createIndex({ collectedBy: 1, paymentDate: -1 });

    // Installments Collection Indexes
    await db.collection('instalments').createIndex({ loan: 1 });
    await db.collection('instalments').createIndex({ borrower: 1 });
    await db.collection('instalments').createIndex({ dueDate: 1 });
    await db.collection('instalments').createIndex({ status: 1 });
    await db.collection('instalments').createIndex({ installmentNumber: 1 });
    
    // Compound indexes for installments
    await db.collection('instalments').createIndex({ loan: 1, installmentNumber: 1 }, { unique: true });
    await db.collection('instalments').createIndex({ status: 1, dueDate: 1 });
    await db.collection('instalments').createIndex({ loan: 1, status: 1 });

    // Legal Cases Collection Indexes
    await db.collection('legalcases').createIndex({ caseId: 1 }, { unique: true });
    await db.collection('legalcases').createIndex({ loan: 1 });
    await db.collection('legalcases').createIndex({ borrower: 1 });
    await db.collection('legalcases').createIndex({ status: 1 });
    await db.collection('legalcases').createIndex({ caseType: 1 });
    await db.collection('legalcases').createIndex({ noticeDate: -1 });
    await db.collection('legalcases').createIndex({ caseFilingDate: -1 });

    // Leads Collection Indexes
    await db.collection('leads').createIndex({ phone: 1 });
    await db.collection('leads').createIndex({ status: 1 });
    await db.collection('leads').createIndex({ assignedTo: 1 });
    await db.collection('leads').createIndex({ branch: 1 });
    await db.collection('leads').createIndex({ createdAt: -1 });
    
    // Compound indexes for leads
    await db.collection('leads').createIndex({ status: 1, assignedTo: 1 });
    await db.collection('leads').createIndex({ branch: 1, status: 1 });

    // Text indexes for search functionality
    await db.collection('borrowers').createIndex({
      name: 'text',
      phone: 'text',
      email: 'text',
      borrowerId: 'text'
    });

    await db.collection('loans').createIndex({
      loanId: 'text'
    });

    console.log('✅ All indexes created successfully!');
    
    // Display created indexes
    const collections = ['users', 'branches', 'borrowers', 'loanproducts', 'loans', 'payments', 'instalments', 'legalcases', 'leads'];
    
    for (const collection of collections) {
      const indexes = await db.collection(collection).indexes();
      console.log(`📊 ${collection}: ${indexes.length} indexes`);
    }

  } catch (error) {
    console.error('❌ Error creating indexes:', error);
  }
};

module.exports = createIndexes;