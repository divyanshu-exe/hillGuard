const simulatorService = require('../services/simulatorService');

// @desc    Get current simulator state
// @route   GET /api/simulator/state
// @access  Public
const getSimulatorState = (req, res) => {
  res.json({
    success: true,
    data: simulatorService.getState()
  });
};

// @desc    Start automated background simulation
// @route   POST /api/simulator/start
// @access  Public (in Phase 1 for easy testing)
const startSimulation = (req, res) => {
  const { nodeId } = req.body;
  const result = simulatorService.startSimulation(nodeId || 'HG_NODE_01');
  res.json({
    success: true,
    ...result
  });
};

// @desc    Stop automated background simulation
// @route   POST /api/simulator/stop
// @access  Public
const stopSimulation = (req, res) => {
  const result = simulatorService.stopSimulation();
  res.json({
    success: true,
    ...result
  });
};

// @desc    Send manual simulated reading through unified telemetry pipeline
// @route   POST /api/simulator/telemetry
// @access  Public
const sendManualTelemetry = async (req, res, next) => {
  try {
    const { nodeId, sensors, battery, location, status } = req.body;

    const updatedState = simulatorService.updateManualSliders(sensors, battery?.percentage, status);

    const payload = {
      nodeId: nodeId || simulatorService.activeNodeId,
      source: 'SIMULATED',
      timestamp: new Date(),
      sensors: updatedState.sensors,
      battery: updatedState.battery,
      location: location || updatedState.location,
      status: updatedState.status
    };

    const telemetry = await simulatorService.processAndBroadcastTelemetry(payload, 'SIMULATED');

    res.json({
      success: true,
      message: 'Simulated telemetry ingested into unified pipeline',
      data: telemetry
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Trigger predefined test scenario
// @route   POST /api/simulator/scenario
// @access  Public
const triggerScenario = async (req, res, next) => {
  try {
    const { scenario, nodeId } = req.body;

    if (!scenario) {
      return res.status(400).json({
        success: false,
        message: 'Scenario name is required (e.g. SAFE_RESET, HEAVY_RAIN, SOIL_SATURATION, SLOPE_MOVEMENT, CRITICAL_SCENARIO, NETWORK_FAILURE)'
      });
    }

    const state = simulatorService.applyScenario(scenario);

    // Immediately trigger a telemetry broadcast with the new scenario values
    const payload = {
      nodeId: nodeId || simulatorService.activeNodeId,
      source: 'SIMULATED',
      timestamp: new Date(),
      sensors: state.sensors,
      battery: state.battery,
      location: state.location,
      status: state.status
    };

    const telemetry = await simulatorService.processAndBroadcastTelemetry(payload, 'SIMULATED');

    res.json({
      success: true,
      message: `Scenario '${scenario}' applied successfully.`,
      data: {
        scenario,
        currentState: state,
        telemetry
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSimulatorState,
  startSimulation,
  stopSimulation,
  sendManualTelemetry,
  triggerScenario
};
