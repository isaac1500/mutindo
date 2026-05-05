const { db } = require('../config/firebase');

const COLLECTION = 'rider_locations';

class Tracking {
  // Save rider location
  static async saveRiderLocation(riderId, orderId, lat, lng) {
    try {
      const locationRef = db.collection(COLLECTION).doc();
      const location = {
        riderId,
        orderId,
        lat,
        lng,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      await locationRef.set(location);
      return location;
    } catch (error) {
      throw new Error('Error saving rider location: ' + error.message);
    }
  }

  // Get latest rider location for order
  static async getLatestLocation(orderId) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('orderId', '==', orderId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      throw new Error('Error fetching rider location: ' + error.message);
    }
  }

  // Get location history for order
  static async getLocationHistory(orderId, limit = 50) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('orderId', '==', orderId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();
      
      const locations = [];
      snapshot.forEach(doc => {
        locations.push({ id: doc.id, ...doc.data() });
      });
      
      return locations.reverse();
    } catch (error) {
      throw new Error('Error fetching location history: ' + error.message);
    }
  }
}

module.exports = Tracking;
