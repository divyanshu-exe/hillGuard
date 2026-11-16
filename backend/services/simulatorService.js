const { SensorNode, Road, Telemetry } = require('../models');
const riskEngine = require('./riskEngine');
const alertService = require('./alertService');

class SimulatorService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.intervalSeconds = 5;
    this.io = null;

    // Current simulator state for default simulated node
    this.activeNodeId = 'HG_NODE_01';
    this.state = {
      nodeId: 'HG_NODE_01',
      source: 'SIMULATED',
      status: 'ONLINE',
      sensors: {
        soilMoisture: 24.5,
        tiltAngle: 1.8,
        vibration: 0.08,
        rainIntensity: 2.0
      },
      battery: {
        percentage: 96,
        voltage: 4.12
      },
      location: {
        latitude: 27.0844,
        longitude: 93.6053
      }
    };
  }

  setIO(io) {
    this.io = io;
  }

  getState() {
    return {
      isRunning: this.isRunning,
      intervalSeconds: this.intervalSeconds,
      activeNodeId: this.activeNodeId,
      currentValues: this.state
    };
  }

  updateManualSliders(partialSensors, battery = null, status = null) {
    if (partialSensors) {
      this.state.sensors = {
        ...this.state.sensors,
        ...partialSensors
      };
    }
    if (battery !== null) {
      this.state.battery.percentage = Number(battery);
    }
    if (status) {
      this.state.status = status;
    }
    return this.state;
  }

  applyScenario(scenarioName) {
    switch (scenarioName.toUpperCase()) {
      case 'SAFE_RESET':
        this.state.sensors = {
          soilMoisture: 22.0,
          tiltAngle: 1.2,
          vibration: 0.08,
          rainIntensity: 0.0
        };
        this.state.status = 'ONLINE';
        break;

      case 'HEAVY_RAIN':
        this.state.sensors = {
          soilMoisture: 68.0,
          tiltAngle: 3.5,
          vibration: 0.25,
          rainIntensity: 85.0
        };
        this.state.status = 'ONLINE';
        break;

      case 'SOIL_SATURATION':
        this.state.sensors = {
          soilMoisture: 92.0,
          tiltAngle: 5.2,
          vibration: 0.35,
          rainIntensity: 35.0
        };
        this.state.status = 'ONLINE';
        break;

      case 'SLOPE_MOVEMENT':
        this.state.sensors = {
          soilMoisture: 72.0,
          tiltAngle: 18.5,
          vibration: 2.4,
          rainIntensity: 28.0
        };
        this.state.status = 'ONLINE';
        break;

      case 'CRITICAL_SCENARIO':
        this.state.sensors = {
          soilMoisture: 95.0,
          tiltAngle: 24.0,
          vibration: 3.8,
          rainIntensity: 90.0
        };
        this.state.status = 'ONLINE';
        break;

      case 'NETWORK_FAILURE':
        this.state.status = 'OFFLINE';
        break;

      default:
        break;
    }
    return this.state;
  }

  /**
   * Generates a realistic reading step with smooth natural brownian jitter
   */
  generateStepReading() {
    if (this.state.status === 'OFFLINE') {
      return null;
    }

    // Jitter sensors realistically
    const jitter = (val, maxDelta, minBound, maxBound) => {
      const delta = (Math.random() - 0.49) * maxDelta;
      return Math.round(Math.max(minBound, Math.min(maxBound, val + delta)) * 10) / 10;
    };

    this.state.sensors.soilMoisture = jitter(this.state.sensors.soilMoisture, 0.8, 5, 100);
    this.state.sensors.tiltAngle = jitter(this.state.sensors.tiltAngle, 0.3, 0, 60);
    this.state.sensors.vibration = Math.round(Math.max(0.02, Math.min(5.0, this.state.sensors.vibration + (Math.random() - 0.5) * 0.1)) * 100) / 100;
    this.state.sensors.rainIntensity = jitter(this.state.sensors.rainIntensity, 1.5, 0, 150);

    // Micro battery drain
    if (Math.random() < 0.05 && this.state.battery.percentage > 10) {
      this.state.battery.percentage -= 1;
    }

    return {
      nodeId: this.activeNodeId,
      source: 'SIMULATED',
      timestamp: new Date(),
      sensors: { ...this.state.sensors },
      battery: { ...this.state.battery },
      location: { ...this.state.location }
    };
  }

  /**
   * Process telemetry and broadcast
   */
  async processAndBroadcastTelemetry(payload, source = 'SIMULATED') {
    const { nodeId, sensors, battery, location } = payload;

    // Find node and associated road
    const node = await SensorNode.findOne({ nodeId: (nodeId || this.activeNodeId).toUpperCase() }).populate('road');
    if (!node) {
      console.warn(`[Simulator/Telemetry] Node ${nodeId} not registered in DB`);
      return null;
    }

    // Update node health & last seen
    node.lastSeen = new Date();
    node.status = payload.status || 'ONLINE';
    if (battery && battery.percentage !== undefined) {
      node.batteryLevel = battery.percentage;
    }
    await node.save();

    // Query previous telemetry to compute slope delta
    const previous = await Telemetry.findOne({ nodeId: node.nodeId }).sort({ timestamp: -1 });

    // Calculate risk using RiskEngine
    const computedRisk = riskEngine.calculateRisk(sensors, previous?.sensors);

    // Create telemetry record
    const telemetry = await Telemetry.create({
      nodeId: node.nodeId,
      nodeRef: node._id,
      roadRef: node.road._id,
      source: source || 'SIMULATED',
      timestamp: payload.timestamp || new Date(),
      sensors,
      battery: battery || { percentage: 95, voltage: 4.1 },
      location: location || node.location,
      computedRisk
    });

    // Update road risk status (Notice: does NOT automatically change road passability/blockage!)
    const road = await Road.findById(node.road._id);
    if (road) {
      road.riskStatus = computedRisk.classification;
      road.currentRiskScore = computedRisk.score;
      road.riskReason = computedRisk.reason;
      road.lastStatusUpdate = new Date();
      await road.save();
    }

    // Evaluate alerts
    await alertService.processRiskAlert(telemetry, this.io);

    // Emit live telemetry over Socket.IO
    if (this.io) {
      this.io.emit('telemetry_update', {
        telemetry,
        road: {
          _id: road?._id,
          roadCode: road?.roadCode,
          name: road?.name,
          riskStatus: road?.riskStatus,
          currentRiskScore: road?.currentRiskScore,
          passability: road?.passability
        },
        node: {
          nodeId: node.nodeId,
          name: node.name,
          batteryLevel: node.batteryLevel,
          status: node.status
        }
      });
    }

    return telemetry;
  }

  startSimulation(nodeId = 'HG_NODE_01') {
    if (this.isRunning) return { message: 'Simulation already running', isRunning: true };
    this.activeNodeId = nodeId;
    this.isRunning = true;

    this.intervalId = setInterval(async () => {
      try {
        const payload = this.generateStepReading();
        if (payload) {
          await this.processAndBroadcastTelemetry(payload, 'SIMULATED');
        }
      } catch (err) {
        console.error('[Simulator Interval Error]', err.message);
      }
    }, this.intervalSeconds * 1000);

    console.log(`[Simulator] Started 5s auto-telemetry cycle for ${this.activeNodeId}`);
    return { message: `Simulation started for node ${this.activeNodeId}`, isRunning: true };
  }

  stopSimulation() {
    if (!this.isRunning) return { message: 'Simulation is not running', isRunning: false };
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    console.log('[Simulator] Stopped auto-telemetry cycle');
    return { message: 'Simulation stopped', isRunning: false };
  }
}

module.exports = new SimulatorService();
