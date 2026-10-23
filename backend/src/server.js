import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './sockets/socketManager.js';

const PORT = process.env.PORT || 5000;

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
