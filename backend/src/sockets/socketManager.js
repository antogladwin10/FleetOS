import { Server } from 'socket.io';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // Join organization specific room for multi-tenant isolation
    socket.on('join:org', (orgId) => {
      if (orgId) {
        socket.join(`org:${orgId}`);
      }
    });

    socket.on('leave:org', (orgId) => {
      if (orgId) {
        socket.leave(`org:${orgId}`);
      }
    });

    // Driver live telemetry broadcast from browser geolocation
    socket.on('driver:telemetry', (data) => {
      if (data?.organizationId) {
        io.to(`org:${data.organizationId}`).emit('fleet:telemetry_update', data);
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

export const getIO = () => io;
