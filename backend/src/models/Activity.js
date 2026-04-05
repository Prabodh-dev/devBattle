const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'problem_solved',
        'battle_won',
        'contest_participated',
        'rank_updated',
        'achievement',
        'status_update',
        'learning',
      ],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        emoji: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'friends',
    },
  },
  {
    timestamps: true,
  }
);
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ visibility: 1, createdAt: -1 });
module.exports = mongoose.model('Activity', activitySchema);
