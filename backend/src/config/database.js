import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('🔗 Connection string:', uri.replace(/mongodb(\+srv)?:\/\/([^:]+):[^@]+@/, 'mongodb$1://$2:****@'));
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });

    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', conn.connection.name);
    console.log('📡 Host:', conn.connection.host);
    console.log('🔌 Port:', conn.connection.port);
    console.log('🔑 Database name:', conn.connection.db.databaseName);
    
    // Log any connection errors after initial connection
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('ℹ️ MongoDB disconnected');
    });
    
    return conn;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      codeName: error.codeName,
      reason: error.reason ? error.reason.message : 'No additional info',
    });
    process.exit(1);
  }
};
