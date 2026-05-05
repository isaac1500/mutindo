const Chat = require('../models/Chat');
const { db } = require('../config/firebase');

// Send message
const sendMessage = async (req, res) => {
  try {
    const { orderId, message } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const userName = req.user.name || (userRole === 'rider' ? 'Rider' : 'Customer');
    
    if (!orderId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and message are required'
      });
    }
    
    // Save to database
    const savedMessage = await Chat.saveMessage(orderId, userId, userRole, message);
    
    // Try to emit real-time if socket is available
    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      io.to('order-' + orderId).emit('new-message', {
        id: savedMessage.id,
        type: userRole,
        message: message,
        senderId: userId,
        senderName: userName,
        timestamp: savedMessage.createdAt
      });
    } catch (socketError) {
      console.log('Socket not available, skipping real-time update');
    }
    
    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: savedMessage
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// Get messages for order - SIMPLE VERSION without markAsRead
const getMessages = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { limit } = req.query;
    
    // Simple query without any filters that need indexes
    const snapshot = await db.collection('chat_messages')
      .where('orderId', '==', orderId)
      .get();
    
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort manually
    messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Apply limit
    const limitNum = parseInt(limit) || 100;
    const limitedMessages = messages.slice(-limitNum);
    
    res.json({
      success: true,
      count: limitedMessages.length,
      data: limitedMessages
    });
    
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message
    });
  }
};

// Get unread count - SIMPLE VERSION
const getUnreadCount = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const snapshot = await db.collection('chat_messages')
      .where('orderId', '==', orderId)
      .get();
    
    let unread = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.senderId !== req.user.userId && !data.read) {
        unread++;
      }
    });
    
    res.json({
      success: true,
      data: { unreadCount: unread }
    });
    
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getUnreadCount
};
