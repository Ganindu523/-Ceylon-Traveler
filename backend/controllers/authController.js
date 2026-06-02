// Note: No need for require('dotenv').config() here if it's at the top of server.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration
exports.register = async (req, res) => {
  const { name, email, password, role, identificationNumber } = req.body;

  if (!name || !email || !password || !role || !identificationNumber) {
     return res.status(400).json({ msg: 'Please enter all required fields' });
  }

  try {
    let user = await User.findOne({ $or: [{ email }, { identificationNumber }] });
    if (user) {
      return res.status(400).json({ msg: 'User with this email or ID already exists' });
    }

    // --- FIX: EXPLICIT APPROVAL LOGIC ---
    // Force 'taxi', 'guide', and 'hotel' to be Pending (false).
    // 'tourist' and 'admin' are Auto-Approved (true).
    let isApproved = true; 
    if (['taxi', 'guide', 'hotel'].includes(role)) {
        isApproved = false;
    }

    user = new User({ 
        name, 
        email, 
        password, 
        role, 
        identificationNumber,
        isApproved // ✅ Save this explicitly
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();
    
    const payload = { user: { id: user.id, role: user.role } };
    
    // Check if JWT_SECRET exists before signing
    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
        return res.status(500).send('Server configuration error');
    }

    jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: '5h' }, 
        (err, token) => {
            if (err) {
                 console.error("JWT Sign Error (Register):", err);
                 return res.status(500).send('Error generating token');
            };
            // Return token AND user role/status for frontend redirection
            res.status(201).json({ 
                token, 
                user: {
                    id: user.id,
                    role: user.role,
                    isApproved: user.isApproved
                }
            }); 
        }
    );
  } catch (err) {
    console.error("Registration Error:", err.message); 
     if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({ msg: messages.join(', ') });
    }
    res.status(500).send('Server error during registration');
  }
};

// User Login
exports.login = async (req, res) => {
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
    
    // Check if JWT_SECRET exists before signing
    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
        return res.status(500).send('Server configuration error');
    }

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: '5h' }, 
        (err, token) => {
            if (err) {
                 console.error("JWT Sign Error (Login):", err);
                 return res.status(500).send('Error generating token');
            };
            res.json({ token });
        }
    );
  } catch (err) {
    console.error("Login Error:", err.message); 
    res.status(500).send('Server error during login');
  }
};