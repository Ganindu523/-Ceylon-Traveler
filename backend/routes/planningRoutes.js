const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); 
const Trip = require('../models/Trip'); 
const User = require('../models/User'); 
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const axios = require('axios');

// ==========================================
// 1. HOTEL & ROOM ROUTES
// ==========================================

// @route   GET /api/planning/hotels
// @desc    Fetch hotels (optional city filter)
router.get('/hotels', async (req, res) => {
    try {
        const { city, district } = req.query;
        let query = {};
        
        if (city && city !== ':1') {
            query.city = { $regex: new RegExp(city, 'i') };
        }
        if (district) {
            query.district = { $regex: new RegExp(district, 'i') };
        }

        const hotels = await Hotel.find(query).select('name district city address description photos amenities contactNumber pricePerNight distanceFromAirport stars'); 
        console.log(`[Planning API] Found ${hotels.length} hotels`);
        res.json(hotels);
    } catch (err) {
        console.error("Hotel Fetch Error:", err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/planning/hotels/:id/rooms
router.get('/hotels/:id/rooms', async (req, res) => {
    try {
        const rooms = await Room.find({ hotel: req.params.id }); 
        res.json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 2. TAXI & TRANSPORT ROUTES
// ==========================================

// @route   GET /api/planning/taxi-rates
// @desc    Calculate average rate per km for each vehicle type
router.get('/taxi-rates', async (req, res) => {
  try {
    const taxiAggregation = await User.aggregate([
      {
        $match: {
          role: 'taxi',
          isApproved: true,
          vehicleType: { $exists: true, $ne: null },
          pricePerKm: { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$vehicleType",
          averageRate: { $avg: "$pricePerKm" },
          count: { $sum: 1 }
        }
      }
    ]);

    const vehicleRates = {};
    taxiAggregation.forEach(item => {
      vehicleRates[item._id] = {
        rate: Math.round(item.averageRate),
        count: item.count
      };
    });

    res.json(vehicleRates);
  } catch (err) {
    console.error("Taxi Rates Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/planning/taxis
router.get('/taxis', async (req, res) => {
  try {
    const { vehicleType, district } = req.query;
    console.log(`[Planning API] Fetching taxis. Type: ${vehicleType || 'Any'}, District: ${district || 'Any'}`);
    let query = { role: 'taxi', isApproved: true };

    if (vehicleType) query.vehicleType = vehicleType;
    if (district) {
        query.workingDistricts = { $regex: new RegExp(district, 'i') };
    }

    const taxis = await User.find(query).select('name email vehicleType vehicleModel pricePerKm profileImage workingDistricts licensePlate bio');
    console.log(`[Planning API] Found ${taxis.length} taxis`);

    res.json(taxis);
  } catch (err) {
    console.error("Fetch Taxis Error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// ==========================================
// 3. GUIDE ROUTES
// ==========================================

// @route   GET /api/planning/guides
// @desc    Fetch guides based on district OR All Island coverage
router.get('/guides', async (req, res) => {
    try {
        const { district } = req.query;
        console.log(`[Planning API] Fetching guides. District: ${district || 'Any'}`);
        
        const query = { role: 'guide' };

        if (district) {
            query.$or = [
                { serviceAreas: { $regex: new RegExp(district, 'i') } },
                { guideType: 'All Island' },
                { serviceAreas: 'All Island' }
            ];
        }

        const guides = await User.find(query).select('name profileImage pricePerDay bio guideType serviceAreas languages phone email');
        res.json(guides);
    } catch (err) {
        console.error("Guide Fetch Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 4. REVIEW & FEEDBACK ROUTES
// ==========================================
const Review = require('../models/Review');

// @route   GET /api/planning/reviews/:serviceId
router.get('/reviews/:serviceId', async (req, res) => {
    try {
        const reviews = await Review.find({ serviceId: req.params.serviceId })
            .populate('user', 'name profileImage')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/planning/reviews
router.post('/reviews', auth, async (req, res) => {
    try {
        const { serviceId, serviceType, rating, comment } = req.body;
        const newReview = new Review({
            user: req.user.id,
            serviceId,
            serviceType,
            rating,
            comment
        });
        await newReview.save();
        res.json(newReview);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
// @route   PUT /api/bookings/:id
// @desc    Update an existing trip
router.put('/:id', auth, async (req, res) => {
    try {
        let trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: "Trip not found" });

        // Authorization check
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User not authorized" });
        }

        // Update trip fields
        // You can update specific fields or replace the whole object depending on your needs.
        // Here we update everything sent in the body.
        const updatedTrip = await Trip.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true } // Return the updated document
        );

        res.json(updatedTrip);
    } catch (err) {
        console.error("Update Trip Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 4. UTILITY ROUTES (DISTANCE)
// ==========================================

// @route   POST /api/planning/calculate-distance
router.post('/calculate-distance', async (req, res) => {
    const { origin, destination } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // 1. Validate Input
    if (!origin || !destination) {
        return res.status(400).json({ msg: "Origin and Destination are required" });
    }

    try {
        console.log(`[Distance Calc] Requesting: "${origin}" -> "${destination}"`);
        
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;
        
        const response = await axios.get(url);
        const data = response.data;

        // 2. Check for Global API Errors (Invalid Key, Over Limit, etc.)
        if (data.status !== "OK") {
            console.error(`❌ Google API Global Error: ${data.status} - ${data.error_message}`);
            return res.status(400).json({ 
                msg: `Google API Error: ${data.status}`, 
                detail: data.error_message 
            });
        }

        // 3. Check if a Route was actually found
        if (!data.rows || !data.rows[0] || !data.rows[0].elements || !data.rows[0].elements[0]) {
            console.error("❌ Invalid Response Structure:", JSON.stringify(data));
            return res.status(400).json({ msg: "Invalid response from Maps API" });
        }

        const element = data.rows[0].elements[0];

        if (element.status === "OK") {
            const distanceKm = Math.round(element.distance.value / 1000);
            console.log(`✅ Distance Found: ${distanceKm} km`);
            
            return res.json({ 
                distanceKm: distanceKm,
                duration: element.duration.text 
            });
        } else {
            // Handle cases where locations are valid but no road exists (e.g. "ZERO_RESULTS")
            console.warn(`⚠️ Route Error: ${element.status}`);
            return res.status(400).json({ msg: `Could not calculate route: ${element.status}` });
        }

    } catch (err) {
        console.error("❌ Server Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 5. AI ASSISTANT CHAT
// ==========================================
const { GoogleGenerativeAI } = require("@google/generative-ai");

// @route   POST /api/planning/chat
// @desc    Context-aware AI Chat with Gemini
// @access  Private
router.post('/chat', auth, async (req, res) => {
    const { message, history } = req.body;
    const userRole = req.user.role; // From authMiddleware

    if (!message) return res.status(400).json({ msg: "Message is required" });

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Build a System Instruction based on role
        let systemInstruction = "You are Ceylon Traveler, a professional travel assistant for Sri Lanka. ";
        if (userRole === 'tourist') {
            systemInstruction += "The user is a Tourist. Focus on destinations, safety, local tips, and culture.";
        } else if (userRole === 'taxi') {
            systemInstruction += "The user is a Taxi Driver. Focus on routes, road conditions, tourist expectations, and professional driving tips.";
        } else if (userRole === 'guide') {
            systemInstruction += "The user is a Local Guide. Focus on historical facts, storytelling tips, and guest management.";
        } else if (userRole === 'hotel') {
            systemInstruction += "The user is a Hotel Manager. Focus on hospitality trends, guest satisfaction, and property management.";
        } else if (userRole === 'admin') {
            systemInstruction += "The user is a System Admin. Focus on platform statistics and management advice.";
        }

        // Prepare History for Gemini (Gemini expects { role: 'user'|'model', parts: [{ text: '' }] })
        const formattedHistory = (history || []).map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        // Insert system instruction at the beginning if history is empty
        if (formattedHistory.length === 0) {
            formattedHistory.push({
                role: 'user',
                parts: [{ text: `CONTEXT: ${systemInstruction}. Please acknowledge this role and greet the user accordingly.` }]
            });
            formattedHistory.push({
                role: 'model',
                parts: [{ text: "Understood. I will provide tailored advice for your role. How can I assist you today?" }]
            });
        }

        const chat = model.startChat({ history: formattedHistory });
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ text });
    } catch (err) {
        console.error("Gemini Backend Error:", err.message);
        res.status(500).json({ msg: "AI Assistant is currently unavailable" });
    }
});

module.exports = router;