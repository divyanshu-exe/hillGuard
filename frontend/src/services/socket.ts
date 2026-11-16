import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected to server, id:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO Client] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket.IO Client] Connection error:', error.message);
    });
  }
  return socket;
};
