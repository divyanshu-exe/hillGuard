const express = require('express');
const router = express.Router();
const { getAlerts, getAlertById, resolveAlert, markAlertAsRead } = require('../controllers/alertController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', getAlerts);
router.get('/:id', getAlertById);
router.patch('/:id/resolve', protect, authorize('official', 'admin'), resolveAlert);
router.patch('/:id/read', protect, markAlertAsRead);

module.exports = router;
