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

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Validate productIds in items
    for (const item of items) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid product ID format: ${item.productId}`,
        });
      }
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found for ID: ${item.productId}`,
        });
      }
    }

    // Create the order
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
    console.error('Error creating order:', error, error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Getting order with ID:', orderId);

    // Validate orderId format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.log('Invalid order ID format:', orderId);
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID format',
      });
    }

    const order = await Order.findById(orderId)
      .populate('userId', 'fullname email') // Changed 'name' to 'fullname'
      .populate('items.productId', 'productName price productImage');

    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    console.log('Order found:', order._id);
    res.status(200).json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error('Error finding order:', error, error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    console.log("Fetching all orders");
    
    // First, try to get orders without population
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log(`Found ${orders.length} orders`);
    
    // Try to populate, but with error handling
    let populatedOrders = orders;
    try {
      populatedOrders = await Order.find()
        .populate('userId', 'name email')
        .populate('items.productId', 'productName price productImage')
        .sort({ createdAt: -1 });
      console.log("Population successful");
    } catch (populateErr) {
      console.error("Error during population:", populateErr.message);
      // Continue with unpopulated orders
    }
    
    res.status(200).json({
      success: true,
      count: populatedOrders.length,
      orders: populatedOrders
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

module.exports = router;