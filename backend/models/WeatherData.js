const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema(
  {
    locationKey: {
      type: String,
      required: true,
      index: true // e.g., 'ITANAGAR', 'TAWANG', 'PASIGHAT', 'ZIRO', 'BHALUKPONG'
    },
    locationName: {
      type: String,
      required: true
    },
    district: {
      type: String,
      default: 'Papum Pare'
    },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    temperature: {
      type: Number,
      required: true // Celsius
    },
    feelsLike: {
      type: Number
    },
    humidity: {
      type: Number, // Percentage 0-100%
      required: true
    },
    pressure: {
      type: Number // hPa
    },
    rainfallMm: {
      type: Number, // mm in last 1hr / 3hr
      default: 0
    },
    windSpeed: {
      type: Number, // m/s
      default: 0
    },
    condition: {
      type: String,
      default: 'Scattered Clouds'
    },
    description: {
      type: String,
      default: 'Moderate hill precipitation'
    },
    icon: {
      type: String,
      default: '10d'
    },
    source: {
      type: String,
      enum: ['OPENWEATHERMAP', 'MOCK_HILL_WEATHER'],
      default: 'OPENWEATHERMAP'
    },
    fetchedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

weatherDataSchema.index({ locationKey: 1, fetchedAt: -1 });

module.exports = mongoose.model('WeatherData', weatherDataSchema);
