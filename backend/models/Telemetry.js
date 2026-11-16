const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true
    },
    nodeRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SensorNode'
    },
    roadRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Road'
    },
    source: {
      type: String,
      enum: ['SIMULATED', 'HARDWARE'],
      required: true,
      default: 'SIMULATED',
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    sensors: {
      soilMoisture: {
        type: Number, // Percentage 0-100%
        required: true,
        min: 0,
        max: 100
      },
      tiltAngle: {
        type: Number, // Degrees 0-60° deviation from vertical
        required: true,
        min: 0,
        max: 90
      },
      vibration: {
        type: Number, // Intensity in G (e.g., 0.05 to 5.0)
        required: true,
        min: 0,
        max: 20
      },
      rainIntensity: {
        type: Number, // mm per hour (0 to 200 mm/h)
        required: true,
        min: 0,
        max: 300
      }
    },
    battery: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 100
      },
      voltage: {
        type: Number,
        default: 4.1
      }
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    computedRisk: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      classification: {
        type: String,
        enum: ['GREEN', 'YELLOW', 'RED'],
        default: 'GREEN'
      },
      breakdown: {
        soilRisk: { type: Number, default: 0 },
        tiltRisk: { type: Number, default: 0 },
        rainRisk: { type: Number, default: 0 },
        vibrationRisk: { type: Number, default: 0 }
      },
      triggers: [String],
      calculatedAt: { type: Date, default: Date.now }
    },
    isStale: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index for querying recent node telemetry quickly
telemetrySchema.index({ nodeId: 1, timestamp: -1 });
telemetrySchema.index({ source: 1, timestamp: -1 });

module.exports = mongoose.model('Telemetry', telemetrySchema);
