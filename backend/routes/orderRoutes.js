const express = require('express');
const router = express.Router();
const Order = require('../models/OrderModel');
const User = require('../models/Login');
const Product = require('../models/ProductModel');
const mongoose = require('mongoose');

// Create a new order
router.post('/create', async (req, res) => {
  try {
    const { userId, items, shippingAddress, subtotal, discount, total, offerName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({ success: false, message: `Invalid product ID format: ${item.productId}` });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found for ID: ${item.productId}` });
      }
    }

    const order = new Order({
      userId,
      items,
      shippingAddress,
      subtotal,
      discount,
      total,
      offerName,
    });

    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: savedOrder,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order', error: error.message });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    try {
      await order.populate('userId', 'fullname email');
    } catch (populateError) {
      console.error('Error populating user:', populateError);
    }

    try {
      await order.populate('items.productId', 'productName price productImage');
    } catch (populateError) {
      console.error('Error populating products:', populateError);
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error finding order:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: error.message });
  }
});

// ✅ Get orders by user ID (moved out)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const orders = await Order.find({ userId })
      .populate('items.productId', 'productName price productImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user orders', error: error.message });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'productName price productImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
  }
});

module.exports = router;
