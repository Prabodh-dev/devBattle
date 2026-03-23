const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get activity feed
router.get('/feed', protect, (req, res) => {
  res.json({ success: true, message: 'Activity feed' });
});

// Create activity
router.post('/', protect, (req, res) => {
  res.json({ success: true, message: 'Create activity' });
});

module.exports = router;
