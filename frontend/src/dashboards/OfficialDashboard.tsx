import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Cpu,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Camera,
  MapPin,
  Check,
  X,
  RefreshCw,
  Sliders,
  ExternalLink,
  Radio,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { SensorCharts } from '../components/analytics/SensorCharts';
import { Road, SensorNode, Report, Alert, RoadPassability, RiskStatus } from '../types';

export const OfficialDashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocketContext();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedRoadForEdit, setSelectedRoadForEdit] = useState<Road | null>(null);

  // Road status editing state
  const [newPassability, setNewPassability] = useState<RoadPassability>('OPEN');
  const [newRemarks, setNewRemarks] = useState<string>('');
  const [isUpdatingRoad, setIsUpdatingRoad] = useState<boolean>(false);

  // Verification modal state
  const [verifyRemarks, setVerifyRemarks] = useState<string>('');
  const [updateRoadOnVerify, setUpdateRoadOnVerify] = useState<boolean>(false);
  const [verifiedPassability, setVerifiedPassability] = useState<RoadPassability>('BLOCKED');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchOfficialData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/dashboard/official');
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err: any) {
      console.warn('[OfficialDashboard] Error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficialData();
  }, []);

  // Listen to socket events for real-time dashboard updates
  useEffect(() => {
    if (!socket) return;

    const refreshOnEvent = () => {
      fetchOfficialData();
    };

    socket.on('new_citizen_report', refreshOnEvent);
    socket.on('report_status_updated', refreshOnEvent);
    socket.on('road_status_changed', refreshOnEvent);
    socket.on('telemetry_update', refreshOnEvent);

    return () => {
      socket.off('new_citizen_report', refreshOnEvent);
      socket.off('report_status_updated', refreshOnEvent);
      socket.off('road_status_changed', refreshOnEvent);
      socket.off('telemetry_update', refreshOnEvent);
    };
  }, [socket]);

  // Handle Verify or Reject Citizen Report
  const handleVerifyReport = async (status: 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED') => {
    if (!selectedReport) return;
    if (!verifyRemarks.trim()) {
      toast.error('Please enter official remarks before confirming.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await api.patch(`/reports/${selectedReport._id}/verify`, {
        status,
        officialRemarks: verifyRemarks,
        updateRoadStatus: updateRoadOnVerify,
        roadPassability: verifiedPassability
      });

      if (res.data.success) {
        toast.success(`Report ${selectedReport.reportId} marked as ${status}`);
        setSelectedReport(null);
        setVerifyRemarks('');
        fetchOfficialData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Verification action failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle Official Road Status Update
  const handleUpdateRoadStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoadForEdit) return;

    setIsUpdatingRoad(true);
    try {
      const res = await api.patch(`/roads/${selectedRoadForEdit._id}/status`, {
        passability: newPassability,
        officialRemarks: newRemarks || `Highway condition set to ${newPassability} by ${user?.name}.`,
        isBlockageConfirmed: newPassability === 'BLOCKED'
      });

      if (res.data.success) {
        toast.success(`Highway ${selectedRoadForEdit.roadCode} updated to ${newPassability}`);
        setSelectedRoadForEdit(null);
        setNewRemarks('');
        fetchOfficialData();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update road status.');
    } finally {
      setIsUpdatingRoad(false);
    }
  };

  const cards = dashboardData?.cards || {
    totalNodes: 5,
    activeNodes: 5,
    offlineNodes: 0,
    safeSections: 2,
    warningSections: 2,
    criticalSections: 1,
    pendingReportsCount: 1,
    confirmedBlockages: 1
  };

  const roads: Road[] = dashboardData?.roads || [];
  const nodes: SensorNode[] = dashboardData?.nodes || [];
  const pendingReports: Report[] = dashboardData?.pendingReports || [];
  const sensorTrends = dashboardData?.sensorTrends || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-[#123B2A] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#1e523b] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              Control Centre & Emergency Operations Room
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Official Road Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 mt-1">
            Authorized session: <strong className="text-white">{user?.name}</strong> •{' '}
            {user?.department || 'Border Roads Organisation (BRO) / APDMA'}
          </p>
        </div>

        <button
          onClick={fetchOfficialData}
          disabled={isLoading}
          className="px-4 py-2 bg-[#1b4e38] hover:bg-[#25664a] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-emerald-700/50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Live Data
        </button>
      </div>

      {/* 8 Metric Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-400 block text-[10px] font-semibold uppercase">Total Nodes</span>
          <span className="text-xl font-black text-slate-900 mt-0.5 block">{cards.totalNodes}</span>
        </div>
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-emerald-700 block text-[10px] font-semibold uppercase">Active Nodes</span>
          <span className="text-xl font-black text-emerald-700 mt-0.5 block">{cards.activeNodes}</span>
        </div>
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-slate-500 block text-[10px] font-semibold uppercase">Offline Nodes</span>
          <span className="text-xl font-black text-slate-600 mt-0.5 block">{cards.offlineNodes}</span>
        </div>
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-emerald-700 block text-[10px] font-semibold uppercase">Safe Roads</span>
          <span className="text-xl font-black text-emerald-700 mt-0.5 block">{cards.safeSections}</span>
        </div>
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-amber-700 block text-[10px] font-semibold uppercase">Warning Roads</span>
          <span className="text-xl font-black text-amber-600 mt-0.5 block">{cards.warningSections}</span>
        </div>
        <div className="p-3 bg-red-50 rounded-2xl border border-red-200 shadow-xs">
          <span className="text-red-700 block text-[10px] font-semibold uppercase">Critical Risk</span>
          <span className="text-xl font-black text-red-600 mt-0.5 block">{cards.criticalSections}</span>
        </div>
        <div className="p-3 bg-sky-50 rounded-2xl border border-sky-200 shadow-xs">
          <span className="text-sky-700 block text-[10px] font-semibold uppercase">Reports Queue</span>
          <span className="text-xl font-black text-sky-700 mt-0.5 block">{cards.pendingReportsCount}</span>
        </div>
        <div className="p-3 bg-red-900 text-white rounded-2xl shadow-xs">
          <span className="text-red-200 block text-[10px] font-semibold uppercase">Roads Blocked</span>
          <span className="text-xl font-black text-white mt-0.5 block">{cards.confirmedBlockages}</span>
        </div>
      </div>

      {/* Analytics Recharts Section */}
      <SensorCharts data={sensorTrends} />

      {/* Citizen Reports Management Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-red-600" />
              Citizen Road-Blockage Verification Desk
            </h3>
            <p className="text-xs text-slate-500">
              Review live camera snapshots and GPS coordinates before authenticating road closures.
            </p>
          </div>
          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
            {pendingReports.length} Under Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b">
                <th className="p-3 font-bold">Report ID</th>
                <th className="p-3 font-bold">Type</th>
                <th className="p-3 font-bold">Highway</th>
                <th className="p-3 font-bold">GPS Coordinates</th>
                <th className="p-3 font-bold">Description</th>
                <th className="p-3 font-bold">Status</th>
                <th className="p-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingReports.map((report) => (
                <tr key={report._id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono font-bold text-slate-800">{report.reportId}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-50 text-red-700 border border-red-200">
                      {report.incidentType}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-900">{report.roadName}</td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">
                    {report.location.latitude.toFixed(4)}°, {report.location.longitude.toFixed(4)}°
                  </td>
                  <td className="p-3 max-w-xs truncate text-slate-600" title={report.description}>
                    {report.description}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {report.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedReport(report);
                        setVerifyRemarks(`On-site check by ${user?.name} (${user?.department || 'BRO'})`);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      Inspect &amp; Verify
                    </button>
                  </td>
                </tr>
              ))}

              {pendingReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No pending citizen reports waiting for review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monitored Road Passability Management */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-between border-b pb-3">
          <span className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Official Highway Passability Directives
          </span>
          <span className="text-xs text-slate-500 font-normal">{roads.length} Monitored Corridors</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b">
                <th className="p-3 font-bold">Code</th>
                <th className="p-3 font-bold">Highway Section</th>
                <th className="p-3 font-bold">District</th>
                <th className="p-3 font-bold">IoT Risk</th>
                <th className="p-3 font-bold">Passability Status</th>
                <th className="p-3 font-bold">Official Remarks</th>
                <th className="p-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roads.map((road) => (
                <tr key={road._id} className="hover:bg-slate-50/70">
                  <td className="p-3 font-mono font-bold text-slate-800">{road.roadCode}</td>
                  <td className="p-3 font-semibold text-slate-900">{road.name}</td>
                  <td className="p-3 text-slate-600">{road.district}</td>
                  <td className="p-3">
                    <StatusBadge type="risk" value={road.riskStatus} size="sm" />
                  </td>
                  <td className="p-3">
                    <StatusBadge type="passability" value={road.passability} size="sm" />
                  </td>
                  <td className="p-3 text-slate-500 text-[11px] max-w-xs truncate" title={road.officialRemarks}>
                    {road.officialRemarks}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedRoadForEdit(road);
                        setNewPassability(road.passability);
                        setNewRemarks(road.officialRemarks);
                      }}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition shadow-xs"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensor Node Telemetry & Battery Health Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center justify-between border-b pb-3">
          <span className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            Field Sensor Node Connectivity & Diagnostics
          </span>
          <span className="text-xs text-slate-500 font-normal">{nodes.length} Registered Nodes</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <div key={node._id || node.nodeId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border">
                  {node.nodeId}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    node.status === 'ONLINE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {node.status}
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">{node.name}</h4>
              <p className="text-[11px] text-slate-500">
                Landmark: {node.location?.landmark || 'Ridge Site'} • Elevation: {node.location?.elevation || 350}m
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Battery Level</span>
                  <span className="font-bold text-emerald-700">{node.batteryLevel}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Source Model</span>
                  <span className="font-mono text-slate-700">{node.isSimulated ? 'SIMULATOR' : 'ESP32'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal 1: Report Verification Inspection Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Incident Inspection Desk: {selectedReport.reportId}
              </h3>
              <button onClick={() => setSelectedReport(null)} className="p-1 hover:bg-slate-800 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Image Preview */}
              <div className="rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border">
                <img
                  src={selectedReport.imageUrl}
                  alt="Incident Camera Photo"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded text-xs">
                    {selectedReport.incidentType}
                  </span>
                  <h4 className="font-bold text-slate-900">{selectedReport.roadName}</h4>
                </div>
                <p className="text-slate-700 italic">"{selectedReport.description}"</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">GPS Coordinates</span>
                  <span className="font-mono font-medium">
                    {selectedReport.location.latitude.toFixed(4)}° N, {selectedReport.location.longitude.toFixed(4)}° E
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Reporter</span>
                  <span>{selectedReport.reporterName}</span>
                </div>
              </div>

              {/* Official Action Controls */}
              <div className="space-y-3 pt-2 border-t">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Verification Remarks <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={verifyRemarks}
                    onChange={(e) => setVerifyRemarks(e.target.value)}
                    rows={2}
                    placeholder="e.g. BRO Sector patrol physically confirms 20m debris. Clearance bulldozer deployed."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-red-900 text-xs">
                    <input
                      type="checkbox"
                      checked={updateRoadOnVerify}
                      onChange={(e) => setUpdateRoadOnVerify(e.target.checked)}
                      className="w-4 h-4 accent-red-600"
                    />
                    <span>Update Official Highway Passability Based on This Report</span>
                  </label>

                  {updateRoadOnVerify && (
                    <div>
                      <span className="block text-[11px] text-red-800 mb-1">Set Road Passability:</span>
                      <select
                        value={verifiedPassability}
                        onChange={(e) => setVerifiedPassability(e.target.value as RoadPassability)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-red-300 bg-white text-xs font-semibold text-red-900"
                      >
                        <option value="BLOCKED">BLOCKED (Physical Closure)</option>
                        <option value="ONE_WAY_CAUTION">ONE-WAY / CAUTION</option>
                        <option value="RESTRICTED_CONVOY">RESTRICTED CONVOY</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleVerifyReport('REJECTED')}
                    disabled={isVerifying}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold transition"
                  >
                    Reject as Invalid / Fake
                  </button>
                  <button
                    onClick={() => handleVerifyReport('UNDER_REVIEW')}
                    disabled={isVerifying}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold transition"
                  >
                    Mark Under Review
                  </button>
                  <button
                    onClick={() => handleVerifyReport('VERIFIED')}
                    disabled={isVerifying}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow"
                  >
                    Verify Incident
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Highway Passability Directive */}
      {selectedRoadForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Update Status: {selectedRoadForEdit.roadCode}
              </h3>
              <button onClick={() => setSelectedRoadForEdit(null)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateRoadStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Physical Passability</label>
                <select
                  value={newPassability}
                  onChange={(e) => setNewPassability(e.target.value as RoadPassability)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs outline-none"
                >
                  <option value="OPEN">OPEN (Normal Flow)</option>
                  <option value="ONE_WAY_CAUTION">ONE-WAY / CAUTION</option>
                  <option value="RESTRICTED_CONVOY">RESTRICTED CONVOY</option>
                  <option value="BLOCKED">BLOCKED (Full Closure)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Official Directive Remarks</label>
                <textarea
                  value={newRemarks}
                  onChange={(e) => setNewRemarks(e.target.value)}
                  rows={3}
                  placeholder="Official advisory to travellers..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedRoadForEdit(null)}
                  className="px-3.5 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingRoad}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow"
                >
                  {isUpdatingRoad ? 'Updating...' : 'Publish Official Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
