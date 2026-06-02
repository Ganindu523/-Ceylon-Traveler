const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

// @route   GET api/dashboard/my-bookings
// @desc    Get bookings for the logged-in tourist
// @access  Private
router.get('/my-bookings', auth(), async (req, res) => {
  try {
    const bookings = await Booking.find({ tourist: req.user.id }).populate('listing', 'title location');
    res.json(bookings);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/dashboard/my-listings
// @desc    Get listings for the logged-in provider
// @access  Private (Providers only)
router.get('/my-listings', auth('provider'), async (req, res) => {
  try {
    const listings = await Listing.find({ provider: req.user.id });
    res.json(listings);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;