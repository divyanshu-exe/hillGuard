import React from 'react';
import {
  X,
  MapPin,
  Compass,
  Droplets,
  TrendingUp,
  CloudRain,
  Activity,
  AlertTriangle,
  Ban,
  Clock,
  Shield,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Road, Telemetry } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface RoadDetailsModalProps {
  road: Road | null;
  onClose: () => void;
  onOpenReportModal?: (road: Road) => void;
}

export const RoadDetailsModal: React.FC<RoadDetailsModalProps> = ({
  road,
  onClose,
  onOpenReportModal
}) => {
  if (!road) return null;

  const isBlocked = road.passability === 'BLOCKED' || road.isBlockageConfirmed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className={`p-4 text-white flex items-center justify-between ${
          isBlocked
            ? 'bg-red-700'
            : road.riskStatus === 'RED'
            ? 'bg-rose-900'
            : road.riskStatus === 'YELLOW'
            ? 'bg-amber-800'
            : 'bg-[#123B2A]'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/30 text-white">
                {road.roadCode}
              </span>
              <span className="text-xs text-white/80">District: {road.district}</span>
            </div>
            <h3 className="font-bold text-lg leading-tight">{road.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-black/20 text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Status Indicators Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Landslide Risk (IoT Assessed)
              </span>
              <div className="flex items-center gap-2">
                <StatusBadge type="risk" value={road.riskStatus} size="md" />
                <span className="font-bold text-slate-800">{road.currentRiskScore} / 100</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 italic">"{road.riskReason}"</p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Physical Road Passability
              </span>
              <StatusBadge type="passability" value={road.passability} size="md" />
              <p className="text-[11px] text-slate-500 mt-1">
                {isBlocked ? (
                  <span className="text-red-600 font-semibold">
                    {road.blockageDetails?.reason || 'Clearance operations underway.'}
                  </span>
                ) : (
                  road.officialRemarks
                )}
              </p>
            </div>
          </div>

          {/* Key Route Coordinates & Stations */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              Route Geography & Node Deployment
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded border">
                <span className="text-[10px] text-slate-400 block">Origin</span>
                <span className="font-medium text-slate-800">{road.startPoint.name}</span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  {road.startPoint.latitude.toFixed(4)}° N, {road.startPoint.longitude.toFixed(4)}° E
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded border">
                <span className="text-[10px] text-slate-400 block">Destination</span>
                <span className="font-medium text-slate-800">{road.endPoint.name}</span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {road.endPoint.latitude.toFixed(4)}° N, {road.endPoint.longitude.toFixed(4)}° E
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <span>Total Stretch: <strong>{road.totalDistanceKm} km</strong></span>
              <span>Monitored Nodes: <strong>{road.sensorNodes?.length || 1} Station(s)</strong></span>
            </div>
          </div>

          {/* Associated Monitoring Nodes */}
          {road.sensorNodes && road.sensorNodes.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                Deployed Field Node Telemetry
              </h4>
              <div className="space-y-2">
                {road.sensorNodes.map((node) => (
                  <div key={node._id || node.nodeId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">
                          {node.nodeId}
                        </span>
                        <span className="font-semibold text-slate-800 text-xs">{node.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Elevation: {node.location?.elevation || 450}m • Landmark: {node.location?.landmark || 'Ridge Point'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Battery</span>
                        <span className="font-bold text-emerald-700">{node.batteryLevel}%</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        node.status === 'ONLINE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {node.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Directive / Clearance Agency if Blocked */}
          {isBlocked && road.blockageDetails && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 space-y-1">
              <strong className="block text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Ban className="w-4 h-4 text-red-600" /> Official Blockage Advisory
              </strong>
              <p className="text-xs leading-relaxed">{road.blockageDetails.reason}</p>
              <div className="text-[11px] text-red-700 flex justify-between pt-1 border-t border-red-200">
                <span>Clearing Agency: <strong>{road.blockageDetails.clearingAgency}</strong></span>
                {road.blockageDetails.estimatedReopeningTime && (
                  <span>
                    Est. Reopening: {new Date(road.blockageDetails.estimatedReopeningTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Last updated: {new Date(road.lastStatusUpdate).toLocaleTimeString()}
          </span>

          <div className="flex items-center gap-2">
            {onOpenReportModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReportModal(road);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
              >
                Report Blockage Here
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
