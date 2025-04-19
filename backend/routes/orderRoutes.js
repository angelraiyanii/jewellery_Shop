// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/OrderModel');
const CartModel = require('../models/CartModel'); 
const { v4: uuidv4 } = require('uuid'); // For generating unique order IDs

// Create a new order
router.post('/create', async (req, res) => {
  try {
    const {
      userId,
      email,
      phone,
      address,
      zip,
      city,
      state,
      totalAmount,
      discount,
      offerName
    } = req.body;

    // Generate unique order ID
    const orderId = uuidv4();
    const subOrderId = `SUB-${orderId.substring(0, 8)}`;

    // Fetch user's cart items to create order items
    const cartItems = await CartModel.find({ userId }).populate('productId');
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Get the last order ID to generate a new one
    const lastOrder = await Order.findOne().sort({ O_Id: -1 });
    const newOrderId = lastOrder ? lastOrder.O_Id + 1 : 1;

    // Create orders for each cart item
    const orders = [];
    for (const item of cartItems) {
      const order = new Order({
        O_Id: newOrderId + orders.length,
        O_U_Email: email,
        O_Order_Id: orderId,
        O_Sub_Order_Id: subOrderId,
        O_P_Id: item.productId._id,
        O_Total_Amount: totalAmount,
        O_Quantity: item.quantity,
        O_Add: address,
        O_Phn: phone,
        O_City: city || '',
        O_Zip: zip,
        O_State: state || '',
        O_Offer_Name: offerName || '',
        O_Payment_Mode: 'Cash on Delivery' // Default payment mode
      });
      
      orders.push(order);
    }

    // Save all orders
    const savedOrders = await Order.insertMany(orders);

    // Clear the user's cart
    await CartModel.deleteMany({ userId });

    res.status(201).json({ 
      success: true, 
      message: 'Order placed successfully', 
      orderId: orderId,
      orders: savedOrders 
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating order', 
      error: error.message 
    });
  }
});

// Get all orders for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ O_U_Email: req.params.userId })
                              .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching orders', 
      error: error.message 
    });
  }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const orders = await Order.find({ O_Order_Id: req.params.orderId });
    
    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching order', 
      error: error.message 
    });
  }
});

// Update order status
router.put('/status/:orderId', async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    
    const updateData = {};
    if (status) updateData.O_Delivery_Status = status;
    if (paymentStatus) updateData.O_Payment_Status = paymentStatus;
    
    const updatedOrder = await Order.updateMany(
      { O_Order_Id: req.params.orderId },
      { $set: updateData }
    );
    
    if (updatedOrder.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found or no changes made' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating order status', 
      error: error.message 
    });
  }
});

// Add review and rating to an order
router.put('/review/:orderId', async (req, res) => {
  try {
    const { rating, review, productId } = req.body;
    
    if (!rating || !review || !productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rating, review and productId are required' 
      });
    }
    
    const updatedOrder = await Order.findOneAndUpdate(
      { O_Order_Id: req.params.orderId, O_P_Id: productId },
      { 
        $set: {
          O_Rating: rating,
          O_Review: review
        }
      },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Review added successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding review', 
      error: error.message 
    });
  }
});

module.exports = router;