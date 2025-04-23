const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/OrderModel');

const instance = new Razorpay({
  key_id: 'rzp_test_yCgrsfXSuM7SxL',
  key_secret: 'eaxt0pkgow03xe2s2ufGFmBK',
});

router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    const options = {
      amount: parseInt(amount * 100),
      currency,
      receipt,
      payment_capture: 1,
    };

    const order = await instance.orders.create(options);
    res.status(201).json({ order });
  } catch (error) {
    console.error('Razorpay order creation error:', error.message);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
});

// In your payment routes file
router.post('/verify-payment', async (req, res) => {
    try {
      // Extract payment details from request body
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, receipt } = req.body;
  
      // Verify signature
      const generated_signature = crypto
        .createHmac('sha256', 'eaxt0pkgow03xe2s2ufGFmBK') // Your Razorpay key_secret
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');
  
      // Compare signatures
      if (generated_signature === razorpay_signature) {
        // Payment is legitimate, update order status
        const updatedOrder = await Order.findByIdAndUpdate(
          receipt, 
          { status: 'delivered' },
          { new: true }
        );
  
        if (!updatedOrder) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }
  
        return res.status(200).json({
          success: true,
          message: 'Payment verified and order status updated to delivered',
          order: updatedOrder,
          redirectUrl: '/OrderHistory' // URL for redirection to order history page
        });
      } else {
        // Invalid signature
        return res.status(400).json({
          success: false,
          message: 'Invalid payment signature'
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment verification failed',
        error: error.message
      });
    }
  });

module.exports = router;
