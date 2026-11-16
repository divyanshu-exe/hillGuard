import React from 'react';
import {
  Cpu,
  Droplets,
  TrendingUp,
  Activity,
  CloudRain,
  ShieldAlert,
  Camera,
  CheckCircle2,
  Workflow,
  ArrowRight
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Title */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#16A36A] uppercase tracking-widest">
          Scientific Methodology
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          How HillGuard Predicts & Verifies Road Blockages
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Combining roadside IoT telemetry, weighted geotechnical risk calculations, and authenticated citizen ground truthing.
        </p>
      </div>

      {/* Geotechnical Multi-Factor Formula */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Core Algorithm
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              The HillGuard Weighted Landslide Formula
            </h2>
          </div>
          <span className="text-xs bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full border border-emerald-800 font-mono">
            R = (0.35 × S) + (0.30 × T) + (0.25 × W) + (0.10 × V)
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          In Himalayan shale formations, mass wasting is triggered by a combination of sub-soil pore water pressure, gravitational shear strain, and ground vibration shockwaves. HillGuard normalizes all incoming sensor data into dimensionless risk scores (0 to 100):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* S */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-400 flex items-center gap-1.5">
                <Droplets className="w-4 h-4" /> S (35%)
              </span>
              <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 rounded">Moisture</span>
            </div>
            <strong className="block text-white">Soil Saturation Index</strong>
            <p className="text-slate-400 leading-relaxed">
              Monitors sub-soil saturation. When water content exceeds 65%, friction between soil layers drops exponentially.
            </p>
          </div>

          {/* T */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> T (30%)
              </span>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 rounded">Slope Tilt</span>
            </div>
            <strong className="block text-white">Shear Displacement</strong>
            <p className="text-slate-400 leading-relaxed">
              Measured via MPU6050 accelerometer. A sudden angular shift (&gt;5°) triggers immediate critical warning override.
            </p>
          </div>

          {/* W */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <CloudRain className="w-4 h-4" /> W (25%)
              </span>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 rounded">Precipitation</span>
            </div>
            <strong className="block text-white">Rainfall Intensity</strong>
            <p className="text-slate-400 leading-relaxed">
              Sustained precipitation (&gt;35 mm/h) accelerates soil liquefaction and erosion across newly cut road embankments.
            </p>
          </div>

          {/* V */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> V (10%)
              </span>
              <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 rounded">Vibration</span>
            </div>
            <strong className="block text-white">Dynamic Shockwaves</strong>
            <p className="text-slate-400 leading-relaxed">
              Micro-tremors and high-impact seismic spikes from falling boulders detected by gyroscope to signal active debris movement.
            </p>
          </div>
        </div>
      </div>

      {/* Distinct Risk vs Blockage Separation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          Critical Distinction: Landslide Risk vs Physical Road Blockage
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          One of the core architectural principles of HillGuard is that <strong>a high environmental risk score does not automatically mean a road is physically blocked</strong>:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
            <h4 className="font-bold text-amber-900 text-sm">Landslide Risk (Automated)</h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              Calculated continuously by the Risk Engine from live sensor readings. Alerts commuters that the slope is unstable and caution is required, but traffic may still be flowing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-1.5">
            <h4 className="font-bold text-red-900 text-sm">Road Passability (Physical Ground Truth)</h4>
            <p className="text-xs text-red-800 leading-relaxed">
              A road is only flagged as physically <strong>BLOCKED</strong> when backed by verified citizen photos and confirmed by authorized Border Roads Organisation (BRO) or APDMA officials.
            </p>
          </div>
        </div>
      </div>

      {/* Citizen Verification Workflow */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Workflow className="w-5 h-5 text-emerald-600" />
          The 4-Stage Citizen Verification Lifecycle
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <span className="font-mono font-bold text-emerald-600 text-xs block">STAGE 1</span>
            <span className="font-bold text-slate-800 block text-sm">NEW REPORT</span>
            <p className="text-slate-500">Citizen snaps live camera photo with automatic GPS metadata.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <span className="font-mono font-bold text-amber-600 text-xs block">STAGE 2</span>
            <span className="font-bold text-slate-800 block text-sm">UNDER REVIEW</span>
            <p className="text-slate-500">Queued in official control room. BRO highway patrol notified.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <span className="font-mono font-bold text-sky-600 text-xs block">STAGE 3</span>
            <span className="font-bold text-slate-800 block text-sm">VERIFIED / REJECTED</span>
            <p className="text-slate-500">Official authenticates evidence. Official passability updated.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <span className="font-mono font-bold text-emerald-700 text-xs block">STAGE 4</span>
            <span className="font-bold text-slate-800 block text-sm">RESOLVED</span>
            <p className="text-slate-500">Heavy bulldozers clear debris. Highway reopened for traffic.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
