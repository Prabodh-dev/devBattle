const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
    expectedOutput: {
      type: String,
      required: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    isSample: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
testCaseSchema.index({ problem: 1 });

module.exports = mongoose.model('TestCase', testCaseSchema);
