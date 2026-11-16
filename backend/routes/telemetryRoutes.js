const express = require('express');
const router = express.Router();
const { ingestTelemetry, getLatestByNode, getTelemetryHistory } = require('../controllers/telemetryController');
const { authenticateTelemetrySource } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { telemetrySchema } = require('../validators/schemas');

// Hardware & Simulator ingest endpoint
router.post('/', authenticateTelemetrySource, validate(telemetrySchema), ingestTelemetry);
router.get('/:nodeId', getLatestByNode);
router.get('/:nodeId/history', getTelemetryHistory);

module.exports = router;
