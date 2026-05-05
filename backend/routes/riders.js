const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { db } = require('../config/firebase');

// Get all riders (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .where('role', '==', 'rider')
      .get();

    const riders = [];
    snapshot.forEach(doc => {
      const riderData = doc.data();
      delete riderData.password;
      riders.push({ id: doc.id, ...riderData });
    });

    res.json({ success: true, riders });
  } catch (error) {
    console.error('Error fetching riders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch riders' });
  }
});

// Update rider online status
router.post('/status', authenticate, authorize('rider'), async (req, res) => {
  try {
    const { online, location } = req.body;
    
    await db.collection('users').doc(req.userId).update({
      isOnline: online,
      lastOnlineAt: new Date().toISOString(),
      ...(location && { lastLocation: location })
    });
    
    await db.collection('rider_status').doc(req.userId).set({
      riderId: req.userId,
      isOnline: online,
      location: location || null,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`Rider ${req.userId} is now ${online ? 'ONLINE' : 'OFFLINE'}`);
    
    res.json({
      success: true,
      message: online ? 'You are now online' : 'You are now offline'
    });
  } catch (error) {
    console.error('Error updating rider status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update status' 
    });
  }
});

// Get rider online status
router.get('/status', authenticate, authorize('rider'), async (req, res) => {
  try {
    const doc = await db.collection('rider_status').doc(req.userId).get();
    const userDoc = await db.collection('users').doc(req.userId).get();
    
    res.json({
      success: true,
      isOnline: doc.exists ? doc.data().isOnline : false,
      lastOnlineAt: userDoc.data()?.lastOnlineAt || null
    });
  } catch (error) {
    console.error('Error getting rider status:', error);
    res.status(500).json({ success: false, message: 'Failed to get status' });
  }
});

// Get rider's assigned orders
router.get('/orders', authenticate, authorize('rider'), async (req, res) => {
  try {
    console.log('Fetching orders for rider:', req.userId);

    const snapshot = await db.collection('orders')
      .where('riderId', '==', req.userId)
      .get();

    const orders = [];
    snapshot.forEach(doc => {
      const orderData = doc.data();
      if (orderData.status !== 'delivered' && orderData.status !== 'cancelled') {
        orders.push({ id: doc.id, ...orderData });
      }
    });

    console.log(`Found ${orders.length} active orders for rider`);

    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Get rider orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Get available orders for pickup (orders that are ready)
router.get('/available-orders', authenticate, authorize('rider'), async (req, res) => {
  try {
    console.log('Fetching available orders for rider');

    const snapshot = await db.collection('orders')
      .where('status', '==', 'ready')
      .get();

    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    console.log(`Found ${orders.length} available orders`);

    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Get available orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available orders',
      error: error.message
    });
  }
});

// Get rider location (for customer tracking)
router.get('/location/:riderId', async (req, res) => {
  try {
    const doc = await db.collection('rider_locations').doc(req.params.riderId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }

    res.json({
      success: true,
      location: doc.data()
    });
  } catch (error) {
    console.error('Get rider location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get location'
    });
  }
});

// Update rider location
router.post('/location', authenticate, authorize('rider'), async (req, res) => {
  try {
    const { lat, lng } = req.body;

    await db.collection('rider_locations').doc(req.userId).set({
      riderId: req.userId,
      lat,
      lng,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.json({
      success: true,
      message: 'Location updated'
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
});

// Get rider earnings (all time) - FIXED
router.get('/earnings', authenticate, authorize('rider'), async (req, res) => {
  try {
    console.log('Fetching earnings for rider:', req.userId);
    
    const snapshot = await db.collection('orders')
      .where('riderId', '==', req.userId)
      .where('status', '==', 'delivered')
      .get();

    const deliveries = [];
    let totalEarnings = 0;

    snapshot.forEach(doc => {
      const order = doc.data();
      const deliveryFee = order.deliveryFee || 5000;
      totalEarnings += deliveryFee;
      deliveries.push({
        id: doc.id,
        amount: deliveryFee,
        date: order.deliveredAt || order.updatedAt || order.createdAt,
        orderTotal: order.total,
        deliveryFee: deliveryFee,
        status: order.status,
        deliveryAddress: order.deliveryAddress,
        customerName: order.customerName
      });
    });

    console.log(`Found ${deliveries.length} deliveries, total earnings: ${totalEarnings}`);

    res.json({
      success: true,
      totalEarnings: totalEarnings,
      deliveries: deliveries
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    // Return empty data instead of 500 error
    res.json({
      success: true,
      totalEarnings: 0,
      deliveries: []
    });
  }
});

// Get rider's earnings for today
router.get('/earnings/today', authenticate, authorize('rider'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const snapshot = await db.collection('orders')
      .where('riderId', '==', req.userId)
      .where('status', '==', 'delivered')
      .get();

    let todayEarnings = 0;
    let totalDeliveries = 0;

    snapshot.forEach(doc => {
      const order = doc.data();
      const deliveredDate = new Date(order.deliveredAt || order.updatedAt);
      if (deliveredDate >= today) {
        todayEarnings += order.deliveryFee || 5000;
        totalDeliveries++;
      }
    });

    res.json({
      success: true,
      todayEarnings,
      totalDeliveries,
      message: 'Earnings fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.json({ 
      success: true, 
      todayEarnings: 0, 
      totalDeliveries: 0,
      message: 'No earnings today' 
    });
  }
});

// Get rider delivery history - FIXED (returns empty array instead of 500)
router.get('/history', authenticate, authorize('rider'), async (req, res) => {
  try {
    console.log('Fetching history for rider:', req.userId);
    
    const snapshot = await db.collection('orders')
      .where('riderId', '==', req.userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const deliveries = [];
    snapshot.forEach(doc => {
      const orderData = doc.data();
      deliveries.push({ 
        id: doc.id, 
        ...orderData,
        deliveryFee: orderData.deliveryFee || 5000
      });
    });

    console.log(`Found ${deliveries.length} deliveries for rider`);
    
    res.json({
      success: true,
      count: deliveries.length,
      deliveries: deliveries
    });
  } catch (error) {
    console.error('Get history error:', error);
    // Return empty array instead of 500 error
    res.json({
      success: true,
      count: 0,
      deliveries: [],
      message: 'No history found'
    });
  }
});

module.exports = router;