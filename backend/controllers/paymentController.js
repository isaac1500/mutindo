const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { db } = require('../config/firebase');

// Initialize payment for Cash on Delivery
const initializeCashPayment = async (req, res) => {
  try {
    const { orderId, amount, customerPhone } = req.body;
    
    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required'
      });
    }
    
    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order belongs to customer
    if (order.customerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Check if payment already exists
    const existingPayment = await Payment.findByOrderId(orderId);
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already initialized for this order'
      });
    }
    
    // Create payment record
    const payment = await Payment.create({
      orderId: orderId,
      customerId: req.user.userId,
      customerPhone: customerPhone || order.customerPhone,
      amount: amount,
      method: 'cash',
      status: 'pending',
      reference: 'CASH-' + order.orderNumber
    });
    
    res.json({
      success: true,
      message: 'Cash on Delivery payment initialized',
      data: {
        paymentId: payment.paymentId,
        method: 'cash',
        status: 'pending',
        amount: amount,
        instructions: 'Pay when your order is delivered'
      }
    });
    
  } catch (error) {
    console.error('Initialize cash payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing payment',
      error: error.message
    });
  }
};

// Confirm Cash on Delivery payment (after delivery)
const confirmCashPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentId, amountReceived } = req.body;
    
    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if payment exists
    const payment = await Payment.findByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }
    
    // Update payment status to completed
    const updatedPayment = await Payment.updateStatus(payment.id, 'completed', {
      completedAt: new Date().toISOString(),
      amountReceived: amountReceived || payment.amount,
      confirmedBy: req.user.userId
    });
    
    // Update order payment status and status
    await Order.updateStatus(orderId, 'delivered', {
      paymentStatus: 'paid',
      paymentCompletedAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Cash payment confirmed',
      data: updatedPayment
    });
    
  } catch (error) {
    console.error('Confirm cash payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
};

// Get payment status for an order
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const payment = await Payment.findByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this order'
      });
    }
    
    // Check authorization
    const order = await Order.findById(orderId);
    if (order && order.customerId !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        paymentId: payment.paymentId,
        method: payment.method,
        status: payment.status,
        amount: payment.amount,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt
      }
    });
    
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message
    });
  }
};

// Get all payments (admin only)
const getAllPayments = async (req, res) => {
  try {
    const snapshot = await db.collection('payments')
      .orderBy('createdAt', 'desc')
      .get();
    
    const payments = [];
    snapshot.forEach(doc => {
      payments.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

module.exports = {
  initializeCashPayment,
  confirmCashPayment,
  getPaymentStatus,
  getAllPayments
};
