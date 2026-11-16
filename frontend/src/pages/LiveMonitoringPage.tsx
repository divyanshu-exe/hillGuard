import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  Filter,
  MapPin,
  Clock,
  ShieldAlert,
  Droplets,
  TrendingUp,
  CloudRain,
  Camera,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';
import { RoadRiskMap } from '../components/map/RoadRiskMap';
import { StatusBadge } from '../components/common/StatusBadge';
import { RoadDetailsModal } from '../components/map/RoadDetailsModal';
import { cacheRoads, getCachedRoads } from '../services/offlineDb';
import { useOffline } from '../context/OfflineContext';
import { Road, WeatherData } from '../types';

interface LiveMonitoringPageProps {
  onOpenReportModal: () => void;
}

export const LiveMonitoringPage: React.FC<LiveMonitoringPageProps> = ({ onOpenReportModal }) => {
  const { isOnline, setCachedTimestamp } = useOffline();

  const [roads, setRoads] = useState<Road[]>([]);
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch roads & initial weather
  useEffect(() => {
    const fetchRoads = async () => {
      setIsLoading(true);
      try {
        if (!isOnline) {
          const cached = await getCachedRoads();
          if (cached && cached.data) {
            setRoads(cached.data);
            setCachedTimestamp(cached.cachedAt);
            if (cached.data.length > 0) setSelectedRoad(cached.data[0]);
          }
          setIsLoading(false);
          return;
        }

        const [roadsRes, weatherRes] = await Promise.all([
          api.get('/roads'),
          api.get('/weather/ITANAGAR')
        ]);

        if (roadsRes.data.success) {
          setRoads(roadsRes.data.data);
          cacheRoads(roadsRes.data.data);
          setCachedTimestamp(new Date().toISOString());
          if (roadsRes.data.data.length > 0) {
            setSelectedRoad(roadsRes.data.data[0]);
          }
        }

        if (weatherRes.data.success) {
          setWeather(weatherRes.data.data);
        }
      } catch (err) {
        console.warn('[LiveMonitoring] Failed to fetch live data, attempting cache...');
        const cached = await getCachedRoads();
        if (cached && cached.data) {
          setRoads(cached.data);
          setCachedTimestamp(cached.cachedAt);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoads();
  }, [isOnline, setCachedTimestamp]);

  // Unique districts
  const districts = Array.from(new Set(roads.map((r) => r.district)));

  // Filtered roads
  const filteredRoads = roads.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roadCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDistrict = districtFilter === 'ALL' || r.district === districtFilter;

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'BLOCKED'
        ? r.passability === 'BLOCKED' || r.isBlockageConfirmed
        : r.riskStatus === statusFilter;

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-emerald-600" />
            Live Arunachal Road Monitoring Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time environmental telemetry, geotechnical risk indices, and verified passability conditions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReportModal}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow transition"
          >
            <Camera className="w-4 h-4" />
            Report Road Blockage
          </button>
        </div>
      </div>

      {/* Main Grid: Left 8 Cols Map, Right 4 Cols Road Details & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Leaflet Interactive Map */}
        <div className="lg:col-span-8 space-y-4">
          <RoadRiskMap
            roads={filteredRoads}
            selectedRoadId={selectedRoad?._id}
            onSelectRoad={(road: Road) => setSelectedRoad(road)}
            height="580px"
          />

          {/* Quick Weather Snapshot Banner */}
          {weather && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg">
                  {weather.icon ? (
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                      alt={weather.condition}
                      className="w-10 h-10"
                    />
                  ) : (
                    '⛅'
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 font-bold text-sm">{weather.locationName}</strong>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {weather.source}
                    </span>
                  </div>
                  <span className="text-slate-500 capitalize">{weather.description}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <span className="text-slate-400 block text-[10px]">Temperature</span>
                  <span className="font-bold text-slate-800 text-sm">{weather.temperature}°C</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Humidity</span>
                  <span className="font-bold text-slate-800 text-sm">{weather.humidity}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Rainfall (1h)</span>
                  <span className="font-bold text-indigo-600 text-sm">{weather.rainfallMm} mm</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Wind Speed</span>
                  <span className="font-bold text-slate-800 text-sm">{weather.windSpeed} m/s</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 Cols): Searchable Road List & Inspection Details */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search highway, district, or pass..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white outline-none cursor-pointer"
              >
                <option value="ALL">All Districts</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="GREEN">Green (Safe)</option>
                <option value="YELLOW">Yellow (Warning)</option>
                <option value="RED">Red (Critical)</option>
                <option value="BLOCKED">Blocked Only</option>
              </select>
            </div>
          </div>

          {/* Road Cards List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[580px]">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs">
              <span className="font-bold">Monitored Highway Corridors</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                {filteredRoads.length}
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto">
              {filteredRoads.map((road) => {
                const isSelected = selectedRoad?._id === road._id;
                const isBlocked = road.passability === 'BLOCKED' || road.isBlockageConfirmed;

                return (
                  <div
                    key={road._id}
                    onClick={() => setSelectedRoad(road)}
                    className={`p-3.5 cursor-pointer transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-1.5 py-0.2 rounded">
                          {road.roadCode}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">{road.district}</span>
                      </div>
                      <h4 className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight">
                        {road.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                        "{road.riskReason}"
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <StatusBadge type="risk" value={road.riskStatus} size="sm" />
                      {isBlocked ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                          ⛔ BLOCKED
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-600">
                          {road.passability}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredRoads.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No road sections match the selected filter criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Road Full Details Modal */}
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
