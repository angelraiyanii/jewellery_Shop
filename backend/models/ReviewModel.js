const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Login',
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;