import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

console.log('=== Testing Server Imports ===\n');

dotenv.config();

const app = express();
console.log('✅ Express initialized');

app.use(helmet());
console.log('✅ Helmet loaded');

app.use(cors());
console.log('✅ CORS loaded');

app.use(express.json());
console.log('✅ JSON parser loaded');

app.use(morgan('dev'));
console.log('✅ Morgan loaded');

// Test database
console.log('\n=== Testing Database ===');
const { connectDB } = await import('./src/config/database.js');
console.log('✅ Database module imported');
await connectDB();

// Test routes
console.log('\n=== Testing Route Imports ===');
try {
  const authRoutes = await import('./src/routes/auth.js');
  console.log('✅ auth.js');
  
  const borrowerRoutes = await import('./src/routes/borrowers.js');
  console.log('✅ borrowers.js');
  
  const loanRoutes = await import('./src/routes/loans.js');
  console.log('✅ loans.js');
  
  const paymentRoutes = await import('./src/routes/payments.js');
  console.log('✅ payments.js');
  
  const productRoutes = await import('./src/routes/products.js');
  console.log('✅ products.js');
  
  const userRoutes = await import('./src/routes/users.js');
  console.log('✅ users.js');
  
  console.log('\n=== Testing Error Handler ===');
  const { errorHandler } = await import('./src/middleware/errorHandler.js');
  console.log('✅ errorHandler.js');
  
  console.log('\n✅ ALL IMPORTS SUCCESSFUL - Server can start!');
  process.exit(0);
} catch (error) {
  console.error('\n❌ IMPORT ERROR:', error.message);
  console.error('\nFile:', error.stack);
  process.exit(1);
}
