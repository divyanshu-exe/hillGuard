const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // Can be registered or anonymous citizen
    },
    reporterName: {
      type: String,
      required: true,
      trim: true
    },
    reporterPhone: {
      type: String,
      trim: true,
      default: ''
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
    incidentType: {
      type: String,
      enum: ['Landslide', 'Road Blockage', 'Fallen Trees', 'Rockfall', 'Flooding', 'Other'],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      required: true // Live camera snapshot
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: { type: Number, default: 0 },
      capturedViaGPS: { type: Boolean, default: true }
    },
    capturedViaLiveCamera: {
      type: Boolean,
      default: true // master prompt emphasizes live camera verification
    },
    status: {
      type: String,
      enum: ['NEW', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'RESOLVED'],
      default: 'NEW',
      index: true
    },
    verificationDetails: {
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      verifiedByName: { type: String, default: '' },
      verifiedAt: { type: Date, default: null },
      officialRemarks: { type: String, default: '' },
      actionTaken: { type: String, default: '' } // e.g., 'ROAD_CLOSED', 'ROAD_RESTRICTED', 'ALERT_ISSUED', 'FALSE_ALARM'
    },
    resolutionDetails: {
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolvedAt: { type: Date, default: null },
      clearanceNotes: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ road: 1, status: 1 });

module.exports = mongoose.model('Report', reportSchema);
