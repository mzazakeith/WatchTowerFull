import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
      trim: true,
      lowercase: true,
      sparse: true, // Allows null/undefined values with unique index
    },
    phone: {
      type: String,
      trim: true,
      sparse: true, // Allows null/undefined values with unique index
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [60, 'Name cannot be more than 60 characters'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'viewer'],
      default: 'user',
    },
    teams: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    }],
    primaryTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    authCode: {
      code: String,
      expiresAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
      lastAttempt: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
        slack: {
          type: Boolean,
          default: false,
        },
        whatsapp: {
          type: Boolean,
          default: false,
        },
      },
      contactInfo: {
        slackUserId: String,
        whatsappNumber: String,
      },
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ teams: 1 });

// Validate that either email or phone is provided
UserSchema.pre('save', function(next) {
  if (!this.email && !this.phone) {
    return next(new Error('Either email or phone is required'));
  }
  next();
});

export default mongoose.models.User || mongoose.model('User', UserSchema);