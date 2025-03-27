import mongoose from 'mongoose';

const VisitorSchema = new mongoose.Schema(
  {
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
    firstSeen: {
      type: Date,
      required: true
    },
    lastSeen: {
      type: Date,
      required: true
    },
    fingerprint: {
      type: String,
      sparse: true
    },
    ipAddress: {
      type: String,
      default: 'unknown'
    },
    userAgent: {
      type: String
    },
    country: {
      type: String
    },
    region: {
      type: String
    },
    city: {
      type: String
    },
    device: {
      type: String
    },
    browser: {
      type: String
    },
    os: {
      type: String
    },
    optOut: {
      type: Boolean,
      default: false
    },
    properties: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound index for faster lookups
VisitorSchema.index({ visitorId: 1, siteId: 1 }, { unique: true });

// Create the model if it doesn't exist already
export const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', VisitorSchema);