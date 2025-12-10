import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import borrowerRoutes from './routes/borrowers.js';
import loanRoutes from './routes/loans.js';
import paymentRoutes from './routes/payments.js';
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();
console.log('🔧 Environment loaded');
console.log('📦 PORT:', process.env.PORT || 3001);
console.log('📊 MONGODB_URI:', process.env.MONGODB_URI ? 'Set ✅' : 'Missing ❌');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Connect to MongoDB
await connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/borrowers', borrowerRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API ready: http://localhost:${PORT}/api`);
});
