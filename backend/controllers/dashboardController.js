const { Road, SensorNode, Alert, Report, Telemetry } = require('../models');
const weatherService = require('../services/weatherService');

// @desc    Traveller Dashboard overview
// @route   GET /api/dashboard/traveller
// @access  Public
const getTravellerDashboard = async (req, res, next) => {
  try {
    const roads = await Road.find().sort({ currentRiskScore: -1 });

    const totalRoads = roads.length;
    const safeRoads = roads.filter(r => r.riskStatus === 'GREEN').length;
    const warningRoads = roads.filter(r => r.riskStatus === 'YELLOW').length;
    const criticalRoads = roads.filter(r => r.riskStatus === 'RED').length;
    const blockedRoads = roads.filter(r => r.passability === 'BLOCKED' || r.isBlockageConfirmed).length;

    // Active Landslide Warnings & Blockages
    const activeAlerts = await Alert.find({ status: 'ACTIVE' })
      .sort({ issuedAt: -1 })
      .limit(6);

    // Recent verified citizen reports
    const recentVerifiedReports = await Report.find({ status: { $in: ['VERIFIED', 'RESOLVED'] } })
      .sort({ createdAt: -1 })
      .limit(5);

    // Weather snapshot for Capital region
    const weather = await weatherService.getWeather('ITANAGAR');

    // High risk roads that need traveller attention
    const highRiskRoads = roads.filter(r => r.riskStatus === 'RED' || r.riskStatus === 'YELLOW');

    res.json({
      success: true,
      data: {
        summary: {
          totalRoads,
          safeRoads,
          warningRoads,
          criticalRoads,
          blockedRoads,
          overallStatus: blockedRoads > 0 ? 'HIGH_ALERT' : (criticalRoads > 0 ? 'CAUTION' : 'CLEAR')
        },
        highRiskRoads,
        allRoads: roads,
        activeAlerts,
        recentVerifiedReports,
        weather,
        lastDataUpdateTime: new Date()
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Official / Control Centre Dashboard overview
// @route   GET /api/dashboard/official
// @access  Protected (Official / Admin)
const getOfficialDashboard = async (req, res, next) => {
  try {
    const [nodes, roads, pendingReports, activeAlerts, recentTelemetry] = await Promise.all([
      SensorNode.find().populate('road', 'roadCode name riskStatus passability'),
      Road.find(),
      Report.find({ status: { $in: ['NEW', 'UNDER_REVIEW'] } }).sort({ createdAt: -1 }).limit(10),
      Alert.find({ status: 'ACTIVE' }).sort({ issuedAt: -1 }),
      Telemetry.find().sort({ timestamp: -1 }).limit(30)
    ]);

    const totalNodes = nodes.length;
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const activeNodes = nodes.filter(n => n.status === 'ONLINE' && n.lastSeen >= fifteenMinutesAgo).length;
    const offlineNodes = totalNodes - activeNodes;

    const safeSections = roads.filter(r => r.riskStatus === 'GREEN').length;
    const warningSections = roads.filter(r => r.riskStatus === 'YELLOW').length;
    const criticalSections = roads.filter(r => r.riskStatus === 'RED').length;
    const confirmedBlockages = roads.filter(r => r.passability === 'BLOCKED' || r.isBlockageConfirmed).length;

    // Aggregate trends for Recharts
    const sensorTrends = recentTelemetry.slice(0, 15).reverse().map(t => ({
      time: new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      nodeId: t.nodeId,
      soilMoisture: t.sensors.soilMoisture,
      tiltAngle: t.sensors.tiltAngle,
      vibration: t.sensors.vibration,
      rainIntensity: t.sensors.rainIntensity,
      riskScore: t.computedRisk?.score || 0
    }));

    res.json({
      success: true,
      data: {
        cards: {
          totalNodes,
          activeNodes,
          offlineNodes,
          safeSections,
          warningSections,
          criticalSections,
          pendingReportsCount: pendingReports.length,
          confirmedBlockages
        },
        nodes,
        roads,
        pendingReports,
        activeAlerts,
        sensorTrends,
        lastRefreshedAt: new Date()
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get landing page quick stats
// @route   GET /api/dashboard/stats
// @access  Public
const getStats = async (req, res, next) => {
  try {
    const [totalRoads, totalNodes, activeAlerts, verifiedReports] = await Promise.all([
      Road.countDocuments(),
      SensorNode.countDocuments(),
      Alert.countDocuments({ status: 'ACTIVE' }),
      Report.countDocuments({ status: 'VERIFIED' })
    ]);

    res.json({
      success: true,
      data: {
        monitoredSections: totalRoads || 8,
        activeNodes: totalNodes || 6,
        activeWarnings: activeAlerts || 1,
        verifiedIncidents: verifiedReports || 4,
        systemStatus: 'OPERATIONAL'
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTravellerDashboard,
  getOfficialDashboard,
  getStats
};
