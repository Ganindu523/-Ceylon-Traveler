const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    required: true, 
    enum: ['tourist', 'hotel', 'taxi', 'guide', 'admin'] 
  },
  identificationNumber: { type: String },
  isOnline: { type: Boolean, default: false },
  
  // --- Auto-Approve Logic ---
  isApproved: { 
    type: Boolean, 
    default: function() {
      // Auto-approve tourists and admins, others pending
      return this.role === 'tourist' || this.role === 'admin'; 
    }
  },

  // --- COMMON PROFILE FIELDS ---
  phone: { type: String }, // ✅ Added (Required for Guide Profile)
  profileImage: { type: String },
  description: { type: String }, // Used by Hotels/Drivers

  // --- DRIVER SPECIFIC ---
  vehicleType: { type: String },
  vehicleModel: { type: String },
  licensePlate: { type: String },
  pricePerKm: { type: Number },
  vehicleImages: { type: [String], default: [] },
  workingDistricts: { type: [String], default: [] }, // Specific to drivers
  
  // --- GUIDE SPECIFIC (Matches guideRoutes.js) ---
  bio: { type: String }, // ✅ Matches frontend "About Me"
  guideType: { 
    type: String, 
    enum: ['All Island', 'District'],
    default: 'All Island' 
  },
  serviceAreas: { type: [String], default: [] }, // ✅ Matches frontend "Districts"
  pricePerDay: { type: Number }, // ✅ Matches frontend Price
  languages: { type: [String], default: [] }, // ✅ Matches frontend Languages
  
  // Timestamp
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);