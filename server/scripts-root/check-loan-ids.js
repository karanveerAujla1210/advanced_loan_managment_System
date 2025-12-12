const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Loan = require('./src/models/Loan');

async function checkLoanIds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const loans = await Loan.find({}, { applicationId: 1, _id: 1 }).limit(10);
    
    console.log('Sample loan IDs in database:');
    loans.forEach(loan => {
      console.log(`ID: ${loan._id}, Application ID: ${loan.applicationId}`);
    });

    console.log(`\nTotal loans in database: ${await Loan.countDocuments()}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkLoanIds();