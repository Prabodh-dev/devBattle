const mongoose = require('mongoose');
const battleSchema = new mongoose.Schema(
  {
    challenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opponent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      default: 1800000, 
    },
    submissions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        submittedAt: Date,
        status: String,
        runtime: Number,
        memory: Number,
      },
    ],
    ratingChange: {
      challenger: { type: Number, default: 0 },
      opponent: { type: Number, default: 0 },
    },
    roomId: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);
battleSchema.index({ challenger: 1 });
battleSchema.index({ opponent: 1 });
battleSchema.index({ status: 1 });
battleSchema.index({ roomId: 1 });
module.exports = mongoose.model('Battle', battleSchema);
