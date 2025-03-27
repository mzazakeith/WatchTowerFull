import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    visitorId: {
      type: String,
      required: true,
      index: true
    },
    siteId: {
      type: String,
      required: true,
      index: true
    },
    startedAt: {
      type: Date,
      required: true
    },
    endedAt: {
      type: Date
    },
    lastActivity: {
      type: Date,
      required: true
    },
    duration: {
      type: Number
    },
    referrer: {
      type: String
    },
    referrerDomain: {
      type: String
    },
    entryPage: {
      type: String
    },
    exitPage: {
      type: String
    },
    pageviews: {
      type: Number,
      default: 1
    },
    bounced: {
      type: Boolean,
      default: true
    },
    utm: {
      source: String,
      medium: String,
      campaign: String,
      term: String,
      content: String
    },
    device: {
      type: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'other']
      },
      browser: String,
      os: String,
      screenSize: String
    }
  },
  {
    timestamps: true
  }
);

// Compound index for faster lookups
SessionSchema.index({ sessionId: 1, visitorId: 1, siteId: 1 }, { unique: true });
SessionSchema.index({ siteId: 1, startedAt: -1 });

// Create the model if it doesn't exist already
export const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);