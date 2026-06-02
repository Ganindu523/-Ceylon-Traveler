const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../utils/recommendationEngine');

router.get('/:userId', async (req, res) => {
    try {
        const recommendations = await getRecommendations(req.params.userId);
        res.json(recommendations);
    } catch (error) {
        res.status(500).json({ message: 'Error generating recommendations' });
    }
});

module.exports = router;
