const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  hotel: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true,
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Single', 'Double', 'Queen', 'King', 'Suite', 'Deluxe'], 
  },
  price: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative'],
  },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
    default: 'Available',
  },
  features: {
    type: [String], 
    default: [],
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Correct placement for the Compound Index
// This ensures a hotel cannot have two rooms with the same roomNumber
RoomSchema.index({ hotel: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', RoomSchema);