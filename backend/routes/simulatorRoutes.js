const express = require('express');
const router = express.Router();
const {
  getSimulatorState,
  startSimulation,
  stopSimulation,
  sendManualTelemetry,
  triggerScenario
} = require('../controllers/simulatorController');

router.get('/state', getSimulatorState);
router.post('/start', startSimulation);
router.post('/stop', stopSimulation);
router.post('/telemetry', sendManualTelemetry);
router.post('/scenario', triggerScenario);

module.exports = router;
