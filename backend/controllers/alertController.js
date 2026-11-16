const { Alert, Notification } = require('../models');
const auditService = require('../services/auditService');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
const getAlerts = async (req, res, next) => {
  try {
    const { status, category, severity, roadId, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status.toUpperCase();
    if (category) filter.category = category.toUpperCase();
    if (severity) filter.severity = severity.toUpperCase();
    if (roadId) filter.road = roadId;

    const alerts = await Alert.find(filter)
      .populate('road', 'roadCode name district passability riskStatus')
      .populate('resolvedBy', 'name role department')
      .sort({ issuedAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single alert
// @route   GET /api/alerts/:id
// @access  Public
const getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('road')
      .populate('node')
      .populate('resolvedBy', 'name role department');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert record not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resolve alert
// @route   PATCH /api/alerts/:id/resolve
// @access  Protected (Official / Admin)
const resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.user._id;
    await alert.save();

    await auditService.log({
      user: req.user,
      action: 'RESOLVE_ALERT',
      targetEntity: 'Alert',
      targetId: alert._id,
      details: { alertCode: alert.alertCode, title: alert.title },
      ipAddress: req.ip
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('alert_resolved', {
        alertId: alert._id,
        alertCode: alert.alertCode,
        resolvedBy: req.user.name,
        resolvedAt: alert.resolvedAt
      });
    }

    res.json({
      success: true,
      message: 'Alert marked as resolved',
      data: alert
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark alert/notification as read
// @route   PATCH /api/alerts/:id/read
// @access  Protected
const markAlertAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      notification.isRead = true;
      if (!notification.readBy.some(r => r.userId.toString() === req.user.id)) {
        notification.readBy.push({ userId: req.user.id, readAt: new Date() });
      }
      await notification.save();
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  resolveAlert,
  markAlertAsRead
};
