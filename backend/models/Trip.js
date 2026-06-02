const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Arrival Details
  arrivalDate: { type: String }, // Changed to String to prevent date format errors
  arrivalTime: { type: String },
  flightNumber: { type: String },
  needAirportTransfer: { type: Boolean, default: false },
  transferVehicle: { type: String },
  
  // Financials
  totalPriceLKR: { type: Number, default: 0 },
  
  // Itinerary
  destinations: [
    {
      district: String,
      nights: Number,
      distanceKm: Number,
      transportCost: Number,
      
      // Hotel Data
      hotelId: String,
      hotelDetails: Object, 
      selectedRooms: Array, 
      checkIn: String,      
      checkOut: String,
      
      // Professional Help
      needGuide: Boolean,
      selectedGuideId: String,
      selectedGuideDetails: Object, 
      
      // Driver
      selectedDriver: Object
    }
  ],

  // Booking Status
   status: { 
    type: String, 
    default: 'Pending', 
    enum: [
        'Pending',      // User booked, waiting for confirmation
        'Confirmed',    // Hotel confirmed the booking
        'Checked-in',   // Guest has arrived (Check-in)
        'Completed',    // Guest has left (Check-out)
        'Cancelled'     // Booking cancelled
    ] 
  },

  // Payment Information
  paymentDetails: {
    paidAt: Date,
    method: String,
    cardName: String,
    cardLast4: String,
    status: String
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', TripSchema);