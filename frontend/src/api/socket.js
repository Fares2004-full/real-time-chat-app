import { io } from 'socket.io-client';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

let socket = null;

export function connectSocket(userId) {
  if (socket) socket.disconnect();
  socket = io(baseURL, {
    auth: { userId },
    autoConnect: true
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
}
