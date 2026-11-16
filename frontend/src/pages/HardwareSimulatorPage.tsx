import React, { useState, useEffect } from 'react';
import { Cpu, Info, Shield, Radio, Layers, Activity, FileCode } from 'lucide-react';
import { HardwareSimulatorControls } from '../components/simulator/HardwareSimulatorControls';
import api from '../services/api';
import { SensorNode, Telemetry } from '../types';

export const HardwareSimulatorPage: React.FC = () => {
  const [nodes, setNodes] = useState<SensorNode[]>([]);

  useEffect(() => {
    const fetchNodes = async () => {
      try {
        const res = await api.get('/nodes');
        if (res.data.success) {
          setNodes(res.data.data);
        }
      } catch (err) {
        console.warn('[Simulator Page] Could not load nodes');
      }
    };

    fetchNodes();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>HillGuard System</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">IoT Simulation Module</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Cpu className="w-8 h-8 text-emerald-600" />
          HillGuard Hardware Control Centre
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
          Simulate ESP32 microcontroller sensor telemetry, trigger critical rainfall and slope tilt failure scenarios, and observe the live Risk Engine response across all dashboards in real-time.
        </p>
      </div>

      {/* Main Interactive Controls */}
      <HardwareSimulatorControls nodes={nodes} />

      {/* Architectural Guarantee Note */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-base text-white">Unified Telemetry Architecture Guarantee</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The simulated sensor data from this control centre passes through the exact same backend validation pipeline, database models (<code className="text-emerald-300">Telemetry</code>, <code className="text-emerald-300">Road</code>), and Risk Engine calculations as future physical hardware. The only difference is the cryptographic <code className="text-emerald-300">source: "SIMULATED"</code> metadata tag, ensuring that simulated and future hardware data can never be confused.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <strong className="block text-emerald-400 mb-1">Same Ingestion API</strong>
            <span className="text-slate-400">POST /api/telemetry processes both simulator and ESP32 with identical schemas.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <strong className="block text-amber-400 mb-1">Zero Code Rewrite for Phase 2</strong>
            <span className="text-slate-400">Connecting real ESP32 microcontrollers in Phase 2 requires zero frontend or backend changes.</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
            <strong className="block text-sky-400 mb-1">Live Socket.IO Emission</strong>
            <span className="text-slate-400">All slider adjustments and 5s cycles broadcast instant updates to Traveller & Official maps.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
