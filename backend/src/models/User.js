const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    profilePicture: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 1200,
      min: 0,
    },
    rank: {
      type: String,
      enum: ['Beginner', 'Coder', 'Expert', 'Master', 'Grandmaster'],
      default: 'Beginner',
    },
    stats: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      problemsSolved: { type: Number, default: 0 },
      totalBattles: { type: Number, default: 0 },
      contestsParticipated: { type: Number, default: 0 },
    },
    preferredLanguages: [
      {
        type: String,
        enum: ['python', 'javascript', 'java', 'cpp', 'c'],
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    socketId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update rank based on rating
userSchema.methods.updateRank = function () {
  if (this.rating >= 2400) this.rank = 'Grandmaster';
  else if (this.rating >= 2000) this.rank = 'Master';
  else if (this.rating >= 1600) this.rank = 'Expert';
  else if (this.rating >= 1200) this.rank = 'Coder';
  else this.rank = 'Beginner';
};

module.exports = mongoose.model('User', userSchema);
