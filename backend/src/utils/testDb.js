/**
 * Quick DB connection test — run with: node src/utils/testDb.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fleetos';

const maskMongoUri = (uri) => {
  if (!uri) return '[NOT_CONFIGURED]';
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:@\s]+):([^@\s]+)@/i, '$1:****@');
};

console.log(`\nTesting connection to: ${maskMongoUri(URI)}\n`);

try {
  await mongoose.connect(URI, { serverSelectionTimeoutMS: 10000 });
  console.log('✅ MongoDB connected successfully!');
  console.log(`   Host    : ${mongoose.connection.host}`);
  console.log(`   Port    : ${mongoose.connection.port}`);
  console.log(`   DB name : ${mongoose.connection.name}`);
  console.log(`   State   : ${mongoose.connection.readyState === 1 ? 'connected' : 'unknown'}\n`);
  await mongoose.connection.close();
  console.log('Connection closed. Ready to start the server! 🚀\n');
  process.exit(0);
} catch (err) {
  console.error('❌ Connection failed:', err.message);
  if (URI.includes('127.0.0.1') || URI.includes('localhost')) {
    console.error('\nMake sure MongoDB is running:');
    console.error('  1. Open PowerShell as Administrator');
    console.error('  2. Run: net start MongoDB\n');
  } else {
    console.error('\nMake sure MongoDB Atlas is accessible:');
    console.error('  1. Whitelist 0.0.0.0/0 in Atlas Network Access');
    console.error('  2. Check username, password, and database name in MONGO_URI\n');
  }
  process.exit(1);
}
