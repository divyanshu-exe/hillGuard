import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Navigation,
  Layers,
  Filter,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Ban,
  Radio,
  Clock,
  Compass,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Road, SensorNode, RiskStatus, RoadPassability } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface RoadRiskMapProps {
  roads: Road[];
  selectedRoadId?: string;
  onSelectRoad?: (road: Road) => void;
  height?: string;
}

// Custom Leaflet Icons using clean SVGs
const createNodeIcon = (status: RiskStatus | 'OFFLINE') => {
  let color = '#16A36A'; // Green
  if (status === 'YELLOW') color = '#F4B740';
  if (status === 'RED') color = '#DC3545';
  if (status === 'OFFLINE') color = '#6c757d';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/></svg>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14]
  });
};

const createBlockageIcon = () => {
  return L.divIcon({
    className: 'custom-blockage-marker',
    html: `
      <div style="background-color: #DC3545; width: 32px; height: 32px; border-radius: 8px; border: 3px solid white; box-shadow: 0 4px 10px rgba(220,53,69,0.5); display: flex; align-items: center; justify-content: center; color: white; animation: radar-pulse 2s infinite;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

const createLocationIcon = () => {
  return L.divIcon({
    className: 'custom-my-location-marker',
    html: `
      <div style="background-color: #0284c7; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 6px rgba(2,132,199,0.3); display: flex; align-items: center; justify-content: center;">
        <div style="width: 8px; height: 8px; border-radius: 50%; background-color: white;"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

// Component to recenter map programmatically
const RecenterMap: React.FC<{ coords: [number, number] | null }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 11, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

export const RoadRiskMap: React.FC<RoadRiskMapProps> = ({
  roads,
  selectedRoadId,
  onSelectRoad,
  height = '580px'
}) => {
  // Center of Arunachal Pradesh (Itanagar - Bomdila region)
  const defaultCenter: [number, number] = [27.35, 93.30];
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterDistrict, setFilterDistrict] = useState<string>('ALL');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);

  // Available districts from roads list
  const districts = Array.from(new Set(roads.map((r) => r.district)));

  // Filter roads
  const filteredRoads = roads.filter((road) => {
    const matchesStatus =
      filterStatus === 'ALL'
        ? true
        : filterStatus === 'BLOCKED'
        ? road.passability === 'BLOCKED' || road.isBlockageConfirmed
        : road.riskStatus === filterStatus;

    const matchesDistrict = filterDistrict === 'ALL' || road.district === filterDistrict;

    return matchesStatus && matchesDistrict;
  });

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setFlyToCoords(coords);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert(`Location access denied or unavailable: ${err.message}`);
      },
      { timeout: 8000 }
    );
  };

  // Color mapping for polyline
  const getPolylineColor = (riskStatus: RiskStatus, isBlocked: boolean) => {
    if (isBlocked) return '#b91c1c'; // Dark Red
    if (riskStatus === 'RED') return '#DC3545';
    if (riskStatus === 'YELLOW') return '#F4B740';
    return '#16A36A'; // Emerald Green
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md bg-white">
      {/* Map Header Controls & Filters */}
      <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">Arunachal Pradesh Highway Risk Grid</span>
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            {filteredRoads.length} Monitored Sections
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="GREEN" className="bg-slate-900">Green (Safe)</option>
              <option value="YELLOW" className="bg-slate-900">Yellow (Landslide Warning)</option>
              <option value="RED" className="bg-slate-900">Red (Critical Risk)</option>
              <option value="BLOCKED" className="bg-slate-900">Blocked Roads Only</option>
            </select>
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d} className="bg-slate-900">
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Locate Me */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1 bg-sky-700 hover:bg-sky-600 text-white px-2.5 py-1 rounded transition font-medium"
            title="Locate my position on map"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Locating...' : 'My Location'}
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ height }}>
        <MapContainer
          center={defaultCenter}
          zoom={8}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <RecenterMap coords={flyToCoords} />

          {/* Render User GPS Location */}
          {userLocation && (
            <Marker position={userLocation} icon={createLocationIcon()}>
              <Popup>
                <div className="text-xs">
                  <strong className="text-sky-700">You Are Here</strong>
                  <p className="text-slate-500">Live GPS Coordinates detected</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Render Monitored Roads (Polylines & Endpoints) */}
          {filteredRoads.map((road) => {
            const positions: [number, number][] = road.coordinates.map((c) => [c.latitude, c.longitude]);
            const isBlocked = road.passability === 'BLOCKED' || road.isBlockageConfirmed;
            const lineColor = getPolylineColor(road.riskStatus, isBlocked);

            return (
              <React.Fragment key={road._id}>
                {/* Road Polyline */}
                <Polyline
                  positions={positions}
                  pathOptions={{
                    color: lineColor,
                    weight: road._id === selectedRoadId ? 7 : 5,
                    opacity: 0.85,
                    dashArray: isBlocked ? '8, 8' : undefined
                  }}
                  eventHandlers={{
                    click: () => {
                      if (onSelectRoad) onSelectRoad(road);
                    }
                  }}
                />

                {/* Road Blockage Marker if Road is Confirmed Blocked */}
                {isBlocked && (
                  <Marker
                    position={[road.coordinates[Math.floor(road.coordinates.length / 2)].latitude, road.coordinates[Math.floor(road.coordinates.length / 2)].longitude]}
                    icon={createBlockageIcon()}
                  >
                    <Popup>
                      <div className="p-1 min-w-[220px]">
                        <div className="flex items-center gap-1.5 text-red-600 font-bold text-sm mb-1">
                          <Ban className="w-4 h-4" />
                          CONFIRMED ROAD BLOCKAGE
                        </div>
                        <h4 className="font-semibold text-slate-800 text-xs mb-1">{road.name}</h4>
                        <p className="text-xs text-slate-600 mb-2">
                          <strong>Reason:</strong> {road.blockageDetails?.reason || road.officialRemarks}
                        </p>
                        <div className="text-[11px] text-slate-500 border-t pt-1">
                          Agency: {road.blockageDetails?.clearingAgency || 'BRO / PWD'}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Sensor Node Markers for this Road */}
                {road.sensorNodes && road.sensorNodes.map((node) => {
                  const nodeRisk = road.riskStatus;
                  const nodeStatus = node.status === 'OFFLINE' ? 'OFFLINE' : nodeRisk;

                  return (
                    <Marker
                      key={node._id || node.nodeId}
                      position={[node.location.latitude, node.location.longitude]}
                      icon={createNodeIcon(nodeStatus)}
                      eventHandlers={{
                        click: () => {
                          if (onSelectRoad) onSelectRoad(road);
                        }
                      }}
                    >
                      <Popup>
                        <div className="p-1 min-w-[240px] text-xs">
                          <div className="flex items-center justify-between border-b pb-1 mb-2">
                            <span className="font-mono font-bold text-slate-800">{node.nodeId}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              node.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {node.status}
                            </span>
                          </div>

                          <h4 className="font-semibold text-slate-800 text-sm mb-1">{node.name}</h4>
                          <p className="text-slate-500 mb-2">{road.name}</p>

                          <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded border mb-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Landslide Risk</span>
                              <strong className={
                                road.riskStatus === 'RED' ? 'text-red-600' : road.riskStatus === 'YELLOW' ? 'text-amber-600' : 'text-emerald-600'
                              }>
                                {road.currentRiskScore}/100 ({road.riskStatus})
                              </strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Passability</span>
                              <strong className="text-slate-800">{road.passability}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Battery</span>
                              <span className="text-slate-700">{node.batteryLevel}%</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Elevation</span>
                              <span className="text-slate-700">{node.location.elevation}m</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 italic mb-2">
                            "{road.riskReason}"
                          </p>

                          <div className="flex justify-between items-center text-[10px] text-slate-400 border-t pt-1">
                            <span>Last seen: {new Date(node.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {onSelectRoad && (
                              <button
                                onClick={() => onSelectRoad(road)}
                                className="text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
                              >
                                View telemetry <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend Overlay */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-700">Risk Color Codes:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-600 font-medium">GREEN (Safe)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
            <span className="text-slate-600 font-medium">YELLOW (Landslide Risk)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 inline-block" />
            <span className="text-slate-600 font-medium">RED (Critical Risk)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-red-700 text-white text-[10px] flex items-center justify-center font-bold">⛔</span>
            <span className="text-slate-900 font-bold">Confirmed Road Blockage</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <Radio className="w-3.5 h-3.5 text-emerald-600" />
          Click any road or node marker for real-time telemetry details
        </div>
      </div>
    </div>
  );
};
