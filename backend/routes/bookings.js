const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

// @route   POST api/bookings
// @desc    Create a new booking
// @access  Private
router.post('/', auth(), async (req, res) => {
  const { listingId, startDate, endDate } = req.body;

  try {
    // IMPORTANT: In a real app, you MUST check for date availability here.
    // This involves querying existing bookings for the same listing
    // to see if the requested dates overlap. For simplicity, we skip that here.

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ msg: 'Listing not found' });

    // Calculate total price (example logic)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * listing.price;
    
    const newBooking = new Booking({
      listing: listingId,
      tourist: req.user.id,
      startDate,
      endDate,
      totalPrice,
    });
    
    const booking = await newBooking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;