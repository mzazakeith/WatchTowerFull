import mongoose from 'mongoose';

const CheckSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['healthy', 'degraded', 'warning', 'critical', 'down'],
      required: true,
    },
    responseTime: {
      type: Number, // in milliseconds
      default: 0,
    },
    statusCode: {
      type: Number,
    },
    responseSize: {
      type: Number, // in bytes
    },
    error: {
      type: String,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // SSL certificate info (for SSL checks)
    ssl: {
      isValid: Boolean,
      validFrom: Date,
      validTo: Date,
      daysRemaining: Number,
      issuer: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
CheckSchema.index({ serviceId: 1, timestamp: -1 });

export default mongoose.models.Check || mongoose.model('Check', CheckSchema); 