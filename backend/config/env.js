const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hillguard',
  JWT_SECRET: process.env.JWT_SECRET || 'hillguard_super_secret_jwt_key_2026_nit_arunachal',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY || '',
  SIMULATOR_SECRET: process.env.SIMULATOR_SECRET || 'hillguard_simulator_internal_key',
  DEVICE_API_KEY_SECRET: process.env.DEVICE_API_KEY_SECRET || 'hg_esp32_device_secret_auth_2026'
};
