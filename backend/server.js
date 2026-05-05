require('dotenv').config();
const app = require('./app');
const http = require('http');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const { initSocket } = require('./config/socket');
const io = initSocket(server);

// Make io accessible to routes
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log('==================================================');
  console.log('🚀 Mutindo Catering Services Server Started');
  console.log('==================================================');
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🏥 Health check: /health`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 Socket.IO: Ready for real-time connections`);
  console.log('==================================================');
  console.log('');
  console.log('✅ Services Status:');
  console.log('   - Firebase: Initialized');
  console.log('   - Cloudinary: Configured');
  console.log('   - Socket.IO: Active');
  console.log('   - Server: Ready for connections');
  console.log('==================================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = { server, io };