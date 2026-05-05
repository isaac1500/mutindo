const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

// Customer routes
router.post('/', authenticate, orderController.createOrder);
router.get('/my-orders', authenticate, orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getOrder);

// Rider routes
router.put('/:orderId/assign', authenticate, authorize('rider'), orderController.assignOrderToRider);
router.post('/:orderId/location', authenticate, authorize('rider'), orderController.updateOrderLocation);
router.get('/:orderId/location', orderController.getOrderLocation);

// Admin routes
router.get('/', authenticate, authorize('admin'), orderController.getAllOrders);
router.put('/:id/status', authenticate, authorize('admin', 'rider'), orderController.updateOrderStatus);

module.exports = router;