import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Settings, Admin } from './models/index.js';

export async function connectDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  await seedDefaults();
}

async function seedDefaults() {
  const settingsCount = await Settings.countDocuments();
  if (settingsCount === 0) {
    await Settings.create({});
  }

  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const hash = bcrypt.hashSync('admin123', 10);
    await Admin.create({ username: 'admin', password_hash: hash });
  }
}
