const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const ordersRoutes = require('./routes/orders');
const paymentsRoutes = require('./routes/payments');
const cateringRoutes = require('./routes/catering');
const addressRoutes = require('./routes/addresses');
const userRoutes = require('./routes/users');
const riderRoutes = require('./routes/riders');
const galleryRoutes = require('./routes/gallery');
const testimonialsRoutes = require('./routes/testimonials');
const imagesRoutes = require('./routes/images');
const contentRoutes = require('./routes/content');
const uploadRoutes = require('./routes/upload');

// Initialize Express app
const app = express();

// Import configurations
const { db } = require('./config/firebase');
const cloudinary = require('./config/cloudinary');
const { authenticate } = require('./middleware/auth');

// Get CORS origin from environment variable (Railway will set this)
const CORS_ORIGINS = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(new Date().toISOString() + ' - ' + req.method + ' ' + req.path);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      firestore: db ? 'connected' : 'disconnected',
      cloudinary: 'configured'
    }
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to Mutindo Catering Services API',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      menu: '/api/menu',
      orders: '/api/orders',
      catering: '/api/catering',
      gallery: '/api/gallery',
      testimonials: '/api/testimonials',
      users: '/api/users',
      riders: '/api/riders',
      chat: '/api/chat/:orderId',
      images: '/api/images',
      content: '/api/content',
      upload: '/api/upload'
    }
  });
});

// ============ ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/catering', cateringRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/images', imagesRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/upload', uploadRoutes);

// ============ CHAT ROUTES ============
// Get chat messages for an order
app.get('/api/chat/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('📨 GET /api/chat/' + orderId);
    
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const order = orderDoc.data();
    if (order.customerId !== req.userId && order.riderId !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const messagesSnapshot = await db.collection('chat_messages')
      .where('orderId', '==', orderId)
      .orderBy('timestamp', 'asc')
      .get();
    
    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.json({ success: true, messages: [] });
  }
});

// Send a message
app.post('/api/chat/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;
    console.log('💬 POST /api/chat/' + orderId, 'Message:', message);
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }
    
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const order = orderDoc.data();
    if (order.customerId !== req.userId && order.riderId !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    let senderRole = 'customer';
    if (req.user.role === 'admin') senderRole = 'admin';
    else if (order.riderId === req.userId) senderRole = 'rider';
    
    const messageData = {
      orderId,
      senderId: req.userId,
      senderName: req.user.name,
      senderRole,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const docRef = await db.collection('chat_messages').add(messageData);
    
    await db.collection('orders').doc(orderId).update({
      lastMessage: message.trim(),
      lastMessageAt: new Date().toISOString(),
      lastMessageBy: req.user.name
    });
    
    res.status(201).json({
      success: true,
      message: { id: docRef.id, ...messageData }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Mark messages as read
app.put('/api/chat/:orderId/read', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const messagesSnapshot = await db.collection('chat_messages')
      .where('orderId', '==', orderId)
      .where('senderId', '!=', req.userId)
      .where('read', '==', false)
      .get();
    
    const batch = db.batch();
    messagesSnapshot.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });
    
    await batch.commit();
    
    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark messages as read' });
  }
});

// Get unread message count
app.get('/api/chat/:orderId/unread', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const messagesSnapshot = await db.collection('chat_messages')
      .where('orderId', '==', orderId)
      .where('senderId', '!=', req.userId)
      .where('read', '==', false)
      .get();
    
    res.json({
      success: true,
      unreadCount: messagesSnapshot.size
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ success: false, message: 'Failed to get unread count' });
  }
});

// ============ TEST ROUTES ============
app.get('/api/test-firebase', async (req, res) => {
  try {
    await db.collection('test').doc('connection-test').set({
      message: 'Firebase connection working!',
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Firebase connection successful'
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    res.status(500).json({
      success: false,
      message: 'Firebase connection failed',
      error: error.message
    });
  }
});

app.get('/api/test-cloudinary', async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({
      success: true,
      message: 'Cloudinary connection successful',
      data: result
    });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    res.status(500).json({
      success: false,
      message: 'Cloudinary connection failed',
      error: error.message
    });
  }
});

// ============ 404 HANDLER ============
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.method} ${req.path} not found`
  });
});

// ============ ERROR HANDLING MIDDLEWARE ============
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export app for server.js to use
module.exports = app;