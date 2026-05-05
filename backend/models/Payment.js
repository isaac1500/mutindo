const { db } = require('../config/firebase');

const COLLECTION = 'payments';

class Payment {
  // Create a new payment record
  static async create(paymentData) {
    try {
      const paymentRef = db.collection(COLLECTION).doc();
      const payment = {
        ...paymentData,
        paymentId: paymentRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await paymentRef.set(payment);
      return payment;
    } catch (error) {
      throw new Error('Error creating payment: ' + error.message);
    }
  }

  // Get payment by order ID
  static async findByOrderId(orderId) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('orderId', '==', orderId)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      throw new Error('Error finding payment: ' + error.message);
    }
  }

  // Update payment status
  static async updateStatus(paymentId, status, additionalData = {}) {
    try {
      const paymentRef = db.collection(COLLECTION).doc(paymentId);
      const updates = {
        status: status,
        ...additionalData,
        updatedAt: new Date().toISOString()
      };
      await paymentRef.update(updates);
      return { id: paymentId, ...updates };
    } catch (error) {
      throw new Error('Error updating payment: ' + error.message);
    }
  }

  // Get payments by customer
  static async findByCustomer(customerId) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const payments = [];
      snapshot.forEach(doc => {
        payments.push({ id: doc.id, ...doc.data() });
      });
      return payments;
    } catch (error) {
      throw new Error('Error fetching payments: ' + error.message);
    }
  }
}

module.exports = Payment;
