const { db } = require('../config/firebase');

const COLLECTION = 'catering_bookings';

class CateringBooking {
  static async create(bookingData) {
    try {
      const bookingRef = db.collection(COLLECTION).doc();
      const booking = {
        ...bookingData,
        bookingId: bookingRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await bookingRef.set(booking);
      return booking;
    } catch (error) {
      throw new Error('Error creating booking: ' + error.message);
    }
  }

  static async findAll(filters = {}) {
    try {
      let query = db.collection(COLLECTION);
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      const snapshot = await query.get();
      const bookings = [];
      snapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return bookings;
    } catch (error) {
      throw new Error('Error fetching bookings: ' + error.message);
    }
  }

  static async findById(bookingId) {
    try {
      const doc = await db.collection(COLLECTION).doc(bookingId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error('Error finding booking: ' + error.message);
    }
  }

  static async findByEmail(email) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('customerEmail', '==', email.toLowerCase())
        .get();
      const bookings = [];
      snapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data() });
      });
      bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return bookings;
    } catch (error) {
      throw new Error('Error fetching bookings by email: ' + error.message);
    }
  }

  static async updateStatus(bookingId, status, additionalData = {}) {
    try {
      const bookingRef = db.collection(COLLECTION).doc(bookingId);
      const updates = {
        status: status,
        ...additionalData,
        updatedAt: new Date().toISOString()
      };
      if (status === 'quote_sent') {
        updates.quoteSentAt = new Date().toISOString();
      } else if (status === 'confirmed') {
        updates.confirmedAt = new Date().toISOString();
      }
      await bookingRef.update(updates);
      return { id: bookingId, ...updates };
    } catch (error) {
      throw new Error('Error updating booking status: ' + error.message);
    }
  }

  static async sendQuote(bookingId, quoteAmount, quoteDetails) {
    try {
      const bookingRef = db.collection(COLLECTION).doc(bookingId);
      const updates = {
        quoteAmount: quoteAmount,
        quoteDetails: quoteDetails,
        status: 'quote_sent',
        quoteSentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await bookingRef.update(updates);
      return { id: bookingId, ...updates };
    } catch (error) {
      throw new Error('Error sending quote: ' + error.message);
    }
  }
}

module.exports = CateringBooking;
