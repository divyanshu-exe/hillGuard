import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mountain,
  ShieldCheck,
  AlertTriangle,
  Camera,
  Activity,
  Cpu,
  Radio,
  CloudRain,
  MapPin,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  Wifi,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { RoadRiskMap } from '../components/map/RoadRiskMap';
import { RoadDetailsModal } from '../components/map/RoadDetailsModal';
import { Road } from '../types';

interface LandingPageProps {
  onOpenReportModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenReportModal }) => {
  const [roads, setRoads] = useState<Road[]>([]);
  const [stats, setStats] = useState({
    monitoredSections: 5,
    activeNodes: 5,
    activeWarnings: 1,
    verifiedIncidents: 2,
    systemStatus: 'OPERATIONAL'
  });
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roadsRes, statsRes] = await Promise.all([
          api.get('/roads'),
          api.get('/dashboard/stats')
        ]);
        if (roadsRes.data.success) {
          setRoads(roadsRes.data.data);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.warn('[LandingPage] Error loading data');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#123B2A] via-[#164330] to-[#123B2A] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#1d523b]">
        {/* Subtle Mountain Topographic Vector Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#16A36A_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Pilot Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 radar-pulse-green" />
            <span>Arunachal Pradesh Disaster Management Intelligence • B.Tech Minor Project</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 Cols */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight font-sans">
                Know the Road <br />
                <span className="text-[#16A36A]">Before You Go.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl font-normal">
                Real-time landslide monitoring, intelligent road-risk analysis, and verified road-blockage alerts for safer journeys across the hills of Arunachal Pradesh.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/live-monitoring"
                  className="px-6 py-3.5 rounded-xl bg-[#16A36A] hover:bg-emerald-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition transform active:scale-95"
                >
                  <Activity className="w-5 h-5" />
                  Explore Live Map
                </Link>

                <button
                  onClick={onOpenReportModal}
                  className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-red-950/40 flex items-center gap-2 transition transform active:scale-95"
                >
                  <Camera className="w-5 h-5" />
                  Report Road Blockage
                </button>

                <Link
                  to="/simulator"
                  className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30 text-sm font-semibold flex items-center gap-2 transition"
                >
                  <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Hardware Simulator
                </Link>
              </div>

              {/* Live telemetry indicator banner */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-emerald-200/90 border-t border-emerald-900/60">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Telemetry Ingestion: <strong>Active</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Phase 1 Simulator: <strong>Running</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-sky-300" />
                  <span>Offline PWA Ready: <strong>IndexedDB Cached</strong></span>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Live System Status Glassmorphic Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#0b271b]/90 backdrop-blur-md rounded-2xl p-6 border border-emerald-800/60 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-900">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">Real-Time Highway Status</h3>
                  </div>
                  <span className="text-[11px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                    PILOT METRICS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#123B2A] rounded-xl border border-emerald-800">
                    <span className="text-[11px] text-slate-300 block mb-1">Monitored Highways</span>
                    <span className="text-2xl font-black text-white">{stats.monitoredSections}</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">Key Arunachal passes</span>
                  </div>

                  <div className="p-3 bg-[#123B2A] rounded-xl border border-emerald-800">
                    <span className="text-[11px] text-slate-300 block mb-1">Active IoT Nodes</span>
                    <span className="text-2xl font-black text-emerald-400">{stats.activeNodes}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">ESP32 Sim Telemetry</span>
                  </div>

                  <div className="p-3 bg-[#123B2A] rounded-xl border border-emerald-800">
                    <span className="text-[11px] text-slate-300 block mb-1">Active Warnings</span>
                    <span className="text-2xl font-black text-amber-400">{stats.activeWarnings}</span>
                    <span className="text-[10px] text-amber-300 block mt-0.5">Pore saturation alerts</span>
                  </div>

                  <div className="p-3 bg-[#123B2A] rounded-xl border border-emerald-800">
                    <span className="text-[11px] text-slate-300 block mb-1">Verified Incidents</span>
                    <span className="text-2xl font-black text-rose-400">{stats.verifiedIncidents}</span>
                    <span className="text-[10px] text-rose-300 block mt-0.5">BRO Ground Confirmed</span>
                  </div>
                </div>

                <div className="p-3 bg-[#0d2a1d] rounded-xl border border-emerald-900 text-xs text-slate-300 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Sela Tunnel - Tawang Route</span>
                    <span className="text-red-400 font-bold">CRITICAL: Rockfall Blockage at Km 48</span>
                  </div>
                  <Link
                    to="/live-monitoring"
                    className="text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1"
                  >
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="text-[10px] text-slate-400 italic text-center">
                  * Note: Real-time telemetry currently generated via HillGuard Hardware Simulator for evaluation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Monitoring Preview (Embedded Interactive Map) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#16A36A]">
            Geospatial Intelligence
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Interactive Arunachal Pradesh Highway Risk Map
          </h2>
          <p className="text-sm text-slate-600">
            Click on any highway segment or monitoring node marker to inspect live soil moisture, slope tilt, and official passability.
          </p>
        </div>

        <RoadRiskMap
          roads={roads}
          selectedRoadId={selectedRoad?._id}
          onSelectRoad={(road: Road) => setSelectedRoad(road)}
          height="520px"
        />
      </section>

      {/* 3. Why HillGuard Matters (Solving the Real-World Problem) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl">
          <div className="max-w-3xl mb-10 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Problem Statement & Real Need
            </span>
            <h2 className="text-3xl font-black text-white">Why HillGuard Matters in Arunachal Pradesh</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Arunachal Pradesh features rugged Himalayan roads that face sudden landslides, cloudbursts, and unstable shale soil during monsoons. Existing information channels leave commuters stranded.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-red-900/60 text-red-400 flex items-center justify-center font-bold">
                ⚠️
              </div>
              <h3 className="font-bold text-white text-base">Combats Fake WhatsApp Rumours</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Replaces unverified social media forwards with cryptographic official verification, time-stamped camera proofs, and live sensor truth.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-900/60 text-emerald-400 flex items-center justify-center font-bold">
                📡
              </div>
              <h3 className="font-bold text-white text-base">Works in Poor Network Zones</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Engineered with Progressive Web App (PWA) architecture and IndexedDB. Commuters view cached road conditions even when cell reception drops in deep gorges.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-sky-900/60 text-sky-400 flex items-center justify-center font-bold">
                📷
              </div>
              <h3 className="font-bold text-white text-base">Live Camera & GPS Verification</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prevents fake citizen reports by requiring direct browser live camera stream capture and hardware GPS ground-truthing with accuracy metadata.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-purple-900/60 text-purple-400 flex items-center justify-center font-bold">
                🧠
              </div>
              <h3 className="font-bold text-white text-base">Intelligent Multi-Factor Risk Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates soil moisture, slope tilt, vibration, and rainfall intensity through our calibrated formula: R = 0.35S + 0.30T + 0.25W + 0.10V.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-amber-900/60 text-amber-400 flex items-center justify-center font-bold">
                🛡️
              </div>
              <h3 className="font-bold text-white text-base">Distinct Risk vs Blockage Separation</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                High landslide risk indicates environmental danger, while physical blockage requires official BRO or APDMA confirmation before halting routes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-900/60 text-indigo-400 flex items-center justify-center font-bold">
                ⚡
              </div>
              <h3 className="font-bold text-white text-base">Phase 2 Hardware Integration Ready</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Phase 1 hardware simulator uses the exact API endpoints and authentication tokens that real ESP32 microcontrollers will use in Phase 2.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How the System Works (Pipeline) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#16A36A]">
            Architecture & Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">How HillGuard Works</h2>
          <p className="text-sm text-slate-600">
            A seamless bridge from roadside IoT sensors to disaster authorities and traveller smartphones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <span className="text-3xl font-black text-emerald-100 absolute top-4 right-4">01</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A36A] flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">1. IoT Telemetry</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Slope stations sample soil moisture, MPU6050 tilt/vibration, and rain gauge data. Packets transmit over GSM/LoRa.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <span className="text-3xl font-black text-emerald-100 absolute top-4 right-4">02</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A36A] flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">2. Risk Assessment Engine</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unified backend calculates normalized risk score (0-100). Sudden tilt leaps trigger immediate priority alerts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <span className="text-3xl font-black text-emerald-100 absolute top-4 right-4">03</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A36A] flex items-center justify-center mb-4">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">3. Citizen Ground Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Commuters report blockages with mandatory live camera and GPS. BRO officials verify or reject from control room.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <span className="text-3xl font-black text-emerald-100 absolute top-4 right-4">04</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A36A] flex items-center justify-center mb-4">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-2">4. Real-Time Push & PWA</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Socket.IO broadcasts changes instantly. Offline service worker caches routes for offline mountain travel.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Risk Classification Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#16A36A] uppercase tracking-wider">Operational Standards</span>
              <h2 className="text-2xl font-black text-slate-900">HillGuard Multi-Level Risk Hierarchy</h2>
            </div>
            <span className="text-xs text-slate-500">Configured in accordance with APDMA Mountain Safety Protocols</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Green */}
            <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/70 space-y-2">
              <div className="flex items-center justify-between font-bold text-emerald-800">
                <span className="flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> GREEN
                </span>
                <span className="text-xs bg-emerald-200 px-2 py-0.5 rounded">0 - 29</span>
              </div>
              <strong className="block text-emerald-950 font-semibold">SAFE CONDITIONS</strong>
              <p className="text-slate-600 leading-relaxed">
                Sub-soil moisture within dry limits (&lt;35%), slope tilt stable, ambient vibration only. Normal mountain travel permitted.
              </p>
            </div>

            {/* Yellow */}
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-800">
                <span className="flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> YELLOW
                </span>
                <span className="text-xs bg-amber-200 px-2 py-0.5 rounded">30 - 69</span>
              </div>
              <strong className="block text-amber-950 font-semibold">LANDSLIDE WARNING</strong>
              <p className="text-slate-600 leading-relaxed">
                Elevated rainfall and rising pore water pressure (35-65%). Slow driving, maintain convoy distance, beware of shooting stones.
              </p>
            </div>

            {/* Red */}
            <div className="p-4 rounded-xl border border-red-300 bg-red-50/70 space-y-2">
              <div className="flex items-center justify-between font-bold text-red-800">
                <span className="flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> RED
                </span>
                <span className="text-xs bg-red-200 px-2 py-0.5 rounded">70 - 100</span>
              </div>
              <strong className="block text-red-950 font-semibold">CRITICAL RISK</strong>
              <p className="text-slate-600 leading-relaxed">
                Pore pressure saturation (&gt;75%), sudden slope displacement (&gt;15°), or debris vibration shockwave. High probability of mass slide.
              </p>
            </div>

            {/* Blocked */}
            <div className="p-4 rounded-xl border border-red-800 bg-red-900 text-white space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-sm">
                  ⛔ BLOCKED
                </span>
                <span className="text-xs bg-red-800 px-2 py-0.5 rounded">PHYSICAL</span>
              </div>
              <strong className="block font-semibold">CONFIRMED CLOSURE</strong>
              <p className="text-red-100 leading-relaxed">
                Debris or rockfall physically obstructing roadway. Verified by official personnel. Highway closed to civilian traffic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Hardware Preview (Phase 2 Readiness) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#123B2A] to-[#1c553d] text-white rounded-3xl p-8 sm:p-12 border border-[#256e50] shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Phase 2 Integration Preview
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Physical IoT Sensor Architecture</h2>
            </div>
            <Link
              to="/simulator"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start md:self-auto"
            >
              Open Simulator Controls <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
            In Phase 1, all sensor streams are generated through our Hardware Simulator. In Phase 2, the exact same endpoints will receive live data from outdoor-hardened sensor nodes deployed on Himalayan slopes:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="p-3 bg-black/20 rounded-xl border border-emerald-500/20 text-center">
              <span className="text-xs font-bold block text-emerald-300">ESP32 MCU</span>
              <span className="text-[11px] text-slate-300">Dual-Core 240MHz</span>
            </div>
            <div className="p-3 bg-black/20 rounded-xl border border-emerald-500/20 text-center">
              <span className="text-xs font-bold block text-emerald-300">Soil Moisture</span>
              <span className="text-[11px] text-slate-300">Capacitive v1.2</span>
            </div>
            <div className="p-3 bg-black/20 rounded-xl border border-emerald-500/20 text-center">
              <span className="text-xs font-bold block text-emerald-300">MPU6050</span>
              <span className="text-[11px] text-slate-300">6-DOF Tilt/Gyro</span>
            </div>
            <div className="p-3 bg-black/20 rounded-xl border border-emerald-500/20 text-center">
              <span className="text-xs font-bold block text-emerald-300">Rain Gauge</span>
              <span className="text-[11px] text-slate-300">Optical Tipping</span>
            </div>
            <div className="p-3 bg-black/20 rounded-xl border border-emerald-500/20 text-center">
              <span className="text-xs font-bold block text-emerald-300">SIM800L / LoRa</span>
              <span className="text-[11px] text-slate-300">Dual GSM Fallback</span>
            </div>
            <div className="p-3 bg-black/20 rounded-xl border border-emerald-500/20 text-center">
              <span className="text-xs font-bold block text-emerald-300">Solar LiFePO4</span>
              <span className="text-[11px] text-slate-300">Autonomous Power</span>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Road Details Modal */}
      {selectedRoad && (
        <RoadDetailsModal
          road={selectedRoad}
          onClose={() => setSelectedRoad(null)}
          onOpenReportModal={(_road: Road) => {
            setSelectedRoad(null);
            onOpenReportModal();
          }}
        />
      )}
    </div>
  );
};
