const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getNetwork,
  sendFriendRequest,
  respondToFriendRequest,
  cancelFriendRequest,
  removeFriend,
} = require('../controllers/friend.controller');

const router = express.Router();

router.use(protect);

router.get('/', getNetwork);
router.post('/request', sendFriendRequest);
router.put('/request/:requestId/respond', respondToFriendRequest);
router.delete('/request/:requestId', cancelFriendRequest);
router.delete('/:friendId', removeFriend);

module.exports = router;
