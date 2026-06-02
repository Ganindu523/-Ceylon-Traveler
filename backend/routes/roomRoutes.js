const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Ensure you have this setup from previous steps
const cloudinary = require('../config/cloudinaryConfig'); // Ensure this is setup

// @route   GET /api/rooms
// @desc    Get rooms for the logged-in manager's hotel
router.get('/', auth, async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ manager: req.user.id });
    if (!hotel) return res.status(200).json({ profileNeeded: true, msg: 'Profile needed' });

    // Sort by room number (numeric sort if possible, otherwise string)
    const rooms = await Room.find({ hotel: hotel._id }).sort({ roomNumber: 1 });
    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/rooms
// @desc    Create a room (With Image Upload & Auto-Numbering)
router.post('/', auth, upload.array('photos', 5), async (req, res) => {
  try {
    const { type, price, status, features, description } = req.body;
    let { roomNumber } = req.body;

    const hotel = await Hotel.findOne({ manager: req.user.id });
    if (!hotel) return res.status(200).json({ profileNeeded: true, msg: 'Please set up your hotel profile first before managing rooms.' });

    // 1. Auto-Generate Room Number if empty
    if (!roomNumber) {
        const lastRoom = await Room.findOne({ hotel: hotel._id }).sort({ roomNumber: -1 }).collation({locale: "en_US", numericOrdering: true});
        if (lastRoom && !isNaN(lastRoom.roomNumber)) {
            roomNumber = parseInt(lastRoom.roomNumber) + 1;
        } else {
            roomNumber = 101; // Default start
        }
    }

    // 2. Check for Duplicates
    let existingRoom = await Room.findOne({ roomNumber, hotel: hotel._id });
    if (existingRoom) return res.status(400).json({ msg: `Room ${roomNumber} already exists` });

    // 3. Process Images
    let photoUrls = [];
    if (req.files) {
        photoUrls = req.files.map(file => file.path);
    }

    // 4. Create Room
    const newRoom = new Room({
      hotel: hotel._id,
      roomNumber,
      type,
      price,
      status,
      features: features ? features.split(',').map(f => f.trim()) : [],
      description,
      photos: photoUrls
    });

    await newRoom.save();
    res.json(newRoom);

  } catch (err) {
    console.error("Room Create Error:", err);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update room (supports adding more images)
router.put('/:id', auth, upload.array('photos', 5), async (req, res) => {
    try {
        const { roomNumber, type, price, status, features, description, existingPhotos } = req.body;
        
        let room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ msg: 'Room not found' });

        // Handle Photos: Keep existing ones that weren't deleted + Add new ones
        let updatedPhotos = existingPhotos ? (Array.isArray(existingPhotos) ? existingPhotos : [existingPhotos]) : [];
        if (req.files) {
            const newUrls = req.files.map(file => file.path);
            updatedPhotos = [...updatedPhotos, ...newUrls];
        }

        // Update Fields
        room.roomNumber = roomNumber || room.roomNumber;
        room.type = type || room.type;
        room.price = price || room.price;
        room.status = status || room.status;
        room.features = features ? features.split(',').map(f => f.trim()) : room.features;
        room.description = description || room.description;
        room.photos = updatedPhotos;

        await room.save();
        res.json(room);

    } catch (err) {
        console.error("Room Update Error:", err);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/rooms/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) return res.status(404).json({ msg: 'Room not found' });

        // Optional: Add Cloudinary delete logic here for room.photos

        await Room.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Room removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;