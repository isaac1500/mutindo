const express = require('express');
const router = express.Router();
const {
  initializeCashPayment,
  confirmCashPayment,
  getPaymentStatus,
  getAllPayments
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

// Customer routes
router.post('/cash/initiate', authenticate, initializeCashPayment);
router.get('/order/:orderId', authenticate, getPaymentStatus);

// Admin only routes
router.post('/cash/:orderId/confirm', authenticate, authorize('admin'), confirmCashPayment);
router.get('/admin/all', authenticate, authorize('admin'), getAllPayments);

module.exports = router;
