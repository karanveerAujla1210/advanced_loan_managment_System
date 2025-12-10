#!/usr/bin/env node
// MongoDB Database Setup Script
require('dotenv').config();
const mongoose = require('mongoose');
const seedData = require('./seed');
const createIndexes = require('./indexes');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/loan_management';

const setupDatabase = async () => {
  try {
    console.log('🚀 Starting database setup...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    console.log('📊 Database:', mongoose.connection.name);

    // Create indexes
    console.log('📝 Creating indexes...');
    await createIndexes();

    // Seed data
    console.log('🌱 Seeding data...');
    await seedData();

    console.log('🎉 Database setup completed successfully!');
    console.log(`
    🔗 Connection: ${MONGO_URI}
    📊 Database: ${mongoose.connection.name}
    
    🚀 You can now start the application:
    npm run dev
    `);

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;