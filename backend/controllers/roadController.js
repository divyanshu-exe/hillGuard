const { Road, SensorNode, Telemetry, Alert, Report } = require('../models');
const auditService = require('../services/auditService');
const alertService = require('../services/alertService');

// @desc    Get all monitored roads
// @route   GET /api/roads
// @access  Public
const getRoads = async (req, res, next) => {
  try {
    const { district, riskStatus, passability } = req.query;
    const filter = {};

    if (district) filter.district = new RegExp(district, 'i');
    if (riskStatus) filter.riskStatus = riskStatus.toUpperCase();
    if (passability) filter.passability = passability.toUpperCase();

    const roads = await Road.find(filter)
      .populate('sensorNodes', 'nodeId name status batteryLevel location isSimulated lastSeen')
      .sort({ currentRiskScore: -1 });

    res.json({
      success: true,
      count: roads.length,
      data: roads
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single road by ID with full details
// @route   GET /api/roads/:id
// @access  Public
const getRoadById = async (req, res, next) => {
  try {
    const road = await Road.findById(req.params.id)
      .populate('sensorNodes', 'nodeId name status batteryLevel location isSimulated lastSeen sensorsEquipped')
      .populate('updatedBy', 'name role department');

    if (!road) {
      return res.status(404).json({
        success: false,
        message: 'Monitored road section not found.'
      });
    }

    // Get active alerts for this road
    const activeAlerts = await Alert.find({ road: road._id, status: 'ACTIVE' })
      .sort({ issuedAt: -1 })
      .limit(5);

    // Get recent verified incident reports
    const verifiedReports = await Report.find({ road: road._id, status: { $in: ['VERIFIED', 'RESOLVED'] } })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get latest telemetry for each associated node
    const nodeIds = road.sensorNodes.map(n => n.nodeId);
    const latestTelemetries = await Promise.all(
      nodeIds.map(nid => Telemetry.findOne({ nodeId: nid }).sort({ timestamp: -1 }))
    );

    res.json({
      success: true,
      data: {
        road,
        activeAlerts,
        verifiedReports,
        telemetry: latestTelemetries.filter(Boolean)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get lightweight road status
// @route   GET /api/roads/:id/status
// @access  Public
const getRoadStatus = async (req, res, next) => {
  try {
    const road = await Road.findById(req.params.id)
      .select('roadCode name district riskStatus currentRiskScore passability isBlockageConfirmed blockageDetails officialRemarks lastStatusUpdate');

    if (!road) {
      return res.status(404).json({
        success: false,
        message: 'Road not found'
      });
    }

    res.json({
      success: true,
      data: road
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update official road status & passability
// @route   PATCH /api/roads/:id/status
// @access  Protected (Official / Admin)
const updateRoadStatus = async (req, res, next) => {
  try {
    const { passability, riskStatus, isBlockageConfirmed, officialRemarks, clearingAgency, estimatedReopeningTime } = req.body;
    const road = await Road.findById(req.params.id);

    if (!road) {
      return res.status(404).json({
        success: false,
        message: 'Road not found'
      });
    }

    const previousState = {
      passability: road.passability,
      riskStatus: road.riskStatus,
      isBlockageConfirmed: road.isBlockageConfirmed
    };

    if (passability) road.passability = passability;
    if (riskStatus) road.riskStatus = riskStatus;
    if (isBlockageConfirmed !== undefined) road.isBlockageConfirmed = isBlockageConfirmed;
    if (officialRemarks) road.officialRemarks = officialRemarks;

    if (road.passability === 'BLOCKED' || isBlockageConfirmed) {
      road.isBlockageConfirmed = true;
      road.blockageDetails = {
        reason: officialRemarks || 'Road closure mandated by district authorities.',
        clearingAgency: clearingAgency || 'Border Roads Organisation (BRO) / Project Vartak / PWD',
        estimatedReopeningTime: estimatedReopeningTime ? new Date(estimatedReopeningTime) : null,
        confirmedBy: req.user._id,
        confirmedAt: new Date()
      };
    } else if (passability === 'OPEN') {
      road.isBlockageConfirmed = false;
      road.blockageDetails.reason = '';
    }

    road.lastStatusUpdate = new Date();
    road.updatedBy = req.user._id;

    await road.save();

    // Log in AuditLog
    await auditService.log({
      user: req.user,
      action: 'UPDATE_ROAD_STATUS',
      targetEntity: 'Road',
      targetId: road._id,
      details: {
        previousState,
        newState: {
          passability: road.passability,
          riskStatus: road.riskStatus,
          isBlockageConfirmed: road.isBlockageConfirmed,
          officialRemarks
        }
      },
      ipAddress: req.ip
    });

    const io = req.app.get('io');

    // If marked blocked, create a block alert
    if (road.isBlockageConfirmed) {
      await alertService.createBlockageAlert(road, null, req.user, io);
    }

    // Broadcast status change
    if (io) {
      io.emit('road_status_changed', {
        roadId: road._id,
        roadCode: road.roadCode,
        name: road.name,
        passability: road.passability,
        riskStatus: road.riskStatus,
        isBlockageConfirmed: road.isBlockageConfirmed,
        officialRemarks: road.officialRemarks,
        updatedBy: req.user.name,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: `Road ${road.roadCode} condition updated successfully`,
      data: road
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRoads,
  getRoadById,
  getRoadStatus,
  updateRoadStatus
};
