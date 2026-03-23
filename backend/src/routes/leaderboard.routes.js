const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get global leaderboard
router.get('/global', (req, res) => {
  res.json({ success: true, message: 'Global leaderboard' });
});

// Get contest leaderboard
router.get('/contest/:id', protect, (req, res) => {
  res.json({ success: true, message: 'Contest leaderboard' });
});

module.exports = router;
