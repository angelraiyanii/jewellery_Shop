const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: 'rzp_test_yCgrsfXSuM7SxL',
  key_secret: 'eaxt0pkgow03xe2s2ufGFmBK',
});

router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    const options = {
      amount: parseInt(amount * 100), // amount in smallest currency unit (e.g., paise)
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

module.exports = router;
