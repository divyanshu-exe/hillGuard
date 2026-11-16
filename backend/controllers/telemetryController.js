const { Telemetry, SensorNode, Road } = require('../models');
const riskEngine = require('../services/riskEngine');
const alertService = require('../services/alertService');

// @desc    Ingest telemetry data (ESP32 hardware or Simulator)
// @route   POST /api/telemetry
// @access  Protected (Device Token or Authenticated Session)
const ingestTelemetry = async (req, res, next) => {
  try {
    const { nodeId, source, sensors, battery, location, timestamp } = req.body;

    const normalizedNodeId = (nodeId || 'HG_NODE_01').toUpperCase();
    const node = await SensorNode.findOne({ nodeId: normalizedNodeId }).populate('road');

    if (!node) {
      return res.status(404).json({
        success: false,
        message: `Sensor Node '${normalizedNodeId}' is not registered in the system.`
      });
    }

    // Update node health & last seen
    node.lastSeen = new Date();
    node.status = 'ONLINE';
    if (battery && battery.percentage !== undefined) {
      node.batteryLevel = battery.percentage;
    }
    await node.save();

    // Query previous reading for delta calculations (e.g. sudden slope shift)
    const previous = await Telemetry.findOne({ nodeId: normalizedNodeId }).sort({ timestamp: -1 });

    // Compute risk through Intelligent Risk Engine
    const computedRisk = riskEngine.calculateRisk(sensors, previous?.sensors);

    // Save telemetry record with explicit source identifier
    const telemetry = await Telemetry.create({
      nodeId: normalizedNodeId,
      nodeRef: node._id,
      roadRef: node.road._id,
      source: source || (node.isSimulated ? 'SIMULATED' : 'HARDWARE'),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      sensors,
      battery: battery || { percentage: node.batteryLevel, voltage: 4.1 },
      location: location || node.location,
      computedRisk
    });

    // Update associated Road Landslide Risk status
    const road = await Road.findById(node.road._id);
    if (road) {
      road.riskStatus = computedRisk.classification;
      road.currentRiskScore = computedRisk.score;
      road.riskReason = computedRisk.reason;
      road.lastStatusUpdate = new Date();
      await road.save();
    }

    // Trigger alert evaluation
    const io = req.app.get('io');
    const alert = await alertService.processRiskAlert(telemetry, io);

    // Emit live telemetry to all connected dashboards
    if (io) {
      io.emit('telemetry_update', {
        telemetry,
        road: {
          _id: road?._id,
          roadCode: road?.roadCode,
          name: road?.name,
          riskStatus: road?.riskStatus,
          currentRiskScore: road?.currentRiskScore,
          passability: road?.passability
        },
        node: {
          nodeId: node.nodeId,
          name: node.name,
          batteryLevel: node.batteryLevel,
          status: node.status
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Telemetry processed and risk calculated successfully',
      data: {
        telemetryId: telemetry._id,
        nodeId: telemetry.nodeId,
        source: telemetry.source,
        computedRisk,
        alertGenerated: Boolean(alert)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get latest telemetry for a node
// @route   GET /api/telemetry/:nodeId
// @access  Public
const getLatestByNode = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const telemetry = await Telemetry.findOne({ nodeId: nodeId.toUpperCase() })
      .sort({ timestamp: -1 })
      .populate('nodeRef', 'name location status batteryLevel hardwareModel')
      .populate('roadRef', 'roadCode name district riskStatus passability');

    if (!telemetry) {
      return res.status(404).json({
        success: false,
        message: `No telemetry records found for node ${nodeId}`
      });
    }

    res.json({
      success: true,
      data: telemetry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get historical telemetry for charts & analytics
// @route   GET /api/telemetry/:nodeId/history
// @access  Public
const getTelemetryHistory = async (req, res, next) => {
  try {
    const { nodeId } = req.params;
    const limit = Math.min(200, parseInt(req.query.limit, 10) || 40);

    const records = await Telemetry.find({ nodeId: nodeId.toUpperCase() })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();

    // Reverse to chronological order for charts
    const chronological = records.reverse();

    res.json({
      success: true,
      count: chronological.length,
      data: chronological
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  ingestTelemetry,
  getLatestByNode,
  getTelemetryHistory
};
