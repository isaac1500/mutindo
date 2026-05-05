import io from 'socket.io-client';

let socket = null;
let isConnecting = false;

export const initSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }
  
  if (isConnecting) {
    return socket;
  }
  
  isConnecting = true;
  
  // Use the same port as your frontend (3001) for the WebSocket
  const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';
  console.log('Connecting to socket at:', socketUrl);
  
  socket = io(socketUrl, {
    transports: ['websocket', 'polling'], // Add polling as fallback
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    path: '/socket.io/' // Explicit path
  });
  
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    isConnecting = false;
  });
  
  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
    isConnecting = false;
  });
  
  socket.on('connect_error', (error) => {
    console.log('⚠️ Socket connection error:', error.message);
    isConnecting = false;
    // Don't show error to user - just log it
  });
  
  socket.on('reconnect', (attemptNumber) => {
    console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
  });
  
  socket.on('reconnect_failed', () => {
    console.log('❌ Socket reconnection failed');
    isConnecting = false;
  });
  
  return socket;
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    return initSocket();
  }
  return socket;
};

export const joinOrderRoom = (orderId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('join-order', orderId);
    console.log('Joined order room:', orderId);
  } else {
    console.log('Socket not connected, cannot join room - will retry');
    // Try again after a delay
    setTimeout(() => {
      const retrySocket = getSocket();
      if (retrySocket && retrySocket.connected) {
        retrySocket.emit('join-order', orderId);
        console.log('Retry: Joined order room:', orderId);
      }
    }, 1000);
  }
};

export const leaveOrderRoom = (orderId) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('leave-order', orderId);
    console.log('Left order room:', orderId);
  }
};

export const sendMessage = (orderId, message) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('send-message', { orderId, message });
    console.log('Message sent for order:', orderId);
  } else {
    console.log('Socket not connected, cannot send message');
  }
};

export const updateRiderLocation = (orderId, lat, lng) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('rider-location', { orderId, lat, lng });
  }
};

// Helper to check connection status
export const isSocketConnected = () => {
  return socket && socket.connected;
};