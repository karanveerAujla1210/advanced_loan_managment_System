import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../mongoose-models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    await mongoose.disconnect();
    console.log('Seeding completed');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
