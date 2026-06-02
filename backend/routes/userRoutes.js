const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const User = require('../models/User');

// @route   GET /api/users/profile
// @desc    Get current user profile (Tourist/General)
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/users/profile
// @desc    Update user details
router.put('/profile', auth, async (req, res) => {
    const { name, phone, bio, nationality, passportNumber } = req.body;

    // Build object to check fields
    const userFields = {};
    if (name) userFields.name = name;
    if (phone) userFields.phone = phone;
    if (bio) userFields.description = bio; // Mapping 'bio' to 'description' in DB
    // Assuming you might want to add specific fields to User model later:
    // if (nationality) userFields.nationality = nationality; 
    // if (passportNumber) userFields.identificationNumber = passportNumber;

    try {
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/users/profile/avatar
// @desc    Upload User Avatar
router.post('/profile/avatar', auth, upload.single('photos'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });

        const user = await User.findById(req.user.id);
        user.profileImage = req.file.path;
        await user.save();
        
        res.json(user.profileImage);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;