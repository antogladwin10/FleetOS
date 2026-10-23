/**
 * Quick DB connection test — run with: node src/utils/testDb.js
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fleetos';

console.log(`\nTesting connection to: ${URI}\n`);

try {
  await mongoose.connect(URI, { serverSelectionTimeoutMS: 5000 });
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
  console.error('\nMake sure MongoDB is running:');
  console.error('  1. Open PowerShell as Administrator');
  console.error('  2. Run: net start MongoDB\n');
  process.exit(1);
}
