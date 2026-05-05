const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { db } = require('../config/firebase');

// ============ PUBLIC ROUTES ============

// Get catering packages
router.get('/packages', async (req, res) => {
  try {
    const packages = [
      { id: 1, name: 'Basic Package', price: 50000, guests: '10-20', description: 'Perfect for small gatherings', includes: ['2 main dishes', '1 side dish', 'Soft drinks', 'Basic setup'] },
      { id: 2, name: 'Standard Package', price: 120000, guests: '30-50', description: 'Ideal for birthdays and parties', includes: ['3 main dishes', '2 side dishes', 'Dessert', 'Soft drinks', 'Full setup'] },
      { id: 3, name: 'Premium Package', price: 250000, guests: '70-100', description: 'Complete catering for large events', includes: ['5 main dishes', '3 side dishes', 'Dessert bar', 'Full drinks', 'Staff service', 'Decorations'] },
      { id: 4, name: 'Wedding Special', price: 500000, guests: '150+', description: 'All-inclusive wedding catering', includes: ['7 main dishes', '5 side dishes', 'Wedding cake', 'Full bar', 'Wait staff', 'Decorations', 'Tents & chairs'] }
    ];
    res.json({ success: true, packages });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch packages' });
  }
});

// Submit a catering booking (authenticated users)
router.post('/bookings', authenticate, async (req, res) => {
  try {
    const { eventType, eventDate, eventTime, guestCount, budget, specialRequests, phone, email, packageId, packageName } = req.body;
    
    const booking = {
      customerId: req.userId,
      customerName: req.user.name,
      customerEmail: req.user.email,
      eventType,
      eventDate,
      eventTime,
      guestCount: parseInt(guestCount),
      budget: budget ? parseInt(budget) : null,
      specialRequests: specialRequests || '',
      phone: phone || req.user.phone,
      email: email || req.user.email,
      packageId,
      packageName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('catering_bookings').add(booking);
    res.status(201).json({ 
      success: true, 
      message: 'Booking request submitted successfully',
      bookingId: docRef.id 
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

// Get customer's own bookings
router.get('/my-bookings', authenticate, async (req, res) => {
  try {
    const snapshot = await db.collection('catering_bookings')
      .where('customerId', '==', req.userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const bookings = [];
    snapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching my bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// ============ ADMIN ONLY ROUTES ============

// Get ALL catering bookings (admin only)
router.get('/admin/bookings', authenticate, authorize('admin'), async (req, res) => {
  try {
    const snapshot = await db.collection('catering_bookings')
      .orderBy('createdAt', 'desc')
      .get();
    
    const bookings = [];
    snapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, bookings });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// Get single booking (admin only)
router.get('/admin/bookings/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const doc = await db.collection('catering_bookings').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.json({ success: true, booking: { id: doc.id, ...doc.data() } });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booking' });
  }
});

// Update booking status (admin only)
router.put('/admin/bookings/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await db.collection('catering_bookings').doc(id).update({
      status,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Send quote for booking (admin only)
router.post('/admin/bookings/:id/quote', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, message } = req.body;
    
    await db.collection('catering_bookings').doc(id).update({
      quoteAmount: amount,
      quoteMessage: message,
      status: 'quoted',
      quotedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    res.json({ success: true, message: 'Quote sent successfully' });
  } catch (error) {
    console.error('Error sending quote:', error);
    res.status(500).json({ success: false, message: 'Failed to send quote' });
  }
});

module.exports = router;