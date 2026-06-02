const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Listing = require('../models/Listing');

// @route   POST api/listings
// @desc    Create a new listing
// @access  Private (Providers Only)
router.post('/', auth('provider'), async (req, res) => {
  const { title, description, type, location, price, imageUrl } = req.body;
  try {
    const newListing = new Listing({
      provider: req.user.id,
      title,
      description,
      type,
      location,
      price,
      imageUrl
    });

    const listing = await newListing.save();
    res.json(listing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/listings
// @desc    Get all listings (for tourists to view)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find().populate('provider', 'name');
    res.json(listings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/', async (req, res) => {
  try {
    // Build a query object based on request queries
    const query = {};
    if (req.query.location) {
      // Case-insensitive search
      query.location = new RegExp(req.query.location, 'i');
    }
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    const listings = await Listing.find(query).populate('provider', 'name');
    res.json(listings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;