const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

// Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit a review
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ user: req.user._id, product: productId });
    if (existingReview) return res.status(400).json({ error: 'You have already reviewed this product' });

    // Verify if user actually purchased the product
    const purchasedOrder = await Order.findOne({ 
        user: req.user._id, 
        status: 'success', 
        'items.productId': productId 
    });
    
    const review = new Review({
      user: req.user._id,
      product: productId,
      rating,
      comment,
      isVerifiedPurchase: !!purchasedOrder
    });

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
