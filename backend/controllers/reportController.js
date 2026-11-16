const { Report, Road, Alert } = require('../models');
const { saveBase64Image } = require('../middleware/upload');
const auditService = require('../services/auditService');
const alertService = require('../services/alertService');

// @desc    Submit citizen road blockage or landslide report
// @route   POST /api/reports
// @access  Public (optionalAuth - can be logged-in or anonymous)
const submitReport = async (req, res, next) => {
  try {
    const {
      roadId,
      roadName,
      incidentType,
      description,
      latitude,
      longitude,
      accuracy,
      reporterName,
      reporterPhone,
      capturedViaLiveCamera,
      imageBase64
    } = req.body;

    // Handle image from either file upload or base64 live camera capture
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/reports/${req.file.filename}`;
    } else if (imageBase64) {
      imageUrl = saveBase64Image(imageBase64);
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'A live camera photo of the incident is strictly required for verification.'
      });
    }

    // Match or find Road
    let road = null;
    if (roadId) {
      road = await Road.findById(roadId);
    }
    if (!road && roadName) {
      road = await Road.findOne({
        $or: [
          { name: new RegExp(roadName, 'i') },
          { roadCode: new RegExp(roadName, 'i') }
        ]
      });
    }

    if (!road) {
      // Fallback: pick the closest road by coordinates if possible, or create fallback reference
      road = await Road.findOne();
    }

    const reportCode = `REP-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const report = await Report.create({
      reportId: reportCode,
      user: req.user ? req.user._id : null,
      reporterName: reporterName || req.user?.name || 'Concerned Traveller',
      reporterPhone: reporterPhone || req.user?.phone || '',
      road: road._id,
      roadName: road.name,
      incidentType,
      description,
      imageUrl,
      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        accuracy: Number(accuracy) || 10,
        capturedViaGPS: true
      },
      capturedViaLiveCamera: capturedViaLiveCamera !== undefined ? Boolean(capturedViaLiveCamera) : true,
      status: 'NEW'
    });

    // Notify connected dashboards via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('new_citizen_report', {
        reportId: report.reportId,
        _id: report._id,
        roadName: report.roadName,
        incidentType: report.incidentType,
        description: report.description,
        location: report.location,
        imageUrl: report.imageUrl,
        createdAt: report.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: 'Citizen incident report submitted successfully. It has been queued for official verification.',
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reports
// @route   GET /api/reports
// @access  Public (Travellers see verified; Officials see all)
const getReports = async (req, res, next) => {
  try {
    const { status, incidentType, roadId, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status.toUpperCase();
    if (incidentType) filter.incidentType = incidentType;
    if (roadId) filter.road = roadId;

    const reports = await Report.find(filter)
      .populate('road', 'roadCode name district passability riskStatus')
      .populate('user', 'name email role')
      .populate('verificationDetails.verifiedBy', 'name role department')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Public
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('road')
      .populate('user', 'name email role phone')
      .populate('verificationDetails.verifiedBy', 'name role department')
      .populate('resolutionDetails.resolvedBy', 'name role department');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify or Reject Citizen Report
// @route   PATCH /api/reports/:id/verify
// @access  Protected (Official / Admin)
const verifyReport = async (req, res, next) => {
  try {
    const { status, officialRemarks, updateRoadStatus, roadPassability } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status; // 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'
    report.verificationDetails = {
      verifiedBy: req.user._id,
      verifiedByName: req.user.name,
      verifiedAt: new Date(),
      officialRemarks,
      actionTaken: updateRoadStatus ? `UPDATED_ROAD_TO_${roadPassability}` : 'VERIFIED_INCIDENT'
    };

    await report.save();

    // If verified and official requested updating road status
    const road = await Road.findById(report.road);
    const io = req.app.get('io');

    if (road && status === 'VERIFIED') {
      if (updateRoadStatus && roadPassability) {
        road.passability = roadPassability;
        if (roadPassability === 'BLOCKED') {
          road.isBlockageConfirmed = true;
          road.blockageDetails = {
            reason: `Verified ${report.incidentType}: ${report.description}`,
            clearingAgency: 'Border Roads Organisation (BRO) / PWD',
            confirmedBy: req.user._id,
            confirmedAt: new Date()
          };
          await alertService.createBlockageAlert(road, report, req.user, io);
        }
        road.officialRemarks = `Official verification of incident ${report.reportId}: ${officialRemarks}`;
        road.lastStatusUpdate = new Date();
        road.updatedBy = req.user._id;
        await road.save();
      }
    }

    // Log in AuditLog
    await auditService.log({
      user: req.user,
      action: status === 'VERIFIED' ? 'VERIFY_REPORT' : 'REJECT_REPORT',
      targetEntity: 'Report',
      targetId: report._id,
      details: {
        reportId: report.reportId,
        status,
        officialRemarks,
        updateRoadStatus,
        roadPassability
      },
      ipAddress: req.ip
    });

    if (io) {
      io.emit('report_status_updated', {
        reportId: report._id,
        status: report.status,
        verifiedByName: req.user.name,
        officialRemarks,
        roadId: road?._id,
        roadPassability: road?.passability
      });
    }

    res.json({
      success: true,
      message: `Report marked as ${status}`,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark Incident Report as Resolved (cleared)
// @route   PATCH /api/reports/:id/resolve
// @access  Protected (Official / Admin)
const resolveReport = async (req, res, next) => {
  try {
    const { clearanceNotes, reopenRoad } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = 'RESOLVED';
    report.resolutionDetails = {
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      clearanceNotes: clearanceNotes || 'Roadway debris cleared and traffic restored.'
    };

    await report.save();

    if (reopenRoad && report.road) {
      const road = await Road.findById(report.road);
      if (road) {
        road.passability = 'OPEN';
        road.isBlockageConfirmed = false;
        road.officialRemarks = `Incident ${report.reportId} resolved. ${clearanceNotes || 'Road clear.'}`;
        road.lastStatusUpdate = new Date();
        await road.save();
      }
    }

    await auditService.log({
      user: req.user,
      action: 'RESOLVE_REPORT',
      targetEntity: 'Report',
      targetId: report._id,
      details: { reportId: report.reportId, clearanceNotes, reopenRoad },
      ipAddress: req.ip
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('report_resolved', {
        reportId: report._id,
        status: 'RESOLVED',
        resolvedByName: req.user.name
      });
    }

    res.json({
      success: true,
      message: 'Report marked as resolved',
      data: report
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitReport,
  getReports,
  getReportById,
  verifyReport,
  resolveReport
};
