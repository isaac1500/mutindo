const { db } = require('../config/firebase');

const COLLECTION = 'menu';

class MenuItem {
  static async findAll(filters = {}) {
    try {
      let query = db.collection(COLLECTION);
      
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      
      if (filters.available !== undefined) {
        query = query.where('available', '==', filters.available);
      }
      
      const snapshot = await query.get();
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      return items;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return []; // Return empty array on error
    }
  }
  
  static async findById(id) {
    try {
      const doc = await db.collection(COLLECTION).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error fetching menu item:', error);
      return null;
    }
  }
  
  static async create(itemData) {
    try {
      const docRef = await db.collection(COLLECTION).add({
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      const doc = await docRef.get();
      return { id: docRef.id, ...doc.data() };
    } catch (error) {
      throw new Error(`Error creating menu item: ${error.message}`);
    }
  }
  
  static async update(id, updateData) {
    try {
      await db.collection(COLLECTION).doc(id).update({
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      return this.findById(id);
    } catch (error) {
      throw new Error(`Error updating menu item: ${error.message}`);
    }
  }
  
  static async delete(id) {
    try {
      await db.collection(COLLECTION).doc(id).delete();
      return true;
    } catch (error) {
      throw new Error(`Error deleting menu item: ${error.message}`);
    }
  }
}

module.exports = MenuItem;