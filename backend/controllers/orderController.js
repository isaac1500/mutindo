const { db } = require('../config/firebase');
const fetch = require('node-fetch');

// Helper function to geocode address using OpenStreetMap Nominatim
async function geocodeAddress(address) {
  if (!address) return null;
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      {
        headers: { 
          'User-Agent': 'MutindoCateringApp/1.0'
        }
      }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Create new order - FIXED: sends response immediately
exports.createOrder = async (req, res) => {
  try {
    const { items, subtotal, deliveryFee, total, deliveryAddress, phone, instructions, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item'
      });
    }

    if (!deliveryAddress) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }

    const order = {
      orderId: `ORD-${Date.now()}`,
      customerId: req.userId,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: phone || req.user.phone,
      items: items,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      total: total,
      deliveryAddress: deliveryAddress,
      deliveryCoordinates: null,
      instructions: instructions || '',
      paymentMethod: paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection('orders').add(order);
    const newOrder = { id: docRef.id, ...order };

    // SEND RESPONSE IMMEDIATELY - don't wait for geocoding
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: newOrder
    });

    // Do geocoding in background (don't await)
    geocodeAddress(deliveryAddress).then(coordinates => {
      if (coordinates) {
        docRef.update({ deliveryCoordinates: coordinates });
        console.log(`Geocoded address for order ${newOrder.orderId}`);
      }
    }).catch(err => console.error('Geocoding failed:', err));

  } catch (error) {
    console.error('Create order error:', error);
    // Only send error if response not already sent
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to create order',
        error: error.message
      });
    }
  }
};

// Get customer orders
exports.getMyOrders = async (req, res) => {
  try {
    const snapshot = await db.collection('orders')
      .where('customerId', '==', req.userId)
      .orderBy('createdAt', 'desc')
      .get();

    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get single order
exports.getOrder = async (req, res) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = { id: doc.id, ...doc.data() };

    const isCustomer = order.customerId === req.userId;
    const isAssignedRider = order.riderId === req.userId;
    const isAdmin = req.user.role === 'admin';
    const isRiderAndReadyOrder = req.user.role === 'rider' && 
      (order.status === 'ready' || order.status === 'confirmed' || order.status === 'picked_up' || order.status === 'on_the_way');

    if (isCustomer || isAssignedRider || isAdmin || isRiderAndReadyOrder) {
      return res.json(order);
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    let query = db.collection('orders');

    if (req.query.status) {
      query = query.where('status', '==', req.query.status);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();

    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      count: orders.length,
      orders: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderRef = db.collection('orders').doc(req.params.id);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await orderRef.update({
      status,
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await orderRef.get();
    res.json({
      success: true,
      message: 'Order status updated',
      order: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};

// Assign order to rider
exports.assignOrderToRider = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;

    const orderRef = db.collection('orders').doc(orderId);
    const doc = await orderRef.get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const currentRiderId = riderId === 'current' ? req.userId : riderId;

    await orderRef.update({
      riderId: currentRiderId,
      assignedAt: new Date().toISOString(),
      status: 'confirmed',
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Order assigned to rider'
    });
  } catch (error) {
    console.error('Assign order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign order'
    });
  }
};

// Update rider's current location for order tracking
exports.updateOrderLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { lat, lng, status } = req.body;

    const locationData = {
      orderId,
      lat,
      lng,
      status: status || 'en_route',
      updatedAt: new Date().toISOString()
    };

    await db.collection('order_locations').doc(orderId).set(locationData, { merge: true });
    await db.collection('orders').doc(orderId).update({
      currentRiderLocation: { lat, lng },
      lastLocationUpdate: new Date().toISOString()
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Location updated'
    });
  } catch (error) {
    console.error('Update order location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location' 
    });
  }
};

// Get order location for customer tracking
exports.getOrderLocation = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const locationDoc = await db.collection('order_locations').doc(orderId).get();

    if (locationDoc.exists) {
      return res.json({
        success: true,
        location: locationDoc.data()
      });
    }
    
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (orderDoc.exists) {
      const order = orderDoc.data();
      if (order.currentRiderLocation) {
        return res.json({
          success: true,
          location: {
            lat: order.currentRiderLocation.lat,
            lng: order.currentRiderLocation.lng,
            orderId,
            status: order.status,
            updatedAt: order.lastLocationUpdate || order.updatedAt
          }
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Location not found'
    });
  } catch (error) {
    console.error('Get order location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get location'
    });
  }
};

// Get delivery coordinates for an order (for navigation)
exports.getDeliveryCoordinates = async (req, res) => {
  try {
    const { orderId } = req.params;
    const doc = await db.collection('orders').doc(orderId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = doc.data();
    
    if (!order.deliveryCoordinates) {
      const coordinates = await geocodeAddress(order.deliveryAddress);
      if (coordinates) {
        await doc.ref.update({ deliveryCoordinates: coordinates });
        return res.json({
          success: true,
          coordinates: coordinates
        });
      }
      
      return res.status(404).json({
        success: false,
        message: 'No coordinates available for this address'
      });
    }

    res.json({
      success: true,
      coordinates: order.deliveryCoordinates,
      address: order.deliveryAddress
    });
  } catch (error) {
    console.error('Get delivery coordinates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get coordinates'
    });
  }
};