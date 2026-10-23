import mongoose from 'mongoose';
import User from '../models/User.js';
import { seedData } from '../utils/seed.js';

let memServer = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fleetos';

  // 1. Attempt connection to primary MongoDB
  try {
    console.log(`[DB] Attempting connection to MongoDB at: ${primaryUri}`);
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2500, // fast fail if local mongod is not running
    });
    console.log(`[DB] ✅ MongoDB connected: ${conn.connection.host}`);

    // Check if initial users exist, seed if completely empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[DB] No users found. Seeding initial demo data...');
      await seedData();
    }
    return;
  } catch (err) {
    console.warn(`[DB] Could not connect to local MongoDB (${err.message})`);
  }

  // 2. Fallback to MongoMemoryServer for effortless local dev
  try {
    console.log('[DB] 🚀 Starting in-memory MongoDB server (MongoMemoryServer)...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memServer = await MongoMemoryServer.create();
    const memUri = memServer.getUri();

    const conn = await mongoose.connect(memUri);
    console.log(`[DB] ✅ In-memory MongoDB connected: ${memUri}`);
    console.log('[DB] Seeding initial demo data into in-memory database...');
    await seedData();
  } catch (memErr) {
    console.error(`[DB] ❌ Failed to start in-memory MongoDB: ${memErr.message}`);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.info('[DB] MongoDB reconnected');
});

export const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (memServer) {
    await memServer.stop();
  }
};

export default connectDB;
