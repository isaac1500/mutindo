const { db } = require('../config/firebase');

const COLLECTION = 'chat_messages';

class Chat {
  // Save a message
  static async saveMessage(orderId, senderId, senderType, message) {
    try {
      const messageRef = db.collection(COLLECTION).doc();
      const chatMessage = {
        orderId,
        senderId,
        senderType,
        message,
        read: false,
        createdAt: new Date().toISOString()
      };
      await messageRef.set(chatMessage);
      return { id: messageRef.id, ...chatMessage };
    } catch (error) {
      throw new Error('Error saving message: ' + error.message);
    }
  }

  // Get messages for an order - SIMPLE
  static async getMessages(orderId, limit = 100) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('orderId', '==', orderId)
        .get();
      
      const messages = [];
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      
      messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return messages.slice(-limit);
    } catch (error) {
      throw new Error('Error fetching messages: ' + error.message);
    }
  }

  // Mark messages as read - SIMPLE (optional)
  static async markAsRead(orderId, userId) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('orderId', '==', orderId)
        .get();
      
      const batch = db.batch();
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.senderId !== userId && !data.read) {
          batch.update(doc.ref, { read: true });
        }
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.log('Mark as read error:', error.message);
      return false;
    }
  }

  // Get unread count
  static async getUnreadCount(orderId, userId) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('orderId', '==', orderId)
        .get();
      
      let count = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.senderId !== userId && !data.read) {
          count++;
        }
      });
      
      return count;
    } catch (error) {
      throw new Error('Error getting unread count: ' + error.message);
    }
  }
}

module.exports = Chat;
