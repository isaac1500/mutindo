const { db } = require('../config/firebase');

const COLLECTION = 'users';

class User {
  // Create a new user
  static async create(userData) {
    try {
      const userRef = db.collection(COLLECTION).doc();
      const user = {
        ...userData,
        userId: userRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await userRef.set(user);
      return { id: userRef.id, ...user };
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const snapshot = await db.collection(COLLECTION)
        .where('email', '==', email.toLowerCase())
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Find user by ID
  static async findById(userId) {
    try {
      const doc = await db.collection(COLLECTION).doc(userId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  // Find all users (for admin)
  static async findAll(filters = {}) {
    try {
      let query = db.collection(COLLECTION);
      
      if (filters.role) {
        query = query.where('role', '==', filters.role);
      }
      
      const snapshot = await query.get();
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      throw new Error(`Error finding users: ${error.message}`);
    }
  }

  // Update user
  static async update(userId, updateData) {
    try {
      const userRef = db.collection(COLLECTION).doc(userId);
      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      await userRef.update(updates);
      const updatedDoc = await userRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  // Delete user
  static async delete(userId) {
    try {
      await db.collection(COLLECTION).doc(userId).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
}

module.exports = User;