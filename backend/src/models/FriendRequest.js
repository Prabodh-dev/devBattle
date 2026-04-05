const mongoose = require('mongoose');
const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
    },
    message: {
      type: String,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  }
);
friendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });
module.exports = mongoose.model('FriendRequest', friendRequestSchema);
