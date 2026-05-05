require('dotenv').config();
const app = require('./app');
const http = require('http');
const dotenv = require('dotenv');
const { initSocket } = require('./config/socket');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

// ===== ADD CONTENT ROUTES HERE =====
const contentRoutes = require('./routes/contentRoutes');
app.use('/api/content', contentRoutes);
// ===================================

// Start server
server.listen(PORT, () => {
  console.log('=' .repeat(50));
  console.log('🚀 Mutindo Catering Services Server Started');
  console.log('=' .repeat(50));
  console.log('📡 Server running on: http://localhost:' + PORT);
  console.log('🏥 Health check: http://localhost:' + PORT + '/health');
  console.log('🔧 Environment: ' + (process.env.NODE_ENV || 'development'));
  console.log('🔌 Socket.IO: Ready for real-time connections');
  console.log('=' .repeat(50));
  console.log('\n✅ Services Status:');
  console.log('   - Firebase: Initialized');
  console.log('   - Cloudinary: Configured');
  console.log('   - Socket.IO: Active');
  console.log('   - Server: Ready for connections');
  console.log('=' .repeat(50));
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