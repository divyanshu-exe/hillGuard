import React, { useState } from 'react';
import {
  FileText,
  Cpu,
  Database,
  Layers,
  Terminal,
  Shield,
  Code2,
  Server,
  Radio,
  ExternalLink
} from 'lucide-react';

export const DocumentationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'api' | 'database' | 'hardware' | 'formula'>('architecture');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span>HillGuard System</span>
          <span>•</span>
          <span className="text-emerald-700 font-bold">Technical Specifications</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-8 h-8 text-emerald-600" />
          HillGuard Technical & Architecture Documentation
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Full-stack specifications for academic viva evaluation, technical defense, and Phase 2 physical hardware deployment.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'architecture' ? 'bg-[#123B2A] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" /> System Architecture
        </button>
        <button
          onClick={() => setActiveTab('formula')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'formula' ? 'bg-[#123B2A] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4" /> Risk Engine Algorithm
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'api' ? 'bg-[#123B2A] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" /> REST APIs & Sockets
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'database' ? 'bg-[#123B2A] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" /> Database Models
        </button>
        <button
          onClick={() => setActiveTab('hardware')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'hardware' ? 'bg-[#123B2A] text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-4 h-4" /> Phase 2 Hardware Guide
        </button>
      </div>

      {/* Tab 1: Architecture */}
      {activeTab === 'architecture' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-600" />
            End-to-End System Architecture
          </h2>
          <p>
            HillGuard follows a modular, decoupled tier design ensuring continuous operation during Himalayan weather extremes and network outages.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border space-y-2">
              <strong className="text-emerald-700 block text-sm">1. Edge & Telemetry Layer</strong>
              <p className="text-slate-600">
                Phase 1 employs a multi-threaded Hardware Simulator module. In Phase 2, ESP32 nodes sample capacitive soil moisture, MPU6050 angle, and rain intensity every 5–15 seconds, transmitting JSON over HTTP/GSM.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border space-y-2">
              <strong className="text-emerald-700 block text-sm">2. Compute & Risk Assessment Tier</strong>
              <p className="text-slate-600">
                Node.js + Express backend hosting the rule-based Intelligent Risk Assessment Engine. Evaluates formula weights, detects sudden angular slope shifts, and persists time-series telemetry in MongoDB.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border space-y-2">
              <strong className="text-emerald-700 block text-sm">3. PWA Client & Presentation Tier</strong>
              <p className="text-slate-600">
                React 19, TypeScript, Leaflet.js, and Recharts. Progressive Web App (PWA) with Service Worker and IndexedDB for zero-network offline highway guidance and background report synchronization.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-2xl font-mono text-xs">
            <strong className="text-emerald-400 block mb-2">// HillGuard Architectural Flow:</strong>
            <p className="text-slate-300">
              [ESP32 / Simulator] ──&gt; POST /api/telemetry ──&gt; [Risk Engine: 0.35S+0.30T+0.25W+0.10V]<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&gt; [MongoDB Time-Series Telemetry]<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&gt; [Update Road Risk Status (Green/Yellow/Red)]<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&gt; [Socket.IO Broadcast] ──&gt; [Live Map &amp; Dashboards]
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Formula */}
      {activeTab === 'formula' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Code2 className="w-6 h-6 text-emerald-600" />
            Geotechnical Risk Formula & Normalization
          </h2>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <span className="text-xs font-bold text-emerald-900 uppercase">Mathematical Expression</span>
            <div className="text-lg font-mono font-black text-emerald-800 my-1">
              R = (0.35 × S) + (0.30 × T) + (0.25 × W) + (0.10 × V)
            </div>
            <p className="text-xs text-emerald-700">
              Where all normalized indices S, T, W, V range between 0 and 100.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Autonomous Event Triggers</h3>
            <ul className="space-y-2 list-disc list-inside text-xs">
              <li>
                <strong>Sudden Slope Tilt Movement Trigger:</strong> If tilt angle increases by &gt;=5° between consecutive sampling cycles, or total tilt exceeds 15°, the system triggers an emergency override forcing R &gt;= 75 (RED Alert).
              </li>
              <li>
                <strong>Pore Saturation &amp; Downpour Synergy:</strong> When soil moisture &gt;=75% and rainfall &gt;=35 mm/h occur simultaneously, risk score is elevated to a minimum of 78.
              </li>
              <li>
                <strong>Abnormal Vibration:</strong> Vibration &gt;= 2.2g indicates active rockfall or debris impact, creating an investigation alert.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: API Documentation */}
      {activeTab === 'api' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Server className="w-6 h-6 text-emerald-600" />
            REST API Endpoints Reference
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b">
                  <th className="p-2.5 font-bold">Method</th>
                  <th className="p-2.5 font-bold">Endpoint</th>
                  <th className="p-2.5 font-bold">Access</th>
                  <th className="p-2.5 font-bold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr>
                  <td className="p-2 text-emerald-600 font-bold">POST</td>
                  <td className="p-2">/api/telemetry</td>
                  <td className="p-2 text-slate-600 font-sans">Device Token / JWT</td>
                  <td className="p-2 text-slate-600 font-sans">Unified ingestion for ESP32 and Simulator</td>
                </tr>
                <tr>
                  <td className="p-2 text-sky-600 font-bold">GET</td>
                  <td className="p-2">/api/telemetry/:nodeId/history</td>
                  <td className="p-2 text-slate-600 font-sans">Public</td>
                  <td className="p-2 text-slate-600 font-sans">Get historical sensor timeseries for Recharts</td>
                </tr>
                <tr>
                  <td className="p-2 text-sky-600 font-bold">GET</td>
                  <td className="p-2">/api/roads</td>
                  <td className="p-2 text-slate-600 font-sans">Public</td>
                  <td className="p-2 text-slate-600 font-sans">List all monitored highways, status &amp; nodes</td>
                </tr>
                <tr>
                  <td className="p-2 text-amber-600 font-bold">PATCH</td>
                  <td className="p-2">/api/roads/:id/status</td>
                  <td className="p-2 text-slate-600 font-sans">Official / Admin</td>
                  <td className="p-2 text-slate-600 font-sans">Update physical passability (OPEN/BLOCKED)</td>
                </tr>
                <tr>
                  <td className="p-2 text-emerald-600 font-bold">POST</td>
                  <td className="p-2">/api/reports</td>
                  <td className="p-2 text-slate-600 font-sans">Public (Live Cam)</td>
                  <td className="p-2 text-slate-600 font-sans">Submit citizen report with base64/file image</td>
                </tr>
                <tr>
                  <td className="p-2 text-amber-600 font-bold">PATCH</td>
                  <td className="p-2">/api/reports/:id/verify</td>
                  <td className="p-2 text-slate-600 font-sans">Official / Admin</td>
                  <td className="p-2 text-slate-600 font-sans">Verify or reject incident report</td>
                </tr>
                <tr>
                  <td className="p-2 text-emerald-600 font-bold">POST</td>
                  <td className="p-2">/api/simulator/scenario</td>
                  <td className="p-2 text-slate-600 font-sans">Public (Phase 1)</td>
                  <td className="p-2 text-slate-600 font-sans">Apply preset heavy rain/tilt collapse scenarios</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Database Models */}
      {activeTab === 'database' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-emerald-600" />
            MongoDB Schema Collections
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border space-y-1">
              <strong className="text-slate-900 text-sm block">1. User</strong>
              <p className="text-xs text-slate-500 font-mono">
                name, email, password, role ('traveller' | 'official' | 'admin'), department, badgeNumber, preferences
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border space-y-1">
              <strong className="text-slate-900 text-sm block">2. SensorNode</strong>
              <p className="text-xs text-slate-500 font-mono">
                nodeId, name, road, location, hardwareModel, status, batteryLevel, isSimulated, apiKey
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border space-y-1">
              <strong className="text-slate-900 text-sm block">3. Road</strong>
              <p className="text-xs text-slate-500 font-mono">
                roadCode, name, district, coordinates[], riskStatus ('GREEN'|'YELLOW'|'RED'), passability ('OPEN'|'BLOCKED')
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border space-y-1">
              <strong className="text-slate-900 text-sm block">4. Telemetry</strong>
              <p className="text-xs text-slate-500 font-mono">
                nodeId, source ('SIMULATED'|'HARDWARE'), timestamp, sensors, battery, location, computedRisk
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border space-y-1">
              <strong className="text-slate-900 text-sm block">5. Report</strong>
              <p className="text-xs text-slate-500 font-mono">
                reportId, incidentType, imageUrl, location, status ('NEW'|'UNDER_REVIEW'|'VERIFIED'|'RESOLVED')
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border space-y-1">
              <strong className="text-slate-900 text-sm block">6. AuditLog</strong>
              <p className="text-xs text-slate-500 font-mono">
                user, action, targetEntity, targetId, details, ipAddress, createdAt
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Hardware Guide */}
      {activeTab === 'hardware' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-600" />
            Phase 2 Physical ESP32 Hardware Integration Guide
          </h2>
          <p>
            When transitioning from Phase 1 to Phase 2, connect actual microcontrollers using the provided sketch in <code className="text-emerald-700 font-mono">hardware/esp32_firmware/hillguard_esp32_node.ino</code>.
          </p>

          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs">
            <strong className="text-emerald-400 block mb-2">// ESP32 Pin Allocation Matrix:</strong>
            <pre className="text-emerald-300">
{`ESP32 Pin     Connected Component         Signal Type
GPIO 34 (ADC) Capacitive Soil Moisture v1.2 Analog (0-3.3V)
GPIO 21 (SDA) MPU6050 Accelerometer/Gyro    I2C Data
GPIO 22 (SCL) MPU6050 Accelerometer/Gyro    I2C Clock
GPIO 35 (ADC) Optical Rain Gauge Sensor     Analog / Digital Pulse
GPIO 16 (RX2) SIM800L GSM Module (TX)       UART Communication
GPIO 17 (TX2) SIM800L GSM Module (RX)       UART Communication
GPIO 4        Warning Red Strobe LED        Digital Output
GPIO 5        Loud Highway Buzzer           Digital Output`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
