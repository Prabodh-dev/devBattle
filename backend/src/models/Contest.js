const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problems: [
      {
        problem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Problem',
        },
        points: {
          type: Number,
          default: 100,
        },
        order: Number,
      },
    ],
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in milliseconds
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming', 'live', 'completed'],
      default: 'upcoming',
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        score: {
          type: Number,
          default: 0,
        },
        rank: Number,
        problemsSolved: {
          type: Number,
          default: 0,
        },
      },
    ],
    rules: {
      allowLateSubmissions: {
        type: Boolean,
        default: false,
      },
      penaltyPerWrongSubmission: {
        type: Number,
        default: 10,
      },
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
contestSchema.index({ group: 1 });
contestSchema.index({ status: 1 });
contestSchema.index({ startTime: 1 });

module.exports = mongoose.model('Contest', contestSchema);
