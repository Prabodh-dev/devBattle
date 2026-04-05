const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
    },
    content: {
      type: String,
    },
    messageType: {
      type: String,
      enum: ['text', 'code', 'image', 'system'],
      default: 'text',
    },
    codeSnippet: {
      language: String,
      code: String,
    },
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model('Message', messageSchema);
