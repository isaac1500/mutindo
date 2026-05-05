const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { db } = require('../config/firebase');

// Get messages for an order
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('📨 GET /api/chat/' + orderId);
    
    // Verify user has access to this order
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const order = orderDoc.data();
    if (order.customerId !== req.userId && order.riderId !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Get messages from Firebase - REMOVED orderBy to avoid index requirement
    const messagesSnapshot = await db.collection('chat_messages')
      .where('orderId', '==', orderId)
      .get();
    
    const messages = [];
    messagesSnapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort messages manually by timestamp (works without index)
    messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    console.log(`📨 Found ${messages.length} messages for order ${orderId}`);
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.json({ success: true, messages: [] });
  }
});

// Send a message
router.post('/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message } = req.body;
    console.log('💬 POST /api/chat/' + orderId, 'Message:', message);
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }
    
    // Verify user has access to this order
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    const order = orderDoc.data();
    if (order.customerId !== req.userId && order.riderId !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Determine sender role
    let senderRole = 'customer';
    if (req.user.role === 'admin') senderRole = 'admin';
    else if (order.riderId === req.userId) senderRole = 'rider';
    
    // Create message in Firebase
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
    
    // Also update order's last message
    await db.collection('orders').doc(orderId).update({
      lastMessage: message.trim(),
      lastMessageAt: new Date().toISOString(),
      lastMessageBy: req.user.name
    });
    
    console.log('💬 Message saved with ID:', docRef.id);
    
    res.status(201).json({
      success: true,
      message: { id: docRef.id, ...messageData }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

module.exports = router;