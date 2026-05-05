const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // Join order room
    socket.on('join-order', (orderId) => {
      socket.join(`order-${orderId}`);
      console.log(`Socket ${socket.id} joined order-${orderId}`);
    });

    // Leave order room
    socket.on('leave-order', (orderId) => {
      socket.leave(`order-${orderId}`);
      console.log(`Socket ${socket.id} left order-${orderId}`);
    });

    // Send message
    socket.on('send-message', async (data) => {
      const { orderId, message, senderId, senderName, senderRole } = data;
      
      io.to(`order-${orderId}`).emit('new-message', {
        orderId,
        message,
        senderId,
        senderName,
        senderRole,
        timestamp: new Date().toISOString()
      });
    });

    // Rider location update
    socket.on('rider-location', (data) => {
      const { orderId, lat, lng, riderId } = data;
      
      io.to(`order-${orderId}`).emit('location-update', {
        riderId,
        lat,
        lng,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO
};