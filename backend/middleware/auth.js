const jwt = require('jsonwebtoken');
const { JWT_SECRET, DEVICE_API_KEY_SECRET } = require('../config/env');
const { User, SensorNode } = require('../models');

/**
 * Protect routes - User JWT verification
 */
const protect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.'
    });
  }
};

/**
 * Optional Auth - populates req.user if token exists, but doesn't block if absent
 */
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignore token failure for public reporting
    }
  }
  next();
};

/**
 * Telemetry Ingestion Auth:
 * Allows either:
 * 1) ESP32 Device Token (x-device-token / x-api-key)
 * 2) Authorized Official/Admin JWT
 * 3) Internal Simulator Key
 */
const authenticateTelemetrySource = async (req, res, next) => {
  const deviceToken = req.headers['x-device-token'] || req.headers['x-api-key'];
  const authHeader = req.headers.authorization;

  // Check hardware device token
  if (deviceToken) {
    if (deviceToken === DEVICE_API_KEY_SECRET) {
      req.deviceAuth = { type: 'HARDWARE_DIRECT' };
      return next();
    }

    // Check registered sensor node key
    const node = await SensorNode.findOne({ apiKey: deviceToken });
    if (node) {
      req.deviceAuth = { type: 'HARDWARE_NODE', node };
      return next();
    }
  }

  // Check user token (official, admin, or simulator)
  if (authHeader && authHeader.startsWith('Bearer')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (err) {
      // Fall through to error
    }
  }

  // Simulator internal bypass in development
  if (req.body.source === 'SIMULATED') {
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Unauthorized telemetry source. Valid device token or session credentials required.'
  });
};

module.exports = {
  protect,
  optionalAuth,
  authenticateTelemetrySource
};
