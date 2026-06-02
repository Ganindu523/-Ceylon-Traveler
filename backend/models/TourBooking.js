const mongoose = require('mongoose');

const TourBookingSchema = new mongoose.Schema({
  guide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  touristName: { type: String, required: true },
  touristEmail: { type: String }, // Useful for contact
  touristPhone: { type: String },
  tourPackage: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: String }, 
  totalPrice: { type: Number, required: true },
  notes: { type: String }, // Special requests from tourist
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rejected'],
    default: 'Pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TourBooking', TourBookingSchema);