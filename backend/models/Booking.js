const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  guestName: {
    type: String,
    required: true,
  },
  guestEmail: { // Good to have for contact
    type: String,
    required: true,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  checkOutDate: {
    type: Date,
    required: true,
  },
  numberOfGuests: {
    type: Number,
    required: true,
    min: 1,
  },
  room: { // Reference to the specific room booked
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  hotel: { // Reference to the hotel where the booking is made
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  bookedBy: { // Reference to the user who made the booking (optional, if tourists book themselves)
     type: mongoose.Schema.Types.ObjectId,
     ref: 'User',
     // required: true, // Make required if users book directly
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', BookingSchema);