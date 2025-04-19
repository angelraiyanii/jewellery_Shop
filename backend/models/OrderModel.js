// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  O_Id: {
    type: Number,
    required: true
  },
  O_U_Email: {
    type: String,
    required: true
  },
  O_Order_Id: {
    type: String,
    required: true,
    unique: true
  },
  O_Sub_Order_Id: {
    type: String,
    required: true
  },
  O_P_Id: {
    type: Number,
    required: true
  },
  O_Rating: {
    type: Number,
    default: 0
  },
  O_Review: {
    type: String,
    default: ''
  },
  O_Total_Amount: {
    type: Number,
    required: true
  },
  O_Quantity: {
    type: Number,
    required: true,
    default: 1
  },
  O_Add: {
    type: String,
    required: true
  },
  O_Phn: {
    type: String,
    required: true
  },
  O_City: {
    type: String,
    required: true
  },
  O_Zip: {
    type: Number,
    required: true
  },
  O_State: {
    type: String,
    required: true
  },
  O_Delivery_Status: {
    type: String,
    enum: ['Ordered', 'Shipped', 'Delivered', 'Returned'],
    default: 'Ordered'
  },
  O_Payment_Status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  O_Offer_Name: {
    type: String,
    default: ''
  },
  O_Payment_Mode: {
    type: String,
    default: 'Cash on Delivery'
  },
  O_Date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);