const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Ensure this exists
const cloudinary = require('../config/cloudinaryConfig'); // Ensure this exists
const Trip = require('../models/Trip');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');

// --- Helper: Distance Calc ---
const calculateKM = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
};
const AIRPORT_COORDS = { lat: 7.1811, lng: 79.8837 };

// ==========================================
// 1. HOTEL PROFILE MANAGEMENT (Missing Routes Restored)
// ==========================================

// @route   GET /api/hotel/managed
router.get('/managed', auth, async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ manager: req.user.id });
        res.json(hotel);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/hotel/managed
router.put('/managed', auth, async (req, res) => {
    const { name, address, city, district, description, amenities, contactNumber, latitude, longitude } = req.body;

    if (!name || !address || !city || !district || !description) {
        return res.status(400).json({ msg: 'Required fields are missing.' });
    }

    let distanceFromAirport = null;
    if (latitude && longitude) {
        distanceFromAirport = calculateKM(AIRPORT_COORDS.lat, AIRPORT_COORDS.lng, latitude, longitude);
    }

    const hotelFields = {
        manager: req.user.id,
        name, address, city, district, description, contactNumber,
        amenities: Array.isArray(amenities) ? amenities : [],
        latitude, longitude, distanceFromAirport
    };

    try {
        let hotel = await Hotel.findOneAndUpdate(
            { manager: req.user.id },
            { $set: hotelFields },
            { new: true, upsert: true }
        );
        res.json(hotel);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/hotel/managed/photos
router.post('/managed/photos', auth, upload.array('photos', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ msg: 'No files uploaded.' });

        const hotel = await Hotel.findOne({ manager: req.user.id });
        if (!hotel) return res.status(404).json({ msg: 'Hotel not found.' });

        const photoUrls = req.files.map(file => file.path);
        hotel.photos = hotel.photos.concat(photoUrls);
        await hotel.save();
        res.json(hotel.photos);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/hotel/managed/photos
router.delete('/managed/photos', auth, async (req, res) => {
    const { photoUrl } = req.body;
    try {
        const hotel = await Hotel.findOne({ manager: req.user.id });
        if (!hotel) return res.status(200).json({ 
            profileNeeded: true, 
            msg: "Please set up your hotel profile first." 
        });

        hotel.photos = hotel.photos.filter(p => p !== photoUrl);
        await hotel.save();
        
        // Note: Add Cloudinary delete logic here if needed (cloudinary.uploader.destroy)
        
        res.json(hotel.photos);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 2. DASHBOARD STATS
// ==========================================
router.get('/dashboard', auth, async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ manager: req.user.id });
        if (!hotel) return res.status(200).json({ 
            profileNeeded: true, 
            msg: "Please set up your hotel profile first." 
        });

        const hotelIdString = hotel._id.toString();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const rooms = await Room.find({ hotel: hotel._id });
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter(r => !r.isAvailable).length; 

        const trips = await Trip.find({
            "destinations.hotelId": hotelIdString,
            status: { $in: ['Confirmed', 'Checked-in', 'Completed'] } 
        });

        let stats = { checkIns: 0, checkOuts: 0, revenueToday: 0, revenueTotal: 0 };
        let recentBookingsList = [];

        trips.forEach(trip => {
            const leg = trip.destinations.find(d => d.hotelId === hotelIdString);
            if (leg) {
                const checkInDate = new Date(leg.checkIn);
                const checkOutDate = new Date(leg.checkOut);
                
                if (checkInDate >= today && checkInDate < tomorrow) stats.checkIns++;
                if (checkOutDate >= today && checkOutDate < tomorrow) stats.checkOuts++;

                const roomPrice = leg.selectedRooms.reduce((sum, r) => sum + (Number(r.price) || 0), 0);
                const legTotalUSD = roomPrice * (Number(leg.nights) || 1);

                stats.revenueTotal += legTotalUSD;
                
                const bookingDate = new Date(trip.createdAt);
                if (bookingDate >= today && bookingDate < tomorrow) {
                    stats.revenueToday += legTotalUSD;
                }

                recentBookingsList.push({
                    id: trip._id,
                    guestName: trip.user.name || "Guest",
                    checkIn: new Date(leg.checkIn).toLocaleDateString(),
                    checkOut: new Date(leg.checkOut).toLocaleDateString(),
                    roomType: leg.selectedRooms[0]?.type || 'Standard',
                    status: trip.status,
                    createdAt: trip.createdAt
                });
            }
        });

        recentBookingsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({
            stats: {
                checkIns: stats.checkIns,
                checkOuts: stats.checkOuts,
                occupancy: `${occupiedRooms} / ${totalRooms}`,
                revenueToday: stats.revenueToday * 0.90, 
                revenueTotal: stats.revenueTotal * 0.90
            },
            recentBookings: recentBookingsList.slice(0, 5),
            rooms: rooms
        });
    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 3. BOOKING MANAGEMENT
// ==========================================
router.get('/bookings', auth, async (req, res) => {
    try {
        const hotel = await Hotel.findOne({ manager: req.user.id });
        if (!hotel) return res.status(200).json({ 
            profileNeeded: true, 
            msg: "Please set up your hotel profile first." 
        });

        const hotelIdString = hotel._id.toString();
        
        const trips = await Trip.find({
            "destinations.hotelId": hotelIdString
        }).populate('user', 'name email').sort({ createdAt: -1 });

        const hotelBookings = trips.map(trip => {
            const leg = trip.destinations.find(d => d.hotelId === hotelIdString);
            if (!leg) return null;

            return {
                id: trip._id,
                guestName: trip.user ? trip.user.name : "Guest",
                checkIn: leg.checkIn,
                checkOut: leg.checkOut,
                nights: leg.nights,
                rooms: leg.selectedRooms.length,
                roomType: leg.selectedRooms[0]?.type || 'Standard',
                status: trip.status,
                contact: trip.user ? trip.user.email : "N/A"
            };
        }).filter(b => b !== null);

        res.json(hotelBookings);
    } catch (err) {
        console.error("Booking Fetch Error:", err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/hotel/bookings/:id/status
router.put('/bookings/:id/status', auth, async (req, res) => {
    const { status } = req.body;
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: 'Booking not found' });

        trip.status = status;
        await trip.save();
        res.json(trip);
    } catch (err) {
        console.error("Status Update Error:", err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;