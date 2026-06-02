const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  manager: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true 
  },
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
  },
  district: { // ✅ Added District Field
    type: String,
    required: [true, 'District is required'],
    enum: [
        'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 
        'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 
        'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 
        'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
    ] 
  },
  city: { // City is more specific (e.g. Negombo inside Gampaha district)
    type: String,
    required: [true, 'City is required'],
  },
  address: {
    type: String,
    required: [true, 'Hotel address is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  amenities: {
    type: [String],
    default: [],
  },
  contactNumber: {
    type: String,
  },
  photos: {
    type: [String],
    default: [],
  },
  latitude: { type: Number }, // For Google Maps
  longitude: { type: Number }, // For Google Maps

  distanceFromAirport: { type: Number },
  
  isApproved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Hotel', HotelSchema);