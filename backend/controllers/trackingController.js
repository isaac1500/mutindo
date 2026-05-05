const Tracking = require('../models/Tracking');

// Update rider location
const updateLocation = async (req, res) => {
  try {
    const { orderId, lat, lng } = req.body;
    const riderId = req.user.userId;
    
    if (!orderId || !lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, lat, and lng are required'
      });
    }
    
    // Save to database
    const location = await Tracking.saveRiderLocation(riderId, orderId, lat, lng);
    
    // Try to emit real-time update if socket is available
    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      io.to('order-' + orderId).emit('location-update', {
        riderId: riderId,
        lat: lat,
        lng: lng,
        timestamp: location.timestamp
      });
    } catch (socketError) {
      console.log('Socket not available, skipping real-time update');
    }
    
    res.json({
      success: true,
      message: 'Location updated',
      data: location
    });
    
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating location',
      error: error.message
    });
  }
};

// Get latest location for order
const getLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const location = await Tracking.getLatestLocation(orderId);
    
    res.json({
      success: true,
      data: location
    });
    
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location',
      error: error.message
    });
  }
};

// Get location history for order
const getLocationHistory = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { limit } = req.query;
    
    const locations = await Tracking.getLocationHistory(orderId, limit || 50);
    
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
    
  } catch (error) {
    console.error('Get location history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location history',
      error: error.message
    });
  }
};

module.exports = {
  updateLocation,
  getLocation,
  getLocationHistory
};
