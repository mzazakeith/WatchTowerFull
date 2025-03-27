import mongoose from 'mongoose';

const SiteSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    domain: {
      type: String,
      required: true
    },
    settings: {
      sampleRate: {
        type: Number,
        default: 1.0,
        min: 0,
        max: 1
      },
      maskIpAddress: {
        type: Boolean,
        default: true
      },
      respectDoNotTrack: {
        type: Boolean,
        default: true
      },
      trackClicks: {
        type: Boolean,
        default: true
      },
      trackScrollDepth: {
        type: Boolean,
        default: true
      },
      trackTimeOnPage: {
        type: Boolean,
        default: true
      },
      excludePaths: {
        type: [String],
        default: []
      }
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Create the model if it doesn't exist already
export const Site = mongoose.models.Site || mongoose.model('Site', SiteSchema);