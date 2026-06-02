const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); 
const Trip = require('../models/Trip'); // ✅ Changed from TourBooking to Trip
const User = require('../models/User');

// Middleware: Ensure user is a Guide
const checkGuideRole = (req, res, next) => {
    if (req.user && (req.user.role === 'guide' || req.user.role === 'admin')) { 
        next();
    } else {
        res.status(403).json({ msg: 'Access denied. Guides only.' });
    }
};

// ==========================================
// 1. DASHBOARD STATS & OVERVIEW
// ==========================================

// @route   GET /api/guide/dashboard-stats
router.get('/dashboard-stats', auth, checkGuideRole, async (req, res) => {
    try {
        const guideId = req.user.id;
        
        // Find trips assigned to this guide
        const trips = await Trip.find({
            "destinations.selectedGuideId": guideId
        });

        let totalEarnings = 0;
        let completedCount = 0;
        let upcomingCount = 0;
        let pendingCount = 0;
        const now = new Date();

        trips.forEach(trip => {
            trip.destinations.forEach(leg => {
                if (leg.selectedGuideId === guideId) {
                    // Calculate Earnings (Price per day * nights)
                    if (trip.status === 'Completed') {
                        const days = leg.nights || 1;
                        const price = leg.selectedGuideDetails?.pricePerDay || 0;
                        totalEarnings += (days * price);
                        completedCount++;
                    } else if (trip.status === 'Confirmed') {
                        // Check if date is future
                        if (new Date(leg.checkIn) >= now) {
                            upcomingCount++;
                        }
                    } else if (trip.status === 'Pending') {
                        pendingCount++;
                    }
                }
            });
        });

        res.json({
            earnings: totalEarnings,
            completedTours: completedCount,
            upcomingTours: upcomingCount,
            pendingRequests: pendingCount
        });

    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/guide/schedules (Upcoming)
router.get('/schedules', auth, checkGuideRole, async (req, res) => {
    try {
        const guideId = req.user.id;
        const now = new Date();

        const trips = await Trip.find({
            "destinations.selectedGuideId": guideId,
            status: { $in: ['Confirmed', 'Pending'] }
        }).populate('user', 'name phone').sort({ createdAt: -1 });

        let schedules = [];

        trips.forEach(trip => {
            trip.destinations.forEach(leg => {
                if (leg.selectedGuideId === guideId && new Date(leg.checkIn) >= now) {
                    schedules.push({
                        _id: trip._id,
                        touristName: trip.user ? trip.user.name : "Guest",
                        date: leg.checkIn,
                        tourPackage: `${leg.district} (${leg.nights} Days)`,
                        status: trip.status
                    });
                }
            });
        });

        res.json(schedules);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/guide/history (Past)
router.get('/history', auth, checkGuideRole, async (req, res) => {
    try {
        const guideId = req.user.id;
        const trips = await Trip.find({
            "destinations.selectedGuideId": guideId,
            status: { $in: ['Completed', 'Cancelled'] }
        }).populate('user', 'name').sort({ createdAt: -1 });

        let history = [];

        trips.forEach(trip => {
            trip.destinations.forEach(leg => {
                if (leg.selectedGuideId === guideId) {
                    const price = (leg.selectedGuideDetails?.pricePerDay || 0) * (leg.nights || 1);
                    history.push({
                        _id: trip._id,
                        touristName: trip.user ? trip.user.name : "Guest",
                        date: leg.checkIn,
                        tourPackage: leg.district,
                        totalPrice: price,
                        status: trip.status
                    });
                }
            });
        });

        res.json(history);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 2. BOOKING MANAGEMENT (FULL LIST)
// ==========================================

// @route   GET /api/guide/bookings
router.get('/bookings', auth, checkGuideRole, async (req, res) => {
    try {
        const guideId = req.user.id;
        
        const trips = await Trip.find({
            "destinations.selectedGuideId": guideId
        }).populate('user', 'name phone email').sort({ createdAt: -1 });

        let bookings = [];

        trips.forEach(trip => {
            trip.destinations.forEach(leg => {
                if (leg.selectedGuideId === guideId) {
                    const price = (leg.selectedGuideDetails?.pricePerDay || 0) * (leg.nights || 1);
                    
                    bookings.push({
                        _id: trip._id,
                        touristName: trip.user ? trip.user.name : "Guest",
                        touristPhone: trip.user ? trip.user.phone : "N/A",
                        touristEmail: trip.user ? trip.user.email : "N/A",
                        date: leg.checkIn,
                        tourPackage: `${leg.district} - ${leg.nights} Nights`,
                        totalPrice: price,
                        status: trip.status,
                        notes: "Standard Tour" 
                    });
                }
            });
        });

        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/guide/bookings/:id/status
router.patch('/bookings/:id/status', auth, checkGuideRole, async (req, res) => {
    const { status } = req.body;
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: 'Booking not found' });

        trip.status = status;
        await trip.save();
        res.json(trip);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 3. PROFILE MANAGEMENT (UNCHANGED)
// ==========================================

// @route   GET /api/guide/profile
router.get('/profile', auth, checkGuideRole, async (req, res) => {
    try {
        const guide = await User.findById(req.user.id).select('-password');
        res.json(guide);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/guide/profile
router.put('/profile', auth, checkGuideRole, async (req, res) => {
    const { name, phone, bio, guideType, serviceAreas, pricePerDay, languages } = req.body;
    
    let updatedAreas = serviceAreas;
    if (guideType === 'All Island') {
        updatedAreas = ['All Island']; 
    }

    const updateFields = {
        name, phone, bio, guideType,
        serviceAreas: updatedAreas,
        pricePerDay, languages
    };

    try {
        const guide = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');
        res.json(guide);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/guide/profile/avatar
router.post('/profile/avatar', auth, (req, res) => {
    upload.single('photos')(req, res, async (err) => {
        if (err) return res.status(400).json({ msg: err.message });
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

        try {
            const guide = await User.findById(req.user.id);
            guide.profileImage = req.file.path; 
            await guide.save();
            res.json(guide.profileImage);
        } catch (dbErr) {
            res.status(500).send('Server Error');
        }
    });
});

module.exports = router;