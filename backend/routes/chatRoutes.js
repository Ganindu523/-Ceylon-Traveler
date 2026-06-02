const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get chat history for a specific room
router.get('/history/:room', async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.room })
            .sort({ timestamp: 1 })
            .limit(50);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

module.exports = router;
