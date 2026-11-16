const express = require('express');
const router = express.Router();
const {
  getUsers,
  provisionUser,
  updateUser,
  getAuditLogs,
  getSettings,
  updateSettings
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.post('/users', provisionUser);
router.patch('/users/:id', updateUser);
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
