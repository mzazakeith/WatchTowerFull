import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    checkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Check',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'acknowledged', 'resolved', 'closed'],
      default: 'pending',
    },
    severity: {
      type: String,
      enum: ['warning', 'critical', 'down'],
      required: true,
    },
    metric: {
      type: String,
      enum: ['response_time', 'status_code', 'availability', 'ssl', 'custom'],
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    acknowledgedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationLog: [{
      channel: String,
      timestamp: Date,
      status: String,
      error: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
AlertSchema.index({ serviceId: 1, status: 1 });
AlertSchema.index({ timestamp: -1 });
AlertSchema.index({ incidentId: 1 });

export default mongoose.models.Alert || mongoose.model('Alert', AlertSchema); 