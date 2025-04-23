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

    // Log each step for debugging
    console.log('Attempting to find order in database');
    
    const order = await Order.findById(orderId);
    
    console.log('Raw order result:', order);
    
    if (!order) {
      console.log('Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Try population in separate steps for debugging
    console.log('Found order, now attempting to populate references');
    
    try {
      await order.populate('userId', 'fullname email');
      console.log('User populated successfully');
    } catch (populateError) {
      console.error('Error populating user:', populateError);
      // Continue without user population
    }
    
    try {
      await order.populate('items.productId', 'productName price productImage');
      console.log('Products populated successfully');
    } catch (populateError) {
      console.error('Error populating products:', populateError);
      // Continue without product population
    }

    console.log('Order successfully processed:', order._id);
    res.status(200).json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error('Error finding order:', error.message);
    console.error('Stack trace:', error.stack);
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