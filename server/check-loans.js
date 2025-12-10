require('dotenv').config();
const mongoose = require('mongoose');
const Loan = require('./src/models/Loan');

async function checkLoans() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const loans = await Loan.find({}).limit(5);
    console.log(`📊 Found ${loans.length} loans`);
    
    loans.forEach(loan => {
      console.log(`\nLoan: ${loan.applicationId || 'No ID'}`);
      console.log(`Principal: ${loan.principal}`);
      console.log(`Interest Rate: ${loan.interestRate}`);
      console.log(`Term Months: ${loan.termMonths}`);
      console.log(`Status: ${loan.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkLoans();