const { SensorNode, Road, Telemetry } = require('../models');
const auditService = require('../services/auditService');

// @desc    Get all sensor nodes
// @route   GET /api/nodes
// @access  Public (Officials & Admins see full telemetry/keys)
const getNodes = async (req, res, next) => {
  try {
    const nodes = await SensorNode.find()
      .populate('road', 'roadCode name district riskStatus passability')
      .sort({ nodeId: 1 });

    // Mark nodes as OFFLINE dynamically if not seen within last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const enrichedNodes = nodes.map(node => {
      const isStale = new Date(node.lastSeen) < fifteenMinutesAgo;
      const doc = node.toObject();
      return {
        ...doc,
        isStale,
        calculatedStatus: isStale ? 'OFFLINE' : node.status
      };
    });

    res.json({
      success: true,
      count: enrichedNodes.length,
      data: enrichedNodes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register a new Sensor Node
// @route   POST /api/nodes
// @access  Protected (Admin only)
const createNode = async (req, res, next) => {
  try {
    const { nodeId, name, roadId, location, hardwareModel, sensorsEquipped, isSimulated } = req.body;

    const existing = await SensorNode.findOne({ nodeId: nodeId.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Node with ID ${nodeId} already exists.`
      });
    }

    const road = await Road.findById(roadId);
    if (!road) {
      return res.status(404).json({
        success: false,
        message: 'Selected road section does not exist.'
      });
    }

    const node = await SensorNode.create({
      nodeId: nodeId.toUpperCase(),
      name,
      road: road._id,
      location: location || road.startPoint,
      hardwareModel: hardwareModel || 'ESP32-WROOM-32D',
      sensorsEquipped: sensorsEquipped || [
        'Capacitive Soil Moisture v1.2',
        'MPU6050 Accelerometer/Gyro',
        'Optical Rain Gauge',
        'SIM800L GSM'
      ],
      isSimulated: isSimulated !== undefined ? isSimulated : true,
      apiKey: `hg_key_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    });

    road.sensorNodes.push(node._id);
    await road.save();

    await auditService.log({
      user: req.user,
      action: 'CREATE_NODE',
      targetEntity: 'SensorNode',
      targetId: node._id,
      details: { nodeId: node.nodeId, name: node.name, road: road.roadCode },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Sensor Node registered successfully',
      data: node
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get node by ID
// @route   GET /api/nodes/:id
// @access  Public
const getNodeById = async (req, res, next) => {
  try {
    const node = await SensorNode.findById(req.params.id).populate('road');
    if (!node) {
      return res.status(404).json({
        success: false,
        message: 'Sensor Node not found'
      });
    }

    const latestTelemetry = await Telemetry.findOne({ nodeId: node.nodeId }).sort({ timestamp: -1 });

    res.json({
      success: true,
      data: {
        node,
        latestTelemetry
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update sensor node calibration or configuration
// @route   PATCH /api/nodes/:id
// @access  Protected (Official / Admin)
const updateNode = async (req, res, next) => {
  try {
    const { name, status, calibration, isSimulated, batteryLevel } = req.body;
    const node = await SensorNode.findById(req.params.id);

    if (!node) {
      return res.status(404).json({
        success: false,
        message: 'Sensor Node not found'
      });
    }

    if (name) node.name = name;
    if (status) node.status = status;
    if (isSimulated !== undefined) node.isSimulated = isSimulated;
    if (batteryLevel !== undefined) node.batteryLevel = batteryLevel;
    if (calibration) {
      node.calibration = { ...node.calibration, ...calibration };
    }

    await node.save();

    await auditService.log({
      user: req.user,
      action: 'UPDATE_NODE',
      targetEntity: 'SensorNode',
      targetId: node._id,
      details: { nodeId: node.nodeId, status, calibration },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'Node configuration updated successfully',
      data: node
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Check node health and diagnostic telemetry
// @route   GET /api/nodes/:id/health
// @access  Public
const getNodeHealth = async (req, res, next) => {
  try {
    const node = await SensorNode.findById(req.params.id).populate('road', 'roadCode name');
    if (!node) {
      return res.status(404).json({
        success: false,
        message: 'Sensor Node not found'
      });
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const isOnline = new Date(node.lastSeen) >= fifteenMinutesAgo && node.status !== 'OFFLINE';

    const recentReadings = await Telemetry.find({ nodeId: node.nodeId })
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        nodeId: node.nodeId,
        name: node.name,
        roadCode: node.road?.roadCode,
        isOnline,
        status: isOnline ? node.status : 'OFFLINE',
        batteryLevel: node.batteryLevel,
        signalStrength: node.signalStrength,
        lastSeen: node.lastSeen,
        isSimulated: node.isSimulated,
        calibration: node.calibration,
        recentReadingsCount: recentReadings.length,
        latestReading: recentReadings[0] || null
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNodes,
  createNode,
  getNodeById,
  updateNode,
  getNodeHealth
};
