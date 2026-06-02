const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Image upload
const Trip = require('../models/Trip');
const User = require('../models/User');

// ==========================================
// 1. DASHBOARD ROUTES
// ==========================================

// @route   GET /api/taxi/dashboard
router.get('/dashboard', auth, async (req, res) => {
    try {
        const driverId = req.user.id;
        const driver = await User.findById(driverId).select('isOnline name profileImage vehicleType');

        const trips = await Trip.find({
            "destinations.selectedDriver._id": driverId,
            status: { $in: ['Confirmed', 'Completed'] } 
        }).populate('user', 'name');

        let totalRides = 0;
        let grossEarnings = 0;
        let rideHistory = [];

        trips.forEach(trip => {
            trip.destinations.forEach(leg => {
                if (leg.selectedDriver && leg.selectedDriver._id.toString() === driverId) {
                    totalRides++;
                    const fare = Number(leg.transportCost) || 0;
                    grossEarnings += fare;

                    rideHistory.push({
                        id: trip._id,
                        customer: trip.user ? trip.user.name : "Guest",
                        date: new Date(leg.checkIn).toLocaleDateString(),
                        pickup: leg.district,
                        dropoff: leg.hotelDetails?.city || leg.district,
                        distance: leg.distanceKm,
                        fare: fare,
                        status: trip.status
                    });
                }
            });
        });

        rideHistory.reverse();
        const netEarnings = grossEarnings * 0.90;

        res.json({
            profile: driver,
            stats: { totalRides, totalEarnings: netEarnings, rating: 4.8 },
            rides: rideHistory.slice(0, 5)
        });

    } catch (err) {
        console.error("Taxi Dashboard Error:", err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/taxi/availability
router.put('/availability', auth, async (req, res) => {
    try {
        const driver = await User.findById(req.user.id);
        driver.isOnline = !driver.isOnline;
        await driver.save();
        res.json({ isOnline: driver.isOnline });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// ==========================================
// 2. PROFILE MANAGEMENT ROUTES (NEW)
// ==========================================

// @route   GET /api/taxi/profile
// @desc    Get current driver profile details
router.get('/profile', auth, async (req, res) => {
    try {
        const driver = await User.findById(req.user.id).select('-password');
        res.json(driver);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/taxi/profile
// @desc    Update driver profile text details
router.put('/profile', auth, async (req, res) => {
    const { name, vehicleType, vehicleModel, licensePlate, pricePerKm, workingDistricts, description } = req.body;
    try {
        const driver = await User.findById(req.user.id);
        if(!driver) return res.status(404).json({ msg: "User not found" });

        driver.name = name || driver.name;
        driver.vehicleType = vehicleType || driver.vehicleType;
        driver.vehicleModel = vehicleModel || driver.vehicleModel;
        driver.licensePlate = licensePlate || driver.licensePlate;
        driver.pricePerKm = pricePerKm || driver.pricePerKm;
        driver.workingDistricts = workingDistricts || driver.workingDistricts;
        driver.description = description || driver.description;

        await driver.save();
        res.json(driver);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/taxi/profile/avatar
// @desc    Upload Profile Picture
router.post('/profile/avatar', auth, upload.single('photos'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
        
        const driver = await User.findById(req.user.id);
        driver.profileImage = req.file.path; // Cloudinary URL
        await driver.save();
        res.json(driver.profileImage);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/taxi/profile/vehicle-photos
// @desc    Upload Vehicle Photos
router.post('/profile/vehicle-photos', auth, upload.array('photos', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ msg: 'No files uploaded' });

        const driver = await User.findById(req.user.id);
        const newPhotos = req.files.map(f => f.path);
        
        // Append new photos to existing array
        driver.vehicleImages = driver.vehicleImages.concat(newPhotos);
        
        await driver.save();
        res.json(driver.vehicleImages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.get('/rides', auth, async (req, res) => {
    try {
        const driverId = req.user.id;

        // Find trips containing this driver
        const trips = await Trip.find({
            "destinations.selectedDriver._id": driverId,
            status: { $ne: 'Cancelled' } // Exclude cancelled
        }).populate('user', 'name phone email').sort({ createdAt: -1 });

        let rides = [];

        trips.forEach(trip => {
            // Find specific legs assigned to this driver
            trip.destinations.forEach((leg, index) => {
                if (leg.selectedDriver && leg.selectedDriver._id.toString() === driverId) {
                    
                    // Determine Pickup/Dropoff
                    // Leg 0 starts at Airport (or default origin), others start from previous leg
                    let pickupLocation = "Colombo Airport (CMB)";
                    if (index > 0) {
                        const prevLeg = trip.destinations[index - 1];
                        pickupLocation = prevLeg.hotelDetails?.name || prevLeg.district;
                    }
                    const dropoffLocation = leg.hotelDetails?.name || leg.district;

                    rides.push({
                        tripId: trip._id,
                        legId: leg._id || index, // Unique ID for the ride leg
                        customerName: trip.user ? trip.user.name : "Guest User",
                        customerPhone: trip.user ? trip.user.phone : "N/A",
                        date: new Date(leg.checkIn).toLocaleDateString(),
                        time: "10:00 AM", // Placeholder or add time to schema
                        pickup: pickupLocation,
                        dropoff: dropoffLocation,
                        distance: leg.distanceKm,
                        price: leg.transportCost,
                        status: trip.status // 'Confirmed' = Upcoming, 'Completed' = Done
                    });
                }
            });
        });

        res.json(rides);
    } catch (err) {
        console.error("Taxi Rides Error:", err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/taxi/rides/:id/complete
// @desc    Mark a trip as Completed
router.put('/rides/:id/complete', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: 'Trip not found' });

        // Update Status
        trip.status = 'Completed';
        // Optional: Update payment status here if cash on hand
        
        await trip.save();
        res.json(trip);
    } catch (err) {
        console.error("Complete Ride Error:", err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/taxi/profile/vehicle-photos
// @desc    Delete a Vehicle Photo
router.delete('/profile/vehicle-photos', auth, async (req, res) => {
    const { photoUrl } = req.body;
    try {
        const driver = await User.findById(req.user.id);
        driver.vehicleImages = driver.vehicleImages.filter(img => img !== photoUrl);
        await driver.save();
        res.json(driver.vehicleImages);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;