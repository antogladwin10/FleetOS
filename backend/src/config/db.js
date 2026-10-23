import mongoose from 'mongoose';
import User from '../models/User.js';
import { seedData } from '../utils/seed.js';

let memServer = null;

/**
 * Safely masks database credentials from connection strings for logging.
 * Example: mongodb+srv://admin:pass123@cluster.mongodb.net/fleetos -> mongodb+srv://admin:****@cluster.mongodb.net/fleetos
 */
export const maskMongoUri = (uri) => {
  if (!uri) return '[NOT_CONFIGURED]';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:@\s]+):([^@\s]+)@/i, '$1:****@');
};

export const ensureDatabaseInUri = (uri, defaultDb = 'fleetos') => {
  if (!uri) return uri;
  try {
    const parsed = new URL(uri);
    if (!parsed.pathname || parsed.pathname === '/') {
      parsed.pathname = `/${defaultDb}`;
      return parsed.toString();
    }
    return uri;
  } catch {
    return uri;
  }
};

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
  // Primary environment variable used across FleetOS, with fallback to MONGODB_URI
  const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const primaryUri = ensureDatabaseInUri(rawUri, 'fleetos');

  // 1. Production Mode: Must connect to remote MongoDB Atlas. NO silent in-memory fallback!
  if (isProduction) {
    const isLocalhost = primaryUri && (primaryUri.includes('127.0.0.1') || primaryUri.includes('localhost'));
    if (!primaryUri || isLocalhost) {
      console.error('\n[DB] ❌ FATAL ERROR: Invalid or missing MongoDB URI in production.');
      if (isLocalhost) {
        console.error(`[DB] Received localhost URI (${maskMongoUri(primaryUri)}), but production requires a remote MongoDB Atlas cluster.`);
      } else {
        console.error('[DB] No connection string provided in environment variables.');
      }
      console.error('[DB] Please set the "MONGO_URI" environment variable in your Render Dashboard.');
      console.error('[DB] Format: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/fleetos?retryWrites=true&w=majority\n');
      await new Promise((resolve) => setTimeout(resolve, 500));
      process.exit(1);
    }

    try {
      console.log(`[DB] 🔌 Connecting to production MongoDB Atlas: ${maskMongoUri(primaryUri)}`);
      const conn = await mongoose.connect(primaryUri, {
        dbName: 'fleetos', // Enforces intended fleetos database even if URI omits path
        serverSelectionTimeoutMS: 10000, // 10s timeout for remote Atlas connections
      });
      console.log(`[DB] ✅ MongoDB Atlas connected successfully: ${conn.connection.host}`);
      console.log(`[DB] 📂 Active Database: ${conn.connection.name}`);

      // Auto-seed initial demo accounts if the database is newly initialized and empty
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('[DB] 🌱 Database is empty. Seeding initial demo accounts into MongoDB Atlas...');
        await seedData();
        console.log('[DB] ✅ Demo accounts seeded successfully into Atlas.');
      }
      return;
    } catch (err) {
      console.error(`\n[DB] ❌ Failed to connect to MongoDB Atlas (${maskMongoUri(primaryUri)})`);
      console.error(`[DB] Error Name: ${err.name}`);
      console.error(`[DB] Error details: ${err.message}`);
      if (err.reason) {
        console.error(`[DB] Topology Reason: ${JSON.stringify(err.reason)}`);
      }
      console.error('[DB] 🚨 Fallback to MongoMemoryServer is DISABLED in production.');
      console.error('[DB] Common causes & resolutions:');
      console.error('  1. Atlas Network Access: Whitelist IP "0.0.0.0/0" (Allow Access from Anywhere) in Atlas.');
      console.error('  2. Verify database username and password in Render environment variables.');
      console.error('  3. URL-encode special characters in your password (e.g., replace @ with %40).');
      console.error('  4. Ensure the database name is provided in the connection string (e.g., /fleetos).\n');
      // Give asynchronous standard output and error streams time to flush before process exit
      await new Promise((resolve) => setTimeout(resolve, 500));
      process.exit(1);
    }
  }

  // 2. Development / Test Mode: Connect to configured URI or local MongoDB
  const devUri = primaryUri || 'mongodb://127.0.0.1:27017/fleetos';
  const isRemote = devUri.startsWith('mongodb+srv://') || (!devUri.includes('127.0.0.1') && !devUri.includes('localhost'));

  try {
    console.log(`[DB] Attempting connection to MongoDB at: ${maskMongoUri(devUri)}`);
    const conn = await mongoose.connect(devUri, {
      serverSelectionTimeoutMS: isRemote ? 10000 : 2500,
    });
    console.log(`[DB] ✅ MongoDB connected: ${conn.connection.host}`);

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[DB] No users found. Seeding initial demo data...');
      await seedData();
    }
    return;
  } catch (err) {
    if (isRemote) {
      console.error(`[DB] ❌ Failed to connect to remote MongoDB URI (${maskMongoUri(devUri)}): ${err.message}`);
      process.exit(1);
    }
    console.warn(`[DB] Could not connect to local MongoDB (${err.message})`);
  }

  // 3. Fallback to MongoMemoryServer (ONLY for local development if local mongod is not installed/running)
  try {
    console.log('[DB] 🚀 Starting in-memory MongoDB server (MongoMemoryServer) for local dev...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memServer = await MongoMemoryServer.create();
    const memUri = memServer.getUri();

    const conn = await mongoose.connect(memUri);
    console.log(`[DB] ✅ In-memory MongoDB connected: ${maskMongoUri(memUri)}`);
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
