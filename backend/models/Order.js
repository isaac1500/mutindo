const { db } = require('../config/firebase');

const COLLECTION = 'orders';

class Order {
  // Create a new order
  static async create(orderData) {
    try {
      const orderRef = db.collection(COLLECTION).doc();
      const order = {
        ...orderData,
        orderId: orderRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await orderRef.set(order);
      return order;
    } catch (error) {
      throw new Error('Error creating order: ' + error.message);
    }
  }

  // Get order by ID
  static async findById(orderId) {
    try {
      const doc = await db.collection(COLLECTION).doc(orderId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error('Error finding order: ' + error.message);
    }
  }

  // Get orders by customer ID
  static async findByCustomer(customerId) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const orders = [];
      snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return orders;
    } catch (error) {
      throw new Error('Error fetching customer orders: ' + error.message);
    }
  }

  // Get orders by rider ID
  static async findByRider(riderId) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('riderId', '==', riderId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const orders = [];
      snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return orders;
    } catch (error) {
      throw new Error('Error fetching rider orders: ' + error.message);
    }
  }

  // Get all orders (admin)
  static async findAll(filters = {}) {
    try {
      let query = db.collection(COLLECTION);
      
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      query = query.orderBy('createdAt', 'desc');
      
      const snapshot = await query.get();
      const orders = [];
      snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return orders;
    } catch (error) {
      throw new Error('Error fetching orders: ' + error.message);
    }
  }

  // Update order status
  static async updateStatus(orderId, status, additionalData = {}) {
    try {
      const orderRef = db.collection(COLLECTION).doc(orderId);
      const updates = {
        status: status,
        ...additionalData,
        updatedAt: new Date().toISOString()
      };
      
      // Add timestamps for specific statuses
      if (status === 'confirmed') {
        updates.confirmedAt = new Date().toISOString();
      } else if (status === 'preparing') {
        updates.preparingAt = new Date().toISOString();
      } else if (status === 'picked_up') {
        updates.pickedUpAt = new Date().toISOString();
      } else if (status === 'on_the_way') {
        updates.onTheWayAt = new Date().toISOString();
      } else if (status === 'delivered') {
        updates.deliveredAt = new Date().toISOString();
      } else if (status === 'cancelled') {
        updates.cancelledAt = new Date().toISOString();
      }
      
      await orderRef.update(updates);
      return { id: orderId, ...updates };
    } catch (error) {
      throw new Error('Error updating order status: ' + error.message);
    }
  }

  // Assign rider to order
  static async assignRider(orderId, riderId) {
    try {
      const orderRef = db.collection(COLLECTION).doc(orderId);
      const updates = {
        riderId: riderId,
        status: 'confirmed',
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await orderRef.update(updates);
      return { id: orderId, ...updates };
    } catch (error) {
      throw new Error('Error assigning rider: ' + error.message);
    }
  }

  // Get pending orders (for admin)
  static async getPendingOrders() {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'asc')
        .get();
      
      const orders = [];
      snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      return orders;
    } catch (error) {
      throw new Error('Error fetching pending orders: ' + error.message);
    }
  }

  // Get active orders (in progress)
  static async getActiveOrders() {
    try {
      const activeStatuses = ['confirmed', 'preparing', 'picked_up', 'on_the_way'];
      const orders = [];
      
      for (const status of activeStatuses) {
        const snapshot = await db.collection(COLLECTION)
          .where('status', '==', status)
          .orderBy('createdAt', 'desc')
          .get();
        
        snapshot.forEach(doc => {
          orders.push({ id: doc.id, ...doc.data() });
        });
      }
      
      // Sort by createdAt desc
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return orders;
    } catch (error) {
      throw new Error('Error fetching active orders: ' + error.message);
    }
  }

  // Update delivery location
  static async updateLocation(orderId, lat, lng) {
    try {
      const orderRef = db.collection(COLLECTION).doc(orderId);
      await orderRef.update({
        deliveryLat: lat,
        deliveryLng: lng,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      throw new Error('Error updating delivery location: ' + error.message);
    }
  }
}

module.exports = Order;
