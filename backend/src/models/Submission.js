const mongoose = require('mongoose');
const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest',
    },
    battle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Battle',
    },
    language: {
      type: String,
      enum: ['python', 'javascript', 'java', 'cpp', 'c'],
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'accepted',
        'wrong_answer',
        'time_limit_exceeded',
        'memory_limit_exceeded',
        'runtime_error',
        'compilation_error',
      ],
      default: 'pending',
    },
    runtime: {
      type: Number, 
    },
    memory: {
      type: Number, 
    },
    testCasesPassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    testResults: [
      {
        testCaseId: mongoose.Schema.Types.ObjectId,
        passed: Boolean,
        input: String,
        expectedOutput: String,
        actualOutput: String,
        runtime: Number,
        memory: Number,
        error: String,
      },
    ],
    error: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ contest: 1 });
submissionSchema.index({ battle: 1 });
submissionSchema.index({ status: 1 });
module.exports = mongoose.model('Submission', submissionSchema);
