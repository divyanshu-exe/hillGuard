import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Play,
  Square,
  RotateCcw,
  CloudRain,
  Droplets,
  TrendingUp,
  Activity,
  Wifi,
  WifiOff,
  Battery,
  Send,
  Radio,
  Sliders,
  CheckCircle,
  AlertTriangle,
  Flame,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useSocketContext } from '../../context/SocketContext';
import { TelemetrySensors, Telemetry, SensorNode } from '../../types';

interface HardwareSimulatorControlsProps {
  nodes?: SensorNode[];
  onTelemetryEmitted?: (telemetry: Telemetry) => void;
}

export const HardwareSimulatorControls: React.FC<HardwareSimulatorControlsProps> = ({
  nodes = [],
  onTelemetryEmitted
}) => {
  const { socket } = useSocketContext();

  const [selectedNodeId, setSelectedNodeId] = useState<string>('HG_NODE_01');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isNodeOnline, setIsNodeOnline] = useState<boolean>(true);

  // Sliders state
  const [sensors, setSensors] = useState<TelemetrySensors>({
    soilMoisture: 24.5,
    tiltAngle: 1.8,
    vibration: 0.08,
    rainIntensity: 2.0
  });
  const [batteryLevel, setBatteryLevel] = useState<number>(94);

  // Recent simulated telemetry logs
  const [telemetryLogs, setTelemetryLogs] = useState<Telemetry[]>([]);
  const [latestComputedRisk, setLatestComputedRisk] = useState<any>(null);

  // Fetch initial simulator state
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await api.get('/simulator/state');
        if (res.data.success && res.data.data) {
          const s = res.data.data;
          setIsRunning(s.isRunning);
          if (s.currentValues) {
            setSelectedNodeId(s.activeNodeId || 'HG_NODE_01');
            setSensors(s.currentValues.sensors);
            setBatteryLevel(s.currentValues.battery.percentage);
            setIsNodeOnline(s.currentValues.status === 'ONLINE');
          }
        }
      } catch (err) {
        console.warn('[Simulator] Could not fetch simulator state');
      }
    };

    fetchState();
  }, []);

  // Listen to Socket.IO for telemetry events
  useEffect(() => {
    if (!socket) return;

    const handleTelemetryUpdate = (data: any) => {
      if (data && data.telemetry) {
        setTelemetryLogs((prev) => [data.telemetry, ...prev.slice(0, 14)]);
        if (data.telemetry.nodeId === selectedNodeId) {
          setLatestComputedRisk(data.telemetry.computedRisk);
          setSensors(data.telemetry.sensors);
          setBatteryLevel(data.telemetry.battery.percentage);
        }
        if (onTelemetryEmitted) {
          onTelemetryEmitted(data.telemetry);
        }
      }
    };

    socket.on('telemetry_update', handleTelemetryUpdate);

    return () => {
      socket.off('telemetry_update', handleTelemetryUpdate);
    };
  }, [socket, selectedNodeId, onTelemetryEmitted]);

  // Start auto-telemetry generator
  const handleStart = async () => {
    try {
      const res = await api.post('/simulator/start', { nodeId: selectedNodeId });
      if (res.data.success) {
        setIsRunning(true);
        toast.success(`Automated 5-second telemetry cycle started for ${selectedNodeId}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to start simulation');
    }
  };

  // Stop simulation
  const handleStop = async () => {
    try {
      const res = await api.post('/simulator/stop');
      if (res.data.success) {
        setIsRunning(false);
        toast.success('Simulation halted.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to stop simulation');
    }
  };

  // Send manual single reading with current slider values
  const handleSendManual = async () => {
    try {
      const res = await api.post('/simulator/telemetry', {
        nodeId: selectedNodeId,
        sensors,
        battery: { percentage: batteryLevel, voltage: 4.1 },
        status: isNodeOnline ? 'ONLINE' : 'OFFLINE'
      });
      if (res.data.success) {
        toast.success('Manual telemetry packet transmitted to Risk Engine!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send telemetry');
    }
  };

  // Trigger preset scenario
  const handleTriggerScenario = async (scenarioName: string, label: string) => {
    try {
      const res = await api.post('/simulator/scenario', {
        scenario: scenarioName,
        nodeId: selectedNodeId
      });
      if (res.data.success) {
        toast.success(`Scenario applied: ${label}`, { icon: '⚡' });
        const st = res.data.data.currentState;
        if (st) {
          setSensors(st.sensors);
          setIsNodeOnline(st.status === 'ONLINE');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Scenario failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Phase 1 Hardware Simulator Identification */}
      <div className="bg-[#123B2A] text-white p-5 rounded-2xl shadow-lg border border-[#1d523b] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-inner">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold tracking-tight">HillGuard Hardware Control Centre</h2>
              <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full uppercase">
                Phase 1 Simulator
              </span>
            </div>
            <p className="text-xs text-emerald-300">
              Simulates physical ESP32 microcontroller with Capacitive Soil Moisture, MPU6050, and Optical Rain Gauge.
            </p>
          </div>
        </div>

        {/* Node Selection & Power State */}
        <div className="flex flex-wrap items-center gap-3 bg-[#0d2a1e] p-2 rounded-xl border border-emerald-900/60">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400">Target Node</label>
            <select
              value={selectedNodeId}
              onChange={(e) => setSelectedNodeId(e.target.value)}
              className="bg-slate-900 text-white font-mono text-xs px-2.5 py-1 rounded border border-emerald-800 outline-none cursor-pointer"
            >
              <option value="HG_NODE_01">HG_NODE_01 (NH-415 Ganga Cut)</option>
              <option value="HG_NODE_02">HG_NODE_02 (NH-13 Tenga Valley)</option>
              <option value="HG_NODE_03">HG_NODE_03 (NH-13 Sela Pass)</option>
              <option value="HG_NODE_04">HG_NODE_04 (NH-513 Siang Gorge)</option>
              <option value="HG_NODE_05">HG_NODE_05 (SH-03 Ziro Valley)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400">Node Status</label>
            <button
              onClick={() => setIsNodeOnline(!isNodeOnline)}
              className={`text-xs px-2.5 py-1 rounded font-bold flex items-center gap-1.5 transition ${
                isNodeOnline ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
              }`}
            >
              {isNodeOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isNodeOnline ? 'ONLINE' : 'OFFLINE'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Left = Sliders & Controls, Right = Live Telemetry Packet & Risk Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Sensor Sliders & Preset Scenarios */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Controls Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                Analog & Digital Sensor Calibration Sliders
              </h3>
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <button
                    onClick={handleStop}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                  >
                    <Square className="w-3.5 h-3.5" /> Stop Auto Cycle
                  </button>
                ) : (
                  <button
                    onClick={handleStart}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
                  >
                    <Play className="w-3.5 h-3.5" /> Start Auto 5s Cycle
                  </button>
                )}
                <button
                  onClick={handleSendManual}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Push single reading immediately"
                >
                  <Send className="w-3.5 h-3.5" /> Push
                </button>
              </div>
            </div>

            {/* Sliders Container */}
            <div className="space-y-4">
              {/* 1. Soil Moisture */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    Capacitive Soil Moisture Sensor (v1.2)
                  </span>
                  <span className="font-mono font-bold text-slate-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {sensors.soilMoisture.toFixed(1)} %
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={sensors.soilMoisture}
                  onChange={(e) => setSensors({ ...sensors, soilMoisture: parseFloat(e.target.value) })}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Dry Shale (&lt;35%)</span>
                  <span>Moderate Saturation (35-65%)</span>
                  <span className="text-red-500 font-semibold">Liquefaction Risk (&gt;65%)</span>
                </div>
              </div>

              {/* 2. Slope Tilt Angle (MPU6050) */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    MPU6050 Accelerometer Slope Tilt Angle
                  </span>
                  <span className="font-mono font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {sensors.tiltAngle.toFixed(1)}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.2"
                  value={sensors.tiltAngle}
                  onChange={(e) => setSensors({ ...sensors, tiltAngle: parseFloat(e.target.value) })}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Normal (0-3°)</span>
                  <span>Slope Creep (3-8°)</span>
                  <span>Shear Shift (8-15°)</span>
                  <span className="text-red-500 font-semibold">Slope Failure (&gt;15°)</span>
                </div>
              </div>

              {/* 3. Vibration Intensity (MPU6050 Gyro) */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-purple-600" />
                    Ground Vibration & Tremor Intensity
                  </span>
                  <span className="font-mono font-bold text-slate-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {sensors.vibration.toFixed(2)} g
                  </span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="5.0"
                  step="0.05"
                  value={sensors.vibration}
                  onChange={(e) => setSensors({ ...sensors, vibration: parseFloat(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Ambient (&lt;0.2g)</span>
                  <span>Micro-movement (0.2-0.8g)</span>
                  <span>Rockfall Tremor (&gt;1.5g)</span>
                </div>
              </div>

              {/* 4. Rainfall Intensity */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-indigo-600" />
                    Optical / Tipping Bucket Rain Gauge
                  </span>
                  <span className="font-mono font-bold text-slate-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {sensors.rainIntensity.toFixed(1)} mm/h
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="1"
                  value={sensors.rainIntensity}
                  onChange={(e) => setSensors({ ...sensors, rainIntensity: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Light (0-5)</span>
                  <span>Moderate (5-25)</span>
                  <span>Heavy (25-50)</span>
                  <span className="text-red-500 font-semibold">Cloudburst (&gt;50 mm/h)</span>
                </div>
              </div>

              {/* 5. Battery Percentage */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Battery className="w-4 h-4 text-emerald-600" />
                    LiFePO4 Solar Battery Level
                  </span>
                  <span className="font-mono font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {batteryLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={batteryLevel}
                  onChange={(e) => setBatteryLevel(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Preset Trigger Scenarios */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Preset Emergency & Weather Scenarios
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => handleTriggerScenario('SAFE_RESET', 'Safe Mountain Baseline')}
                className="px-3 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition text-left"
              >
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                Safe Baseline
              </button>

              <button
                onClick={() => handleTriggerScenario('HEAVY_RAIN', 'Torrential Rain Event')}
                className="px-3 py-2 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition text-left"
              >
                <CloudRain className="w-4 h-4 text-blue-600 shrink-0" />
                Heavy Rainfall
              </button>

              <button
                onClick={() => handleTriggerScenario('SOIL_SATURATION', 'Pore Saturation Liquefaction')}
                className="px-3 py-2 bg-white hover:bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition text-left"
              >
                <Droplets className="w-4 h-4 text-cyan-600 shrink-0" />
                Soil Saturation
              </button>

              <button
                onClick={() => handleTriggerScenario('SLOPE_MOVEMENT', 'Sudden Slope Tilt Displacement')}
                className="px-3 py-2 bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition text-left"
              >
                <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
                Slope Movement
              </button>

              <button
                onClick={() => handleTriggerScenario('CRITICAL_SCENARIO', 'Critical Multi-Factor Landslide')}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition text-left"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Critical Catastrophe
              </button>

              <button
                onClick={() => handleTriggerScenario('NETWORK_FAILURE', 'Simulated GSM/LoRa Link Loss')}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition text-left"
              >
                <WifiOff className="w-4 h-4 text-slate-500 shrink-0" />
                Network Failure
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Real-time Risk Engine Output & JSON Payload */}
        <div className="lg:col-span-5 space-y-4">
          {/* Risk Engine Breakdown Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-600" />
                Risk Engine Calculation
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Formula: 0.35S + 0.30T + 0.25W + 0.10V</span>
            </h4>

            {latestComputedRisk ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border">
                  <div>
                    <span className="text-xs text-slate-500 block">Computed Risk Index</span>
                    <span className={`text-2xl font-black ${
                      latestComputedRisk.classification === 'RED'
                        ? 'text-red-600'
                        : latestComputedRisk.classification === 'YELLOW'
                        ? 'text-amber-500'
                        : 'text-emerald-600'
                    }`}>
                      {latestComputedRisk.score} / 100
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Classification</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                      latestComputedRisk.classification === 'RED'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : latestComputedRisk.classification === 'YELLOW'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {latestComputedRisk.classification}
                    </span>
                  </div>
                </div>

                {/* Sub-factor weights progress */}
                <div className="space-y-1.5 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                      <span>Soil Moisture Risk (S × 35%)</span>
                      <span className="font-mono font-bold">{latestComputedRisk.breakdown?.soilRisk || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full"
                        style={{ width: `${latestComputedRisk.breakdown?.soilRisk || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                      <span>Slope Tilt Risk (T × 30%)</span>
                      <span className="font-mono font-bold">{latestComputedRisk.breakdown?.tiltRisk || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${latestComputedRisk.breakdown?.tiltRisk || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                      <span>Rainfall Risk (W × 25%)</span>
                      <span className="font-mono font-bold">{latestComputedRisk.breakdown?.rainRisk || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${latestComputedRisk.breakdown?.rainRisk || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                      <span>Vibration Risk (V × 10%)</span>
                      <span className="font-mono font-bold">{latestComputedRisk.breakdown?.vibrationRisk || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full"
                        style={{ width: `${latestComputedRisk.breakdown?.vibrationRisk || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {latestComputedRisk.triggers && latestComputedRisk.triggers.length > 0 && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    <strong className="block font-semibold">Active Triggers:</strong>
                    <ul className="list-disc list-inside space-y-0.5">
                      {latestComputedRisk.triggers.map((tr: string, i: number) => (
                        <li key={i}>{tr}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No telemetry packet emitted yet in this session.</p>
            )}
          </div>

          {/* Telemetry Payload Inspector */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl shadow-inner font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                Telemetry Ingestion Wire Frame
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                SOURCE: SIMULATED
              </span>
            </div>
            <pre className="text-[11px] text-emerald-300 overflow-x-auto max-h-48">
              {JSON.stringify(
                {
                  nodeId: selectedNodeId,
                  source: 'SIMULATED',
                  timestamp: new Date().toISOString(),
                  sensors: {
                    soilMoisture: sensors.soilMoisture,
                    tiltAngle: sensors.tiltAngle,
                    vibration: sensors.vibration,
                    rainIntensity: sensors.rainIntensity
                  },
                  battery: { percentage: batteryLevel, voltage: 4.12 }
                },
                null,
                2
              )}
            </pre>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Phase 2 ESP32 hardware will submit this exact payload via POST /api/telemetry with device token.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
