const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { db } = require('../config/firebase');

// Get user's addresses
router.get('/', authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection('addresses')
      .where('userId', '==', req.userId)
      .get();
    
    const addresses = [];
    snapshot.forEach(doc => {
      addresses.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Failed to fetch addresses' });
  }
});

// Save new address
router.post('/', authenticate, async (req, res) => {
  try {
    const { fullAddress, phone, label } = req.body;
    
    const address = {
      userId: req.userId,
      fullAddress,
      phone,
      label: label || 'Home',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('addresses').add(address);
    res.status(201).json({ id: docRef.id, ...address });
  } catch (error) {
    console.error('Save address error:', error);
    res.status(500).json({ message: 'Failed to save address' });
  }
});

module.exports = router;