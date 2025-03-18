import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a team name'],
      maxlength: [60, 'Name cannot be more than 60 characters'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot be more than 200 characters'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['admin', 'member', 'viewer'],
        default: 'member',
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isDefault: {
      type: Boolean,
      default: false,
    },
    settings: {
      notificationChannels: {
        email: {
          enabled: {
            type: Boolean,
            default: true,
          },
          recipients: [String],
        },
        slack: {
          enabled: {
            type: Boolean,
            default: false,
          },
          webhookUrl: String,
          channel: String,
        },
        sms: {
          enabled: {
            type: Boolean,
            default: false,
          },
          recipients: [String],
        },
        whatsapp: {
          enabled: {
            type: Boolean,
            default: false,
          },
          recipients: [String],
        },
      },
      escalationPolicies: [{
        name: String,
        steps: [{
          delay: Number, // minutes
          targets: [{
            type: {
              type: String,
              enum: ['user', 'team', 'channel'],
            },
            id: mongoose.Schema.Types.ObjectId, // user or team id
            channel: String, // channel for notification
          }],
        }],
      }],
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
TeamSchema.index({ owner: 1 });
TeamSchema.index({ 'members.userId': 1 });

export default mongoose.models.Team || mongoose.model('Team', TeamSchema); 