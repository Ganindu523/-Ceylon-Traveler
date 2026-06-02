const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  driver: { // Initially might be null for scheduled requests until accepted
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true, // Not required until accepted
  },
  passenger: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  passengerName: {
     type: String,
     required: true
  },
  pickupAddress: {
    type: String,
    required: true,
  },
  dropoffAddress: {
    type: String,
    required: true,
  },
  // ✅ Changed pickupTime to Date
  pickupTime: { 
    type: Date,
    required: true, // Now required for scheduled rides
  },
  // ✅ Added flag for scheduled rides
  isScheduled: {
    type: Boolean,
    default: true, // Assuming this model is mainly for scheduled now
  },
  estimatedFare: {
    type: Number,
  },
  actualFare: {
    type: Number,
  },
  status: {
    type: String,
    // Added 'Scheduled' status
    enum: ['Scheduled', 'Assigned', 'Accepted', 'PickedUp', 'Completed', 'Cancelled', 'DriverRejected', 'Expired'], 
    default: 'Scheduled', // Default for new scheduled requests
  },
  // ... (createdAt, acceptedAt, etc. remain the same) ...
  createdAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  pickedUpAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  rejectedAt: { type: Date },
});

module.exports = mongoose.model('Ride', RideSchema);