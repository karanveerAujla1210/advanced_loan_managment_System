require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Branch = require('../models/Branch');
const LoanProduct = require('../models/LoanProduct');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create default branch
    let branch = await Branch.findOne({ code: 'HQ001' });
    if (!branch) {
      branch = await Branch.create({
        code: 'HQ001',
        name: 'Head Office',
        address: '123 Main Street',
        city: 'Mumbai',
        timezone: 'Asia/Kolkata'
      });
      console.log('✅ Default branch created');
    } else {
      console.log('ℹ️  Default branch already exists');
    }

    // Create admin user
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        passwordHash,
        displayName: 'System Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        branch: branch._id,
        active: true
      });
      console.log('✅ Admin user created (username: admin, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create default loan products
    const productExists = await LoanProduct.findOne({ code: 'BL001' });
    if (!productExists) {
      await LoanProduct.insertMany([
        {
          name: 'Business Loan - Standard',
          code: 'BL001',
          description: 'Standard business loan with reducing balance',
          interestRate: 18,
          interestType: 'reducing',
          defaultTermMonths: 12,
          frequency: 'monthly',
          active: true
        },
        {
          name: 'Micro Loan - Weekly',
          code: 'ML001',
          description: 'Small loan with weekly repayment',
          interestRate: 24,
          interestType: 'flat',
          defaultTermMonths: 6,
          frequency: 'weekly',
          active: true
        }
      ]);
      console.log('✅ Default loan products created');
    } else {
      console.log('ℹ️  Loan products already exist');
    }

    console.log('\n✅ Seeding completed successfully');
    console.log('\n📝 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
