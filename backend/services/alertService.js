const { Alert, Notification, Road, SensorNode } = require('../models');

class AlertService {
  /**
   * Process potential alert from telemetry or official action
   */
  async processRiskAlert(telemetry, io = null) {
    const { nodeId, computedRisk, roadRef, sensors } = telemetry;

    // Only generate alerts for YELLOW (WARNING) or RED (CRITICAL)
    if (computedRisk.classification === 'GREEN') {
      return null;
    }

    const road = await Road.findById(roadRef);
    if (!road) return null;

    const severity = computedRisk.classification === 'RED' ? 'CRITICAL' : 'MEDIUM';
    const category = computedRisk.classification === 'RED' ? 'CRITICAL' : 'WARNING';
    const title = computedRisk.classification === 'RED'
      ? `CRITICAL LANDSLIDE RISK: ${road.roadCode}`
      : `High Landslide Warning: ${road.roadCode}`;

    const message = computedRisk.reason || `Elevated landslide risk detected on ${road.name}. Soil moisture: ${sensors.soilMoisture}%, Tilt: ${sensors.tiltAngle}°.`;

    // Deduplication / Cooldown check: Check if an ACTIVE alert exists for this road within last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingAlert = await Alert.findOne({
      road: road._id,
      status: 'ACTIVE',
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (existingAlert) {
      // If existing is WARNING but now CRITICAL, upgrade it
      if (existingAlert.severity !== 'CRITICAL' && severity === 'CRITICAL') {
        existingAlert.severity = 'CRITICAL';
        existingAlert.category = 'CRITICAL';
        existingAlert.title = title;
        existingAlert.message = message;
        existingAlert.cause = computedRisk.triggers.join(', ') || 'Escalated environmental risk factors';
        await existingAlert.save();

        if (io) {
          io.emit('alert_escalated', existingAlert);
        }
        return existingAlert;
      }
      // Otherwise skip creating duplicate
      return null;
    }

    const alertCode = `ALT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const alert = await Alert.create({
      alertCode,
      title,
      category,
      severity,
      road: road._id,
      roadName: road.name,
      nodeId,
      message,
      cause: computedRisk.triggers.length > 0 ? computedRisk.triggers.join('; ') : 'Sensor thresholds breached',
      status: 'ACTIVE',
      isVerified: true,
      location: telemetry.location
    });

    // Create persistent system Notification
    await Notification.create({
      roleTargets: ['traveller', 'official', 'admin'],
      title,
      message,
      type: 'ALERT',
      severity: category,
      metadata: {
        roadId: road._id,
        roadName: road.name,
        alertId: alert._id
      },
      link: '/alerts'
    });

    if (io) {
      io.emit('new_alert', alert);
      io.emit('notification', {
        title,
        message,
        severity: category,
        link: '/alerts',
        timestamp: new Date()
      });
    }

    return alert;
  }

  /**
   * Create Road Blockage Alert from verified report or official command
   */
  async createBlockageAlert(road, report, officialUser, io = null) {
    const alertCode = `BLK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    const title = `ROAD BLOCKED: ${road.roadCode} - ${road.name}`;
    const message = `Confirmed road blockage reported at ${road.district}. Clearance teams dispatched. Travellers advised to halt or seek detour.`;

    const alert = await Alert.create({
      alertCode,
      title,
      category: 'ROAD_BLOCKED',
      severity: 'CRITICAL',
      road: road._id,
      roadName: road.name,
      message,
      cause: report ? `Verified Citizen Incident Report (${report.incidentType})` : 'Official Highway Authority Directive',
      status: 'ACTIVE',
      isVerified: true,
      resolvedBy: null
    });

    await Notification.create({
      roleTargets: ['traveller', 'official', 'admin'],
      title,
      message,
      type: 'ROAD_STATUS',
      severity: 'ROAD_BLOCKED',
      metadata: {
        roadId: road._id,
        roadName: road.name,
        reportId: report?._id,
        alertId: alert._id
      },
      link: '/live-monitoring'
    });

    if (io) {
      io.emit('road_blocked_alert', alert);
      io.emit('notification', {
        title,
        message,
        severity: 'ROAD_BLOCKED',
        link: '/live-monitoring',
        timestamp: new Date()
      });
    }

    return alert;
  }
}

module.exports = new AlertService();
