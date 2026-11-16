import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Droplets, TrendingUp, CloudRain, Activity, ShieldAlert, BarChart3 } from 'lucide-react';

interface SensorChartsProps {
  data: Array<{
    time: string;
    nodeId?: string;
    soilMoisture: number;
    tiltAngle: number;
    vibration: number;
    rainIntensity: number;
    riskScore: number;
  }>;
}

export const SensorCharts: React.FC<SensorChartsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'soil' | 'tilt' | 'rain' | 'vibration' | 'risk'>('all');

  // Fallback demo data if no recent records yet
  const chartData = data && data.length > 0 ? data : [
    { time: '10:00', soilMoisture: 24, tiltAngle: 1.5, vibration: 0.08, rainIntensity: 2, riskScore: 18 },
    { time: '10:15', soilMoisture: 28, tiltAngle: 1.8, vibration: 0.12, rainIntensity: 6, riskScore: 24 },
    { time: '10:30', soilMoisture: 35, tiltAngle: 2.2, vibration: 0.18, rainIntensity: 18, riskScore: 36 },
    { time: '10:45', soilMoisture: 52, tiltAngle: 3.5, vibration: 0.25, rainIntensity: 42, riskScore: 54 },
    { time: '11:00', soilMoisture: 68, tiltAngle: 6.2, vibration: 0.45, rainIntensity: 65, riskScore: 72 },
    { time: '11:15', soilMoisture: 75, tiltAngle: 8.4, vibration: 0.85, rainIntensity: 55, riskScore: 79 },
    { time: '11:30', soilMoisture: 72, tiltAngle: 8.1, vibration: 0.50, rainIntensity: 20, riskScore: 68 }
  ];

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Sensor Telemetry Trends & Environmental Analytics
          </h3>
          <p className="text-xs text-slate-500">Real-time telemetry timeseries logged from monitored slope nodes</p>
        </div>

        {/* Chart Selector Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setActiveTab('soil')}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              activeTab === 'soil' ? 'bg-sky-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Droplets className="w-3 h-3" /> Soil Moisture
          </button>
          <button
            onClick={() => setActiveTab('tilt')}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              activeTab === 'tilt' ? 'bg-amber-500 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3 h-3" /> Tilt Angle
          </button>
          <button
            onClick={() => setActiveTab('rain')}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              activeTab === 'rain' ? 'bg-indigo-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CloudRain className="w-3 h-3" /> Rain
          </button>
          <button
            onClick={() => setActiveTab('vibration')}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              activeTab === 'vibration' ? 'bg-purple-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3 h-3" /> Vibration
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
              activeTab === 'risk' ? 'bg-red-600 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3 h-3" /> Risk Index
          </button>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'all' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="soilMoisture" name="Soil Moisture (%)" stroke="#0284c7" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tiltAngle" name="Slope Tilt (°)" stroke="#d97706" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="rainIntensity" name="Rainfall (mm/h)" stroke="#4f46e5" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="riskScore" name="Risk Score (0-100)" stroke="#dc2626" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          ) : activeTab === 'soil' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="soilMoisture" name="Soil Moisture %" stroke="#0284c7" fillOpacity={1} fill="url(#soilGrad)" />
            </AreaChart>
          ) : activeTab === 'tilt' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tiltGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 30]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="tiltAngle" name="Slope Tilt Angle (°)" stroke="#d97706" fillOpacity={1} fill="url(#tiltGrad)" />
            </AreaChart>
          ) : activeTab === 'rain' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
              <Bar dataKey="rainIntensity" name="Rainfall (mm/h)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : activeTab === 'vibration' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
              <Line type="step" dataKey="vibration" name="Ground Vibration (g)" stroke="#9333ea" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="riskScore" name="Comprehensive Risk Score" stroke="#dc2626" fillOpacity={1} fill="url(#riskGrad)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
