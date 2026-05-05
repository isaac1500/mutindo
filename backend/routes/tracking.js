const express = require('express');
const router = express.Router();
const {
  updateLocation,
  getLocation,
  getLocationHistory
} = require('../controllers/trackingController');
const { authenticate, authorize } = require('../middleware/auth');

// Rider updates location
router.post('/location', authenticate, authorize('rider'), updateLocation);

// Get location for order (customer and admin)
router.get('/order/:orderId', authenticate, getLocation);
router.get('/order/:orderId/history', authenticate, getLocationHistory);

module.exports = router;
