import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a service name'],
      maxlength: [60, 'Name cannot be more than 60 characters'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot be more than 200 characters'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Please provide a service URL'],
      trim: true,
    },
    checkType: {
      type: String,
      required: [true, 'Please provide a check type'],
      enum: ['http', 'ping', 'port', 'tcp', 'dns', 'ssl', 'custom'],
      default: 'http',
    },
    interval: {
      type: Number,
      required: [true, 'Please provide a check interval'],
      default: 60, // 60 seconds
      min: [10, 'Interval cannot be less than 10 seconds'],
    },
    timeout: {
      type: Number,
      default: 30, // 30 seconds
      min: [1, 'Timeout cannot be less than 1 second'],
    },
    expectedStatusCode: {
      type: Number,
      default: 200,
    },
    expectedResponseContent: {
      type: String,
      default: '',
    },
    httpMethod: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'],
      default: 'GET',
    },
    requestHeaders: {
      type: Map,
      of: String,
      default: {},
    },
    requestBody: {
      type: String,
      default: '',
    },
    followRedirects: {
      type: Boolean,
      default: true,
    },
    verifySSL: {
      type: Boolean,
      default: true,
    },
    port: {
      type: Number,
      min: [1, 'Port cannot be less than 1'],
      max: [65535, 'Port cannot be more than 65535'],
    },
    status: {
      type: String,
      enum: ['healthy', 'degraded', 'warning', 'critical', 'down', 'pending'],
      default: 'pending',
    },
    paused: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    alertThresholds: {
      responseTime: {
        warning: { type: Number, default: 1000 }, // 1 second
        critical: { type: Number, default: 3000 }, // 3 seconds
      },
      availability: {
        warning: { type: Number, default: 95 }, // 95%
        critical: { type: Number, default: 90 }, // 90%
      },
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema); 