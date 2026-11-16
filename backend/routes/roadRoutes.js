const express = require('express');
const router = express.Router();
const { getRoads, getRoadById, getRoadStatus, updateRoadStatus } = require('../controllers/roadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');
const { roadStatusUpdateSchema } = require('../validators/schemas');

router.get('/', getRoads);
router.get('/:id', getRoadById);
router.get('/:id/status', getRoadStatus);
router.patch('/:id/status', protect, authorize('official', 'admin'), validate(roadStatusUpdateSchema), updateRoadStatus);

module.exports = router;
