import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const getSocket = () => {
  if (typeof window === 'undefined') return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log(`[Socket.IO Client] Connected to server: ${socket.id}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO Client] Disconnected: ${reason}`);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO Client] Connection error:', err.message);
    });
  }

  return socket;
};

export const subscribeToExecution = (executionId, callbacks = {}) => {
  const s = getSocket();
  if (!s || !executionId) return () => {};

  s.emit('join:execution', executionId);

  if (callbacks.onLog) s.on('execution:log', callbacks.onLog);
  if (callbacks.onNodeStatus) s.on('execution:node_status', callbacks.onNodeStatus);
  if (callbacks.onStatusChange) s.on('execution:status_change', callbacks.onStatusChange);

  return () => {
    s.emit('leave:execution', executionId);
    if (callbacks.onLog) s.off('execution:log', callbacks.onLog);
    if (callbacks.onNodeStatus) s.off('execution:node_status', callbacks.onNodeStatus);
    if (callbacks.onStatusChange) s.off('execution:status_change', callbacks.onStatusChange);
  };
};

export const subscribeToNotifications = (userId, onNotification) => {
  const s = getSocket();
  if (!s) return () => {};

  if (userId) {
    s.emit('join:user', userId);
  }

  if (onNotification) {
    s.on('notification:new', onNotification);
    s.on('notification:broadcast', onNotification);
  }

  return () => {
    if (onNotification) {
      s.off('notification:new', onNotification);
      s.off('notification:broadcast', onNotification);
    }
  };
};
