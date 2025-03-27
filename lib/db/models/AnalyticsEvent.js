import mongoose from 'mongoose';

const AnalyticsEventSchema = new mongoose.Schema(
  {
    siteId: {
      type: String,
      required: true,
      index: true
    },
    visitorId: {
      type: String,
      required: true,
      index: true
    },
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: ['pageview', 'click', 'scroll', 'time', 'error', 'custom', 'button_click'],
      index: true
    },
    timestamp: {
      type: Date,
      required: true,
      index: true
    },
    path: {
      type: String,
      index: true
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for common queries
AnalyticsEventSchema.index({ siteId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ siteId: 1, type: 1, timestamp: -1 });
AnalyticsEventSchema.index({ sessionId: 1, timestamp: 1 });

// Create the model if it doesn't exist already
export const AnalyticsEvent = mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);