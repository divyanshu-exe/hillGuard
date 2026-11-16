const express = require('express');
const router = express.Router();
const { getTravellerDashboard, getOfficialDashboard, getStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/traveller', getTravellerDashboard);
router.get('/official', protect, authorize('official', 'admin'), getOfficialDashboard);
router.get('/stats', getStats);

module.exports = router;
