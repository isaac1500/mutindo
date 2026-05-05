const { db } = require('../config/firebase');

const COLLECTION = 'catering_packages';

class CateringPackage {
  static async create(packageData) {
    try {
      const packageRef = db.collection(COLLECTION).doc();
      const pkg = {
        ...packageData,
        packageId: packageRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await packageRef.set(pkg);
      return pkg;
    } catch (error) {
      throw new Error('Error creating package: ' + error.message);
    }
  }

  static async findAll() {
    try {
      const snapshot = await db.collection(COLLECTION).get();
      const packages = [];
      snapshot.forEach(doc => {
        packages.push({ id: doc.id, ...doc.data() });
      });
      return packages;
    } catch (error) {
      throw new Error('Error fetching packages: ' + error.message);
    }
  }

  static async findById(packageId) {
    try {
      const doc = await db.collection(COLLECTION).doc(packageId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      throw new Error('Error finding package: ' + error.message);
    }
  }

  static async update(packageId, updateData) {
    try {
      const packageRef = db.collection(COLLECTION).doc(packageId);
      const updates = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      await packageRef.update(updates);
      return { id: packageId, ...updates };
    } catch (error) {
      throw new Error('Error updating package: ' + error.message);
    }
  }

  static async delete(packageId) {
    try {
      await db.collection(COLLECTION).doc(packageId).delete();
      return true;
    } catch (error) {
      throw new Error('Error deleting package: ' + error.message);
    }
  }
}

module.exports = CateringPackage;
