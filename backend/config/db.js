// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // 1. Check if MONGO_URI is set (e.g., from docker-compose.yml)
    // 2. If not, fallback to localhost (for running locally without Docker)
    const dbURI = process.env.MONGO_URI;

    if (!dbURI) {
      console.error('MONGO_URI is not defined in environment variables');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...'); 

    await mongoose.connect(dbURI);
    
    console.log('MongoDB Connected ✅');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.warn('⚠️ Server is running WITHOUT database connection. Some features will not work.');
    // process.exit(1); // Removed to keep server alive for UI work
  }
};

module.exports = connectDB;