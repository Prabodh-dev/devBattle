const mongoose = require('mongoose');
const FriendRequest = require('../models/FriendRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mapUser = (user) => {
  if (!user) return null;
  const { _id, username, email, rating, rank, bio, preferredLanguages, avatar } = user;
  return { _id, username, email, rating, tier: rank, bio, languages: preferredLanguages, avatar };
};
const getNetwork = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('friends', 'username email rating rank bio preferredLanguages');
    const incoming = await FriendRequest.find({ recipient: userId, status: 'pending' })
      .populate('sender', 'username email rating rank bio preferredLanguages')
      .lean();
    const outgoing = await FriendRequest.find({ sender: userId, status: 'pending' })
      .populate('recipient', 'username email rating rank bio preferredLanguages')
      .lean();
    res.json({
      success: true,
      data: {
        friends: (user?.friends || []).map(mapUser),
        pending: {
          incoming,
          outgoing,
        },
      },
    });
  } catch (error) {
    console.error('Failed to load network', error);
    res.status(500).json({ success: false, message: 'Failed to load developer network' });
  }
};
const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { recipientId } = req.body;
    if (!recipientId || !mongoose.Types.ObjectId.isValid(recipientId)) {
      return res.status(400).json({ success: false, message: 'Recipient is required' });
    }
    if (senderId.toString() === recipientId) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself' });
    }
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Developer not found' });
    }
    const alreadyFriends = await User.findOne({ _id: senderId, friends: recipientId });
    if (alreadyFriends) {
      return res.status(400).json({ success: false, message: 'You are already connected' });
    }
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId, status: 'pending' },
        { sender: recipientId, recipient: senderId, status: 'pending' },
      ],
    });
    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'Request already exists' });
    }
    const request = await FriendRequest.create({ sender: senderId, recipient: recipientId });
    await request.populate('recipient', 'username email rating rank bio preferredLanguages');
    await Notification.create({
      user: recipientId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${req.user.username} wants to connect`,
      data: {
        requestId: request._id,
        senderId: senderId,
        senderName: req.user.username,
      },
      link: '/app/friends',
    });
    const populated = await FriendRequest.findById(request._id)
      .populate('recipient', 'username email rating rank bio preferredLanguages')
      .populate('sender', 'username email rating rank bio preferredLanguages');
    res.status(201).json({ success: true, data: populated || request });
  } catch (error) {
    console.error('Failed to send friend request', error);
    res.status(500).json({ success: false, message: 'Failed to send request' });
  }
};
const respondToFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;
    const { action } = req.body;
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    const request = await FriendRequest.findById(requestId)
      .populate('sender', 'username email rating rank bio preferredLanguages avatar')
      .populate('recipient', 'username email rating rank bio preferredLanguages avatar');
    if (!request || request.recipient.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Request already handled' });
    }
    request.status = action === 'accept' ? 'accepted' : 'declined';
    await request.save();
    if (action === 'accept') {
      await User.findByIdAndUpdate(request.sender._id, { $addToSet: { friends: request.recipient._id } });
      await User.findByIdAndUpdate(request.recipient._id, { $addToSet: { friends: request.sender._id } });
      await Notification.create({
        user: request.sender._id,
        type: 'friend_accepted',
        title: 'Friend Request Accepted',
        message: `${req.user.username} accepted your request`,
        data: {
          friendId: request.recipient._id,
          requestId: request._id,
          recipientName: req.user.username,
        },
        link: '/app/friends',
      });
    }
    res.json({ success: true, data: request });
  } catch (error) {
    console.error('Failed to update friend request', error);
    res.status(500).json({ success: false, message: 'Failed to update request' });
  }
};
const cancelFriendRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { requestId } = req.params;
    const request = await FriendRequest.findById(requestId);
    if (!request || request.sender.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    await Notification.deleteMany({ 'data.requestId': requestId });
    await request.deleteOne();
    res.json({ success: true, message: 'Request cancelled' });
  } catch (error) {
    console.error('Failed to cancel request', error);
    res.status(500).json({ success: false, message: 'Failed to cancel request' });
  }
};
const removeFriend = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.params;
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });
    res.json({ success: true, message: 'Friend removed' });
  } catch (error) {
    console.error('Failed to remove friend', error);
    res.status(500).json({ success: false, message: 'Failed to remove friend' });
  }
};
module.exports = {
  getNetwork,
  sendFriendRequest,
  respondToFriendRequest,
  cancelFriendRequest,
  removeFriend,
};
