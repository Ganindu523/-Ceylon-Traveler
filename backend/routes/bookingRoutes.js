const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Trip = require('../models/Trip');

// @route   GET /api/bookings
// @desc    Get ALL bookings (History List)
router.get('/', auth, async (req, res) => {
    try {
        // Return array of trips sorted by newest
        const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(trips);
    } catch (err) {
        console.error("Fetch History Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/bookings/latest
// @desc    Get ONLY the most recent trip (Optional helper)
router.get('/latest', auth, async (req, res) => {
    try {
        const trip = await Trip.findOne({ user: req.user.id }).sort({ createdAt: -1 });
        if (!trip) return res.status(404).json({ msg: "No booking found" });
        res.json(trip);
    } catch (err) {
        console.error("Fetch Latest Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/bookings/:id/cancel
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: "Trip not found" });
        
        if (trip.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });

        trip.status = 'Cancelled';
        await trip.save();
        res.json(trip);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/bookings/:id/confirm
router.post('/:id/confirm', auth, async (req, res) => {
    try {
        const { cardName, last4Digits } = req.body;
        const trip = await Trip.findById(req.params.id);
        
        if (!trip) return res.status(404).json({ msg: "Trip not found" });
        if (trip.user.toString() !== req.user.id) return res.status(401).json({ msg: "Not authorized" });

        trip.status = 'Confirmed';
        trip.paymentDetails = {
            paidAt: new Date(),
            method: 'Credit Card',
            cardName,
            cardLast4: last4Digits,
            status: 'Paid'
        };

        await trip.save();
        res.json(trip);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;