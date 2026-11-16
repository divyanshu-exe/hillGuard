const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    alertCode: {
      type: String,
      required: true,
      unique: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL', 'ROAD_BLOCKED'],
      default: 'INFO',
      index: true
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW'
    },
    road: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Road',
      required: true
    },
    roadName: {
      type: String,
      required: true
    },
    node: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SensorNode'
    },
    nodeId: {
      type: String
    },
    message: {
      type: String,
      required: true
    },
    cause: {
      type: String,
      default: 'Automated telemetry threshold exceeded'
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'],
      default: 'ACTIVE',
      index: true
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    location: {
      latitude: Number,
      longitude: Number
    }
  },
  {
    timestamps: true
  }
);

alertSchema.index({ status: 1, issuedAt: -1 });
alertSchema.index({ road: 1, status: 1 });

module.exports = mongoose.model('Alert', alertSchema);
