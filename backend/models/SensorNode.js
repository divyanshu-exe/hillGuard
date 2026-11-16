const mongoose = require('mongoose');

const sensorNodeSchema = new mongoose.Schema(
  {
    nodeId: {
      type: String,
      required: [true, 'Node ID is required (e.g. HG_NODE_01)'],
      unique: true,
      trim: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    road: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Road',
      required: true
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      elevation: { type: Number, default: 0 },
      landmark: { type: String, default: '' },
      district: { type: String, default: 'Papum Pare' }
    },
    hardwareModel: {
      type: String,
      default: 'ESP32-WROOM-32D'
    },
    sensorsEquipped: {
      type: [String],
      default: [
        'Capacitive Soil Moisture v1.2',
        'MPU6050 Accelerometer/Gyro',
        'Optical Rain Gauge',
        'SIM800L GSM'
      ]
    },
    status: {
      type: String,
      enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'FAULTY'],
      default: 'ONLINE'
    },
    batteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 95
    },
    signalStrength: {
      type: Number, // Percentage 0-100% or dBm
      default: 85
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    calibration: {
      soilMoistureBaseline: { type: Number, default: 0 },
      tiltOffsetAngle: { type: Number, default: 0 },
      vibrationNoiseFloor: { type: Number, default: 0.05 }
    },
    isSimulated: {
      type: Boolean,
      default: true // In Phase 1 simulated, in Phase 2 hardware can connect
    },
    apiKey: {
      type: String,
      default: 'hg_esp32_device_secret_auth_2026'
    }
  },
  {
    timestamps: true
  }
);

sensorNodeSchema.index({ road: 1 });

module.exports = mongoose.model('SensorNode', sensorNodeSchema);
