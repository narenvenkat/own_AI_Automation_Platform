import { Server } from 'socket.io';
import { env } from './env.js';

let ioInstance = null;

export const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
          origin === env.CLIENT_URL ||
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.endsWith('.vercel.app')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    pingTimeout: 60000,
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join specific execution room for live timeline updates
    socket.on('join:execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
        console.log(`[Socket.IO] ${socket.id} joined execution:${executionId}`);
      }
    });

    // Leave execution room
    socket.on('leave:execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
        console.log(`[Socket.IO] ${socket.id} left execution:${executionId}`);
      }
    });

    // Join user notification channel
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`[Socket.IO] ${socket.id} joined user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    console.warn('[Socket.IO] Instance requested before initialization, returning mock/noop emitter');
    return {
      to: () => ({ emit: () => {} }),
      emit: () => {},
    };
  }
  return ioInstance;
};

export const emitExecutionEvent = (executionId, eventName, payload) => {
  const io = getIO();
  io.to(`execution:${executionId}`).emit(eventName, payload);
  // Also emit globally for dashboard live counters
  io.emit('execution:event', { executionId, eventName, payload });
};

export const emitNotification = (userId, notification) => {
  const io = getIO();
  if (userId) {
    io.to(`user:${userId}`).emit('notification:new', notification);
  }
  io.emit('notification:broadcast', notification);
};
