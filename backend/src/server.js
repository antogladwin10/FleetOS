import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './sockets/socketManager.js';

const PORT = process.env.PORT || 5000;

// ─── Startup environment validation ──────────────────────────────────────────
// Run before any async work so missing secrets appear clearly in logs.
const REQUIRED_ENV = [
  { key: 'JWT_SECRET',         description: 'Access-token signing secret (jsonwebtoken)' },
  { key: 'JWT_REFRESH_SECRET', description: 'Refresh-token signing secret (jsonwebtoken)' },
  { key: 'COOKIE_SECRET',      description: 'Signed-cookie secret (cookie-parser)' },
];

const missingEnv = REQUIRED_ENV.filter(({ key }) => !process.env[key] || process.env[key].trim() === '');

if (missingEnv.length > 0) {
  console.error('\n[Server] ❌ FATAL: Missing required environment variables:');
  missingEnv.forEach(({ key, description }) =>
    console.error(`  • ${key.padEnd(22)} — ${description}`)
  );
  console.error('\n[Server] Set these variables in the Render Dashboard → Environment tab.');
  console.error('[Server] Never hardcode secrets in source code or commit them to Git.\n');
  process.exit(1);
}


const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`\n🚀 FleetOS API running on port ${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   API base    : http://localhost:${PORT}/api/v1\n`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n[Server] ${signal} received — shutting down gracefully...`);
    server.close(async () => {
      const mongoose = (await import('mongoose')).default;
      await mongoose.connection.close();
      console.log('[Server] HTTP server and DB closed');
      process.exit(0);
    });

    // Force kill after 10s
    setTimeout(() => {
      console.error('[Server] Could not close connections in time — forcefully exiting');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (err) => {
    console.error('[Server] Unhandled Promise Rejection:', err);
    shutdown('unhandledRejection');
  });
};

startServer();
