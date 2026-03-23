const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    constraints: [String],
    inputFormat: {
      type: String,
    },
    outputFormat: {
      type: String,
    },
    timeLimit: {
      type: Number,
      default: 2000, // milliseconds
    },
    memoryLimit: {
      type: Number,
      default: 256, // MB
    },
    hints: [String],
    solutionTemplate: {
      python: String,
      javascript: String,
      java: String,
      cpp: String,
      c: String,
    },
    starterCode: {
      python: String,
      javascript: String,
      java: String,
      cpp: String,
      c: String,
    },
    stats: {
      totalSubmissions: { type: Number, default: 0 },
      acceptedSubmissions: { type: Number, default: 0 },
      totalSolved: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for acceptance rate
problemSchema.virtual('acceptanceRate').get(function () {
  if (this.stats.totalSubmissions === 0) return 0;
  return ((this.stats.acceptedSubmissions / this.stats.totalSubmissions) * 100).toFixed(2);
});

module.exports = mongoose.model('Problem', problemSchema);
