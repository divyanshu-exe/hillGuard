const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null indicates broadcast to matching roles
    },
    roleTargets: {
      type: [String],
      enum: ['traveller', 'official', 'admin'],
      default: ['traveller', 'official', 'admin']
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['ALERT', 'REPORT_STATUS', 'ROAD_STATUS', 'SYSTEM_INFO'],
      default: 'ALERT'
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL', 'ROAD_BLOCKED'],
      default: 'INFO'
    },
    metadata: {
      roadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Road' },
      roadName: String,
      reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
      alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert' }
    },
    link: {
      type: String,
      default: '/alerts'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
