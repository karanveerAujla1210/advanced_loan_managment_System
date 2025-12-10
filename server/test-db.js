require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

console.log('Testing MongoDB connection...');
console.log('URI:', MONGO_URI ? 'Set' : 'Not set');

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🔗 Connection state:', mongoose.connection.readyState);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });