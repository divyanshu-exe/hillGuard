const express = require('express');
const router = express.Router();
const { submitReport, getReports, getReportById, verifyReport, resolveReport } = require('../controllers/reportController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { upload } = require('../middleware/upload');
const { validate } = require('../middleware/validate');
const { reportCreateSchema, reportVerifySchema } = require('../validators/schemas');

// Submit report with optional multipart camera upload
router.post('/', optionalAuth, upload.single('image'), validate(reportCreateSchema), submitReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.patch('/:id/verify', protect, authorize('official', 'admin'), validate(reportVerifySchema), verifyReport);
router.patch('/:id/resolve', protect, authorize('official', 'admin'), resolveReport);

module.exports = router;
