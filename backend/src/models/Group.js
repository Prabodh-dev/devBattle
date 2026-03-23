const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    groupPicture: {
      type: String,
      default: '',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
      },
    ],
    settings: {
      allowMemberInvites: {
        type: Boolean,
        default: false,
      },
      allowContests: {
        type: Boolean,
        default: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for member count
groupSchema.virtual('memberCount').get(function () {
  return this.members.length;
});

module.exports = mongoose.model('Group', groupSchema);
