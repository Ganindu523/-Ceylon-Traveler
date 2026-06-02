const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const auth = require('../middleware/authMiddleware');

// @route   POST api/reviews
// @desc    Create a review
// @access  Private
router.post('/', auth, async (req, res) => {
  const { serviceId, serviceType, rating, comment } = req.body;

  if (!serviceId || !serviceType || !rating || !comment) {
    return res.status(400).json({ msg: 'Please provide all fields' });
  }

  try {
    const newReview = new Review({
      user: req.user.id,
      serviceId,
      serviceType,
      rating,
      comment
    });

    const review = await newReview.save();
    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reviews/:serviceId
// @desc    Get all reviews for a service
// @access  Public
router.get('/:serviceId', async (req, res) => {
  try {
    const reviews = await Review.find({ serviceId: req.params.serviceId })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
