const express = require('express');
const router = express.Router();
const Review = require("../models/ReviewModel");
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Submit or update a review
router.post('/add', async (req, res) => {
  const { productId, rating, review } = req.body;

  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Received token for /add:', token);
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    const userId = decoded.userId;

    let existingReview = await Review.findOne({ userId, productId });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.review = review;
      existingReview.date = Date.now();
      await existingReview.save();
      return res.status(200).json({ message: 'Review updated successfully', review: existingReview });
    }

    const newReview = new Review({
      userId,
      productId,
      rating,
      review,
    });

    await newReview.save();
    res.status(201).json({ message: 'Review submitted successfully', review: newReview });
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a review
router.delete('/delete/:reviewId', async (req, res) => {
  const { reviewId } = req.params;

  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Received token for /delete:', token);
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    const userId = decoded.userId;

    const review = await Review.findOneAndDelete({ _id: reviewId, userId });
    if (!review) {
      return res.status(404).json({ error: 'Review not found or not authorized' });
    }
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get reviews for a specific product
router.get('/product/:productId', async (req, res) => {
  const { productId } = req.params;
  console.log('Fetching reviews for productId:', productId); // Debug

  // Validate productId
  if (!mongoose.isValidObjectId(productId)) {
    console.error('Invalid productId:', productId);
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const reviews = await Review.find({ productId })
      .populate('userId', 'fullname') // Use 'fullname' to match User model
      .sort({ date: -1 });
    console.log('Reviews fetched:', reviews); // Debug
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get all reviews (for admin)
router.get('/all', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Received token for /all:', token);
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    const reviews = await Review.find()
      .populate('userId', 'fullname') // Use 'fullname' to match User model
      .populate('productId', 'productName')
      .sort({ date: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get average rating and review count for a product
router.get('/rating/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.find({ productId });
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

    res.status(200).json({ averageRating: averageRating.toFixed(1), reviewCount });
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;