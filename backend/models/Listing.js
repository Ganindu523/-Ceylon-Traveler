const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
  provider: { // Link to the user who created it
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['hotel', 'taxi', 'guide'],
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  price: { // Price per night, per trip, or per tour
    type: Number,
    required: true,
  },
  imageUrl: { // Link to a primary image for the listing
    type: String,
    default: 'https://via.placeholder.com/400x300.png?text=No+Image'
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Listing', ListingSchema);