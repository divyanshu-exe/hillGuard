const mongoose = require('mongoose');

const roadSchema = new mongoose.Schema(
  {
    roadCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true // e.g., 'NH-415', 'NH-13-TAWANG', 'NH-13-BHALUKPONG'
    },
    name: {
      type: String,
      required: true,
      trim: true // e.g., 'Itanagar - Naharlagun Highway (NH-415)'
    },
    district: {
      type: String,
      required: true,
      trim: true // e.g., 'Papum Pare', 'Tawang', 'West Kameng', 'Lower Subansiri'
    },
    state: {
      type: String,
      default: 'Arunachal Pradesh'
    },
    totalDistanceKm: {
      type: Number,
      required: true
    },
    startPoint: {
      name: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    endPoint: {
      name: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    // Detailed geo-polyline for map route drawing
    coordinates: [
      {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        elevation: { type: Number, default: 0 }
      }
    ],
    // Landslide Risk level (Automated by Sensor & Risk Engine)
    riskStatus: {
      type: String,
      enum: ['GREEN', 'YELLOW', 'RED'],
      default: 'GREEN'
    },
    currentRiskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 15
    },
    riskReason: {
      type: String,
      default: 'Environmental parameters within stable thresholds'
    },
    // Physical Road Passability (Official/Verified physical status)
    passability: {
      type: String,
      enum: ['OPEN', 'ONE_WAY_CAUTION', 'RESTRICTED_CONVOY', 'BLOCKED'],
      default: 'OPEN'
    },
    isBlockageConfirmed: {
      type: Boolean,
      default: false
    },
    blockageDetails: {
      reason: { type: String, default: '' },
      clearingAgency: { type: String, default: 'Border Roads Organisation (BRO) / PWD' },
      estimatedReopeningTime: { type: Date, default: null },
      confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      confirmedAt: { type: Date, default: null }
    },
    officialRemarks: {
      type: String,
      default: 'Normal traffic moving without hindrance.'
    },
    lastStatusUpdate: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sensorNodes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SensorNode'
      }
    ]
  },
  {
    timestamps: true
  }
);

roadSchema.index({ district: 1 });
roadSchema.index({ riskStatus: 1 });
roadSchema.index({ passability: 1 });

module.exports = mongoose.model('Road', roadSchema);
