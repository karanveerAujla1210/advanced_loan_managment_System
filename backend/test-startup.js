import dotenv from 'dotenv';

console.log('=== Backend Startup Test ===\n');

// Test 1: Load environment
console.log('1. Loading environment variables...');
dotenv.config();
console.log('   ✅ dotenv loaded');

// Test 2: Check environment variables
console.log('\n2. Checking environment variables...');
console.log('   PORT:', process.env.PORT || 'NOT SET');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'SET ✅' : 'NOT SET ❌');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? 'SET ✅' : 'NOT SET ❌');
console.log('   NODE_ENV:', process.env.NODE_ENV || 'NOT SET');

// Test 3: Import database config
console.log('\n3. Testing database import...');
try {
  const { connectDB } = await import('./src/config/database.js');
  console.log('   ✅ database.js imported successfully');
  
  // Test 4: Connect to MongoDB
  console.log('\n4. Connecting to MongoDB...');
  await connectDB();
  
  console.log('\n✅ ALL TESTS PASSED - Backend is ready!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('\nFull error:', error);
  process.exit(1);
}
