const mongoose = require('mongoose');
require('dotenv').config();

async function checkDetailedLoans() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Check loans collection directly
    const loansCount = await db.collection('loans').countDocuments();
    console.log(`\nTotal loans in collection: ${loansCount}`);
    
    // Get all loans
    const allLoans = await db.collection('loans').find({}).toArray();
    console.log(`Found ${allLoans.length} loans`);
    
    // Check installments collection for unique loan references
    const uniqueLoans = await db.collection('instalments').aggregate([
      { $group: { _id: '$loan', count: { $sum: 1 } } },
      { $count: 'totalUniqueLoans' }
    ]).toArray();
    
    if (uniqueLoans.length > 0) {
      console.log(`Unique loans referenced in installments: ${uniqueLoans[0].totalUniqueLoans}`);
    }
    
    // Get sample installments to see structure
    const sampleInstallments = await db.collection('instalments').find({}).limit(3).toArray();
    console.log('\nSample installments:');
    sampleInstallments.forEach((inst, i) => {
      console.log(`${i+1}. Loan: ${inst.loan}, Amount: ${inst.amount}, Status: ${inst.status}`);
    });
    
    // Check if there are loans with different applicationId patterns
    const loansByApplicationId = await db.collection('instalments').aggregate([
      { $group: { _id: '$applicationId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();
    
    console.log('\nTop application IDs in installments:');
    loansByApplicationId.forEach(app => {
      console.log(`${app._id}: ${app.count} installments`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkDetailedLoans();