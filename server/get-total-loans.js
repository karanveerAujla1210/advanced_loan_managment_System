const mongoose = require('mongoose');
require('dotenv').config();

const Loan = require('./src/models/Loan');

async function getTotalLoans() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const result = await Loan.aggregate([
      {
        $group: {
          _id: null,
          totalPrincipal: { $sum: '$principal' },
          totalDisbursed: { $sum: '$disbursedAmount' },
          totalPayable: { $sum: '$totalPayable' },
          totalOutstandingPrincipal: { $sum: '$outstandingPrincipal' },
          totalOutstandingInterest: { $sum: '$outstandingInterest' },
          totalLoans: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      const totals = result[0];
      console.log('\n=== TOTAL LOAN SUMMARY ===');
      console.log(`Total Loans: ${totals.totalLoans}`);
      console.log(`Total Principal: ₹${(totals.totalPrincipal || 0).toLocaleString('en-IN')}`);
      console.log(`Total Disbursed: ₹${(totals.totalDisbursed || 0).toLocaleString('en-IN')}`);
      console.log(`Total Payable: ₹${(totals.totalPayable || 0).toLocaleString('en-IN')}`);
      console.log(`Outstanding Principal: ₹${(totals.totalOutstandingPrincipal || 0).toLocaleString('en-IN')}`);
      console.log(`Outstanding Interest: ₹${(totals.totalOutstandingInterest || 0).toLocaleString('en-IN')}`);
      console.log('========================\n');
    } else {
      console.log('No loans found in database');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

getTotalLoans();