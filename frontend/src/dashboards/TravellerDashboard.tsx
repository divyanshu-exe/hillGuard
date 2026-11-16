import React, { useState, useEffect } from 'react';
import {
  Compass,
  AlertTriangle,
  ShieldCheck,
  Ban,
  Clock,
  Camera,
  MapPin,
  CloudRain,
  ExternalLink,
  Search,
  CheckCircle2,
  Activity,
  Layers
} from 'lucide-react';
import api from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { RoadRiskMap } from '../components/map/RoadRiskMap';
import { RoadDetailsModal } from '../components/map/RoadDetailsModal';
import { Road, Alert, Report, WeatherData } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface TravellerDashboardProps {
  onOpenReportModal: () => void;
}

export const TravellerDashboard: React.FC<TravellerDashboardProps> = ({ onOpenReportModal }) => {
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState<{
    summary?: any;
    highRiskRoads?: Road[];
    allRoads?: Road[];
    activeAlerts?: Alert[];
    recentVerifiedReports?: Report[];
    weather?: WeatherData;
    lastDataUpdateTime?: string;
  }>({});
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/dashboard/traveller');
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.warn('[TravellerDashboard] Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const summary = dashboardData.summary || {
    totalRoads: 5,
    safeRoads: 2,
    warningRoads: 2,
    criticalRoads: 1,
    blockedRoads: 1,
    overallStatus: 'CAUTION'
  };

  const highRiskRoads = dashboardData.highRiskRoads || [];
  const allRoads = dashboardData.allRoads || [];
  const activeAlerts = dashboardData.activeAlerts || [];
  const recentVerifiedReports = dashboardData.recentVerifiedReports || [];
  const weather = dashboardData.weather;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#123B2A] to-[#1c553d] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#23684b] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 radar-pulse-green" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {t('traveller.portal')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {t('traveller.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
            {t('traveller.subtitle')}
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg transition transform active:scale-95 shrink-0 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          {t('traveller.reportBtn')}
        </button>
      </div>

      {/* Overview Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">{t('traveller.totalMonitored')}</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{summary.totalRoads}</span>
          <span className="text-[10px] text-slate-500">Key mountain passes</span>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-emerald-700 block text-[10px] font-semibold uppercase">{t('traveller.safe')}</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{summary.safeRoads}</span>
          <span className="text-[10px] text-emerald-600">Green status</span>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-amber-700 block text-[10px] font-semibold uppercase">{t('traveller.warning')}</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{summary.warningRoads}</span>
          <span className="text-[10px] text-amber-600">Caution advised</span>
        </div>

        <div className="p-4 bg-red-50 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-red-700 block text-[10px] font-semibold uppercase">{t('traveller.critical')}</span>
          <span className="text-2xl font-black text-red-600 mt-1 block">{summary.criticalRoads}</span>
          <span className="text-[10px] text-red-600">Slope collapse alert</span>
        </div>

        <div className="p-4 bg-red-900 text-white rounded-2xl shadow-xs col-span-2 sm:col-span-1">
          <span className="text-red-200 block text-[10px] font-semibold uppercase">{t('traveller.blocked')}</span>
          <span className="text-2xl font-black text-white mt-1 block">{summary.blockedRoads}</span>
          <span className="text-[10px] text-red-200">BRO clearing underway</span>
        </div>
      </div>

      {/* Weather & Active Warnings Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Emergency Warnings (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              {t('traveller.activeAdvisories')}
            </h3>
            <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
              {activeAlerts.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                  alert.category === 'ROAD_BLOCKED'
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    alert.category === 'ROAD_BLOCKED'
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {alert.category === 'ROAD_BLOCKED' ? '⛔' : '⚠️'}
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{alert.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{alert.message}</p>
                  <p className="text-[11px] text-slate-500 italic pt-0.5">Cause: {alert.cause}</p>
                </div>
              </div>
            ))}

            {activeAlerts.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-4">
                No active landslide advisories. Highways operating within baseline thresholds.
              </p>
            )}
          </div>
        </div>

        {/* Live Weather Widget (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-sky-600" />
              {t('traveller.weather')}
            </h3>
            <span className="text-[10px] text-slate-400">Itanagar Capital</span>
          </div>

          {weather ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-sky-50 rounded-xl border border-sky-100">
                <div>
                  <span className="text-2xl font-black text-slate-900">{weather.temperature}°C</span>
                  <span className="text-[11px] text-slate-500 block capitalize">{weather.description}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Rain Intensity</span>
                  <span className="font-bold text-indigo-700 text-sm">{weather.rainfallMm} mm/h</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div className="p-2 bg-slate-50 rounded border">
                  <span className="text-[10px] text-slate-400 block">Humidity</span>
                  <span className="font-bold text-slate-800">{weather.humidity}%</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border">
                  <span className="text-[10px] text-slate-400 block">Wind Speed</span>
                  <span className="font-bold text-slate-800">{weather.windSpeed} m/s</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                * Sensor telemetry and weather data represent distinct geotechnical evidence streams.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Loading weather telemetry...</p>
          )}
        </div>
      </div>

      {/* Interactive Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            {t('traveller.mapTitle')}
          </h3>
          <span className="text-xs text-slate-500">Click any highway or marker for full telemetry breakdown</span>
        </div>

        <RoadRiskMap
          roads={allRoads}
          selectedRoadId={selectedRoad?._id}
          onSelectRoad={(road: Road) => setSelectedRoad(road)}
          height="540px"
        />
      </div>

      {/* Recent Verified Incident Reports by Citizens */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            {t('traveller.recentReports')}
          </span>
          <span className="text-xs text-slate-500 font-normal">BRO Ground Truthed</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentVerifiedReports.map((report) => (
            <div key={report._id} className="p-4 rounded-xl bg-slate-50 border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">{report.roadName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {report.status}
                </span>
              </div>
              <p className="text-slate-600 italic">"{report.description}"</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t pt-1">
                <span>Type: <strong>{report.incidentType}</strong></span>
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedRoad && (
        <RoadDetailsModal
          road={selectedRoad}
          onClose={() => setSelectedRoad(null)}
          onOpenReportModal={() => onOpenReportModal()}
        />
      )}
    </div>
  );
};
