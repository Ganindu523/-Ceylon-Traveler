const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Trip = require('../models/Trip');

// @route   POST /api/trips
// @desc    Create a new trip (Used by PlanTripPage)
router.post('/', auth, async (req, res) => {
  try {
    const newTrip = new Trip({
      user: req.user.id,
      ...req.body
    });
    const trip = await newTrip.save();
    res.json(trip);
  } catch (err) {
    console.error("Trip Save Error:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/trips
// @desc    Get ALL bookings for the logged-in user (History)
router.get('/', auth, async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(trips);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/trips/:id/cancel
// @desc    Cancel a booking
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: "Trip not found" });
        
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User not authorized" });
        }

        trip.status = 'Cancelled';
        await trip.save();
        res.json(trip);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

const User = require('../models/User');
const { sendBookingEmail } = require('../utils/mailer');

// @route   POST /api/trips/:id/confirm
// @desc    Confirm booking (Mock Payment)
router.post('/:id/confirm', auth, async (req, res) => {
    try {
        const { cardName, last4Digits, usdToLkrRate } = req.body;
        
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ msg: "Trip not found" });

        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User not authorized" });
        }

        const user = await User.findById(req.user.id);

        trip.status = 'Confirmed';
        trip.paymentDetails = {
            paidAt: new Date(),
            method: 'Credit Card',
            cardName: cardName,
            cardLast4: last4Digits,
            status: 'Paid'
        };

        await trip.save();

        // Trigger Email Notification (Background)
        try {
            await sendBookingEmail(user.email, trip, usdToLkrRate || 300);
            console.log(`📩 Confirmation email sent to ${user.email}`);
        } catch (emailErr) {
            console.error("❌ Email Dispatch Failed:", emailErr.message);
        }

        res.json(trip);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;