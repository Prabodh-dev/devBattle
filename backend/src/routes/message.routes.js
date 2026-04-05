const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();
router.get('/conversations', protect, (req, res) => {
  res.json({ success: true, message: 'Get conversations' });
});
router.get('/:conversationId', protect, (req, res) => {
  res.json({ success: true, message: 'Get messages' });
});
router.post('/', protect, (req, res) => {
  res.json({ success: true, message: 'Send message' });
});
module.exports = router;
