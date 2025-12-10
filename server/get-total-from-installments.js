const mongoose = require('mongoose');
require('dotenv').config();

async function getTotalFromInstallments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get total unique loans from installments
    const uniqueLoansResult = await db.collection('instalments').aggregate([
      { $group: { _id: '$loan' } },
      { $count: 'totalUniqueLoans' }
    ]).toArray();
    
    const totalUniqueLoans = uniqueLoansResult[0]?.totalUniqueLoans || 0;
    
    // Get loan totals from installments
    const loanTotals = await db.collection('instalments').aggregate([
      {
        $group: {
          _id: '$loan',
          totalAmount: { $sum: '$amount' },
          totalPrincipal: { $sum: '$principal' },
          totalInterest: { $sum: '$interest' },
          installmentCount: { $sum: 1 },
          applicationId: { $first: '$applicationId' }
        }
      },
      {
        $group: {
          _id: null,
          totalLoans: { $sum: 1 },
          grandTotalAmount: { $sum: '$totalAmount' },
          grandTotalPrincipal: { $sum: '$totalPrincipal' },
          grandTotalInterest: { $sum: '$totalInterest' },
          totalInstallments: { $sum: '$installmentCount' }
        }
      }
    ]).toArray();

    if (loanTotals.length > 0) {
      const totals = loanTotals[0];
      console.log('\n=== TOTAL LOAN SUMMARY FROM INSTALLMENTS ===');
      console.log(`Total Unique Loans: ${totalUniqueLoans}`);
      console.log(`Total Installments: ${totals.totalInstallments}`);
      console.log(`Grand Total Amount: ₹${(totals.grandTotalAmount || 0).toLocaleString('en-IN')}`);
      console.log(`Grand Total Principal: ₹${(totals.grandTotalPrincipal || 0).toLocaleString('en-IN')}`);
      console.log(`Grand Total Interest: ₹${(totals.grandTotalInterest || 0).toLocaleString('en-IN')}`);
      console.log('==========================================\n');
    }

    // Get sample loan details
    const sampleLoans = await db.collection('instalments').aggregate([
      {
        $group: {
          _id: '$loan',
          totalAmount: { $sum: '$amount' },
          totalPrincipal: { $sum: '$principal' },
          totalInterest: { $sum: '$interest' },
          installmentCount: { $sum: 1 }
        }
      },
      { $limit: 5 }
    ]).toArray();

    console.log('Sample loan totals:');
    sampleLoans.forEach((loan, i) => {
      console.log(`${i+1}. Loan ID: ${loan._id}`);
      console.log(`   Total Amount: ₹${(loan.totalAmount || 0).toLocaleString('en-IN')}`);
      console.log(`   Principal: ₹${(loan.totalPrincipal || 0).toLocaleString('en-IN')}`);
      console.log(`   Interest: ₹${(loan.totalInterest || 0).toLocaleString('en-IN')}`);
      console.log(`   Installments: ${loan.installmentCount}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

getTotalFromInstallments();