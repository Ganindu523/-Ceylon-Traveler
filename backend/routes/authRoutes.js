require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ FIXED: Import the middleware so 'authMiddleware is not defined' error stops
const authMiddleware = require('../middleware/authMiddleware'); 

// @route   POST api/auth/register
// @desc    Register a new user (all roles)
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role, identificationNumber } = req.body;

  if (!name || !email || !password || !role || !identificationNumber) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ $or: [{ email }, { identificationNumber }] });
    if (user) {
      return res.status(400).json({ msg: 'User with this email or ID already exists' });
    }

    // --- APPROVAL LOGIC ---
    // Taxis/Guides are NOT approved by default (Secure)
    // Change false to true below if you want them instant-approved for testing
    let isApproved = true; 
    if (role === 'guide' || role === 'taxi' || role === 'hotel') {
        isApproved = false; 
    }

    user = new User({
      name,
      email,
      password,
      role,
      identificationNumber,
      isApproved // Save the status
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/auth/me
// @desc    Get current logged in user (Fixes the 404 Error)
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // Create the token payload
    const payload = {
      user: {
        id: user.id,
        role: user.role, 
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;