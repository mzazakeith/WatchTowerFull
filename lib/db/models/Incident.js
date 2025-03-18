import mongoose from 'mongoose';

const IncidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an incident title'],
      maxlength: [100, 'Title cannot be more than 100 characters'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
      trim: true,
    },
    services: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    }],
    status: {
      type: String,
      enum: ['investigating', 'identified', 'monitoring', 'resolved'],
      default: 'investigating',
    },
    severity: {
      type: String,
      enum: ['minor', 'major', 'critical'],
      default: 'minor',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
    },
    updates: [{
      message: String,
      status: {
        type: String,
        enum: ['investigating', 'identified', 'monitoring', 'resolved'],
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    rootCause: {
      type: String,
      maxlength: [500, 'Root cause cannot be more than 500 characters'],
    },
    resolution: {
      type: String,
      maxlength: [500, 'Resolution cannot be more than 500 characters'],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    impactedAreas: [String],
  },
  {
    timestamps: true,
  }
);

// Create indexes for faster queries
IncidentSchema.index({ status: 1 });
IncidentSchema.index({ startedAt: -1 });
IncidentSchema.index({ services: 1 });

export default mongoose.models.Incident || mongoose.model('Incident', IncidentSchema); 