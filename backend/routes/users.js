const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    
    const users = [];
    snapshot.forEach(doc => {
      const userData = doc.data();
      // Remove password from response
      delete userData.password;
      users.push({ id: doc.id, ...userData });
    });
    
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

// Get single user
router.get('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const doc = await db.collection('users').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const userData = doc.data();
    delete userData.password;
    
    res.json({
      success: true,
      user: { id: doc.id, ...userData }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch user' 
    });
  }
});

// Update user role (admin only)
router.put('/:id/role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['customer', 'rider', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role' 
      });
    }
    
    await db.collection('users').doc(req.params.id).update({
      role: role,
      updatedAt: new Date().toISOString()
    });
    
    const updatedDoc = await db.collection('users').doc(req.params.id).get();
    const userData = updatedDoc.data();
    delete userData.password;
    
    res.json({
      success: true,
      message: 'User role updated',
      user: { id: updatedDoc.id, ...userData }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user role' 
    });
  }
});

// Deactivate/Activate user
router.put('/:id/toggle-status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    
    await db.collection('users').doc(req.params.id).update({
      isActive: isActive,
      updatedAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user status' 
    });
  }
});

module.exports = router;