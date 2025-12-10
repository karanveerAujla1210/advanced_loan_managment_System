const mongoose = require('mongoose');
require('dotenv').config();

// Import models to create collections
const Disbursement = require('../models/Disbursement');
const Loan = require('../models/Loan');
const Borrower = require('../models/Borrower');
const Branch = require('../models/Branch');
const User = require('../models/User');
const LoanProduct = require('../models/LoanProduct');
const Instalment = require('../models/Instalment');

async function setupDisbursementTables() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create collections if they don't exist
    const collections = [
      { model: Disbursement, name: 'disbursements' },
      { model: Loan, name: 'loans' },
      { model: Borrower, name: 'borrowers' },
      { model: Branch, name: 'branches' },
      { model: User, name: 'users' },
      { model: LoanProduct, name: 'loanproducts' },
      { model: Instalment, name: 'instalments' }
    ];

    for (const { model, name } of collections) {
      try {
        await model.createCollection();
        console.log(`✅ Created collection: ${name}`);
      } catch (error) {
        if (error.code === 48) {
          console.log(`ℹ️  Collection already exists: ${name}`);
        } else {
          console.error(`❌ Error creating collection ${name}:`, error.message);
        }
      }
    }

    // Create indexes
    console.log('\nCreating indexes...');
    
    await Disbursement.createIndexes();
    console.log('✅ Created disbursement indexes');
    
    await Loan.createIndexes();
    console.log('✅ Created loan indexes');
    
    await Borrower.createIndexes();
    console.log('✅ Created borrower indexes');

    // Show collection stats
    console.log('\n📊 Collection Statistics:');
    const stats = await Promise.all([
      Disbursement.countDocuments(),
      Loan.countDocuments(),
      Borrower.countDocuments(),
      Branch.countDocuments(),
      User.countDocuments(),
      LoanProduct.countDocuments(),
      Instalment.countDocuments()
    ]);

    console.log(`Disbursements: ${stats[0]}`);
    console.log(`Loans: ${stats[1]}`);
    console.log(`Borrowers: ${stats[2]}`);
    console.log(`Branches: ${stats[3]}`);
    console.log(`Users: ${stats[4]}`);
    console.log(`Loan Products: ${stats[5]}`);
    console.log(`Instalments: ${stats[6]}`);

    console.log('\n✅ Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run setup
if (require.main === module) {
  setupDisbursementTables();
}

module.exports = { setupDisbursementTables };