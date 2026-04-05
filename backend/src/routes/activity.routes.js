const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.get('/feed', protect, (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  res.json({ 
    success: true, 
    data: {
      activities: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0
      }
    }
  });
});
router.post('/', protect, (req, res) => {
  const { type, description } = req.body;
  res.json({ 
    success: true, 
    data: {
      id: Date.now().toString(),
      user: req.user.id,
      type,
      description,
      createdAt: new Date()
    }
  });
});
module.exports = router;
