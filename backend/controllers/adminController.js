const { User, AuditLog, Road, SensorNode } = require('../models');
const riskEngine = require('../services/riskEngine');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Protected (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { department: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin provisions an Official or Administrator
// @route   POST /api/admin/users
// @access  Protected (Admin only)
const provisionUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department, badgeNumber, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'official',
      department: department || 'Arunachal Pradesh Disaster Management Authority (APDMA)',
      badgeNumber: badgeNumber || '',
      phone: phone || ''
    });

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'PROVISION_USER',
      targetEntity: 'User',
      targetId: String(user._id),
      details: { email: user.email, role: user.role, department: user.department },
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: `User '${user.name}' provisioned as '${user.role}' successfully.`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        badgeNumber: user.badgeNumber
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user status / role
// @route   PATCH /api/admin/users/:id
// @access  Protected (Admin only)
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive, department, badgeNumber } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (department) user.department = department;
    if (badgeNumber !== undefined) user.badgeNumber = badgeNumber;

    await user.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'UPDATE_USER_SETTINGS',
      targetEntity: 'User',
      targetId: String(user._id),
      details: { role, isActive, department },
      ipAddress: req.ip
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        department: user.department
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Protected (Admin only)
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (action) filter.action = action;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: logs.length,
      total,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get & update risk engine thresholds
// @route   GET /api/admin/settings
// @access  Protected (Admin only)
const getSettings = (req, res) => {
  res.json({
    success: true,
    data: {
      formula: 'R = (0.35 * S) + (0.30 * T) + (0.25 * W) + (0.10 * V)',
      weights: riskEngine.weights,
      thresholds: riskEngine.thresholds,
      systemInfo: {
        institution: 'National Institute of Technology Arunachal Pradesh',
        department: 'Computer Science and Engineering',
        projectGuide: 'Dr. Koj Sambyo',
        projectTeam: [
          'Divyanshu Gupta',
          'Riya Yadav',
          'Jainesh Birla',
          'Nabam Rana',
          'Ngilyang Nancy'
        ],
        phase: 'PHASE 1 (Software Complete & Phase 2 IoT Ready)'
      }
    }
  });
};

const updateSettings = async (req, res) => {
  const { weights, thresholds } = req.body;
  if (weights) {
    riskEngine.weights = { ...riskEngine.weights, ...weights };
  }
  if (thresholds) {
    riskEngine.thresholds = { ...riskEngine.thresholds, ...thresholds };
  }

  await AuditLog.create({
    user: req.user._id,
    userName: req.user.name,
    userRole: req.user.role,
    action: 'UPDATE_RISK_THRESHOLDS',
    targetEntity: 'SystemConfig',
    targetId: 'RISK_ENGINE',
    details: { weights, thresholds },
    ipAddress: req.ip
  });

  res.json({
    success: true,
    message: 'Risk engine configuration updated successfully',
    data: {
      weights: riskEngine.weights,
      thresholds: riskEngine.thresholds
    }
  });
};

module.exports = {
  getUsers,
  provisionUser,
  updateUser,
  getAuditLogs,
  getSettings,
  updateSettings
};
