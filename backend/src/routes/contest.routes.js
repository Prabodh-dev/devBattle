const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Placeholder routes
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Get contests' });
});

router.post('/', protect, (req, res) => {
  res.json({ success: true, message: 'Create contest' });
});

router.get('/:id', protect, (req, res) => {
  res.json({ success: true, message: 'Get contest details' });
});

router.post('/:id/register', protect, (req, res) => {
  res.json({ success: true, message: 'Register for contest' });
});

module.exports = router;
