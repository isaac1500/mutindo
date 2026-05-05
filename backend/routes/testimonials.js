const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { db } = require('../config/firebase');

// Get all testimonials (public - shows both verified and unverified for now)
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('testimonials')
      .orderBy('createdAt', 'desc')
      .get();
    
    const testimonials = [];
    snapshot.forEach(doc => {
      testimonials.push({ 
        id: doc.id, 
        ...doc.data(),
        // Ensure date is formatted properly
        date: doc.data().createdAt ? doc.data().createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    });
    
    res.json({
      success: true,
      testimonials: testimonials
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.json({
      success: true,
      testimonials: []
    });
  }
});

// Submit new testimonial
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, rating, comment, dish } = req.body;
    
    // Validate required fields
    if (!comment || comment.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Please write a review' 
      });
    }
    
    const testimonial = {
      name: name || req.user.name,
      userId: req.userId,
      rating: parseInt(rating) || 5,
      comment: comment.trim(),
      dish: dish || '',
      verified: true, // Set to true so it shows immediately
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await db.collection('testimonials').add(testimonial);
    
    // Return the created testimonial with ID
    res.status(201).json({
      success: true,
      message: 'Thank you! Your testimonial has been submitted.',
      testimonial: { 
        id: docRef.id, 
        ...testimonial,
        date: testimonial.createdAt.split('T')[0]
      }
    });
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit testimonial. Please try again.' 
    });
  }
});

// Delete testimonial (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await db.collection('testimonials').doc(req.params.id).delete();
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ success: false, message: 'Failed to delete testimonial' });
  }
});

module.exports = router;