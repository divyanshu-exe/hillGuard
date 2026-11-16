const express = require('express');
const router = express.Router();
const { getNodes, createNode, getNodeById, updateNode, getNodeHealth } = require('../controllers/nodeController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', getNodes);
router.post('/', protect, authorize('admin'), createNode);
router.get('/:id', getNodeById);
router.patch('/:id', protect, authorize('official', 'admin'), updateNode);
router.get('/:id/health', getNodeHealth);

module.exports = router;
