const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const Trip = require('../models/Trip');

const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') next();
    else res.status(403).json({ msg: 'Access denied.' });
};

// @route   GET /api/admin/stats
router.get('/stats', auth, checkAdmin, async (req, res) => {
    try {
        // 1. Total Users (Exclude Admins)
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

        // 2. Pending Approvals
        const pendingApprovals = await User.countDocuments({ isApproved: false, role: { $ne: 'tourist' } });

        // 3. Total Revenue (10% Platform Fee)
        const trips = await Trip.find({ status: 'Completed' });
        
        const grossRevenue = trips.reduce((acc, trip) => acc + (trip.totalPriceLKR || 0), 0);
        const netRevenue = grossRevenue * 0.10; // ✅ Take only 10%

        res.json({
            totalUsers,
            pendingApprovals,
            totalEarnings: netRevenue 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/pending
router.get('/pending', auth, checkAdmin, async (req, res) => {
    try {
        const users = await User.find({ 
            isApproved: false, 
            role: { $in: ['hotel', 'taxi', 'guide'] } 
        }).select('-password');
        res.json({ users });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/admin/approve/:id
router.patch('/approve/:id', auth, checkAdmin, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { isApproved: true });
        res.json({ msg: 'User Approved' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/admin/reject/:id
router.delete('/reject/:id', auth, checkAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User Rejected' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/trips
router.get('/trips', auth, checkAdmin, async (req, res) => {
    try {
        const trips = await Trip.find().populate('user', 'name email phone').sort({ createdAt: -1 });
        res.json(trips);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/admin/admins
router.get('/admins', auth, checkAdmin, async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.json(admins);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/admin/create-admin
router.post('/create-admin', auth, checkAdmin, async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        const newUser = new User({ name, email, password, role: 'admin', isApproved: true });
        const salt = await require('bcryptjs').genSalt(10);
        newUser.password = await require('bcryptjs').hash(password, salt);
        
        await newUser.save();
        res.json(newUser);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/admin/admins/:id
router.delete('/admins/:id', auth, checkAdmin, async (req, res) => {
    try {
        if (req.params.id === req.user.id) return res.status(400).json({ msg: "Cannot delete self" });
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: "Admin removed" });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;