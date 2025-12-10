require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB connection...');
    console.log('📍 URI:', process.env.MONGO_URI.replace(/:[^:@]*@/, ':****@'));
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 Fix: Add your IP to MongoDB Atlas whitelist:');
      console.log('1. Go to https://cloud.mongodb.com/');
      console.log('2. Navigate to Network Access');
      console.log('3. Add IP Address: 0.0.0.0/0 (for development)');
    }
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected');
  }
}

testConnection();