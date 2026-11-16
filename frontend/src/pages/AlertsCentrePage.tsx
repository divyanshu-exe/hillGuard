import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  Ban,
  Info,
  CheckCircle2,
  Clock,
  MapPin,
  Filter,
  Check,
  Radio,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Alert, AlertCategory } from '../types';

export const AlertsCentrePage: React.FC = () => {
  const { isOfficialOrAdmin } = useAuth();
  const { socket } = useSocketContext();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/alerts');
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.warn('[Alerts] Could not load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Listen for real-time new alert events
  useEffect(() => {
    if (!socket) return;

    const handleNewAlert = (newAlert: Alert) => {
      setAlerts((prev) => [newAlert, ...prev]);
    };

    const handleAlertResolved = (data: any) => {
      setAlerts((prev) =>
        prev.map((a) => (a._id === data.alertId ? { ...a, status: 'RESOLVED', resolvedAt: data.resolvedAt } : a))
      );
    };

    socket.on('new_alert', handleNewAlert);
    socket.on('road_blocked_alert', handleNewAlert);
    socket.on('alert_resolved', handleAlertResolved);

    return () => {
      socket.off('new_alert', handleNewAlert);
      socket.off('road_blocked_alert', handleNewAlert);
      socket.off('alert_resolved', handleAlertResolved);
    };
  }, [socket]);

  // Handle Official Alert Resolution
  const handleResolveAlert = async (alertId: string) => {
    try {
      const res = await api.patch(`/alerts/${alertId}/resolve`);
      if (res.data.success) {
        toast.success('Alert marked as resolved.');
        setAlerts((prev) =>
          prev.map((a) => (a._id === alertId ? { ...a, status: 'RESOLVED' } : a))
        );
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to resolve alert.');
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchesCat = filterCategory === 'ALL' || a.category === filterCategory;
    const matchesStat = filterStatus === 'ALL' || a.status === filterStatus;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.roadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesStat && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
            Alerts & Emergency Notification Centre
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time geotechnical warnings, road blockages, and highway closures across Arunachal Pradesh.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-100 p-1.5 rounded-xl border">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="text-slate-700 font-medium">Socket.IO Live Stream Active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search alerts by road, location, or cause..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterStatus('ACTIVE')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterStatus === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Active ({alerts.filter((a) => a.status === 'ACTIVE').length})
            </button>
            <button
              onClick={() => setFilterStatus('RESOLVED')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterStatus === 'RESOLVED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Resolved
            </button>
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1 rounded font-semibold transition ${
                filterStatus === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="ROAD_BLOCKED">Road Blocked</option>
            <option value="CRITICAL">Critical Landslide</option>
            <option value="WARNING">Landslide Warning</option>
            <option value="INFO">Information</option>
          </select>
        </div>
      </div>

      {/* Alerts Chronological Feed */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isBlocked = alert.category === 'ROAD_BLOCKED';
          const isCritical = alert.severity === 'CRITICAL' || alert.category === 'CRITICAL';

          return (
            <div
              key={alert._id}
              className={`p-4 sm:p-5 rounded-2xl border transition shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isBlocked
                  ? 'bg-red-50/70 border-red-300'
                  : isCritical
                  ? 'bg-rose-50/60 border-rose-300'
                  : alert.status === 'RESOLVED'
                  ? 'bg-slate-50 border-slate-200 opacity-75'
                  : 'bg-amber-50/60 border-amber-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                    isBlocked
                      ? 'bg-red-600 text-white'
                      : isCritical
                      ? 'bg-rose-600 text-white'
                      : alert.status === 'RESOLVED'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {isBlocked ? (
                    <Ban className="w-5 h-5" />
                  ) : alert.status === 'RESOLVED' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-black/10 px-1.5 py-0.2 rounded">
                      {alert.alertCode}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {alert.roadName}
                    </span>
                    {alert.nodeId && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Node: {alert.nodeId}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{alert.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
                    {alert.message}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(alert.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })},{' '}
                      {new Date(alert.issuedAt).toLocaleDateString()}
                    </span>
                    <span>Cause: <strong>{alert.cause}</strong></span>
                    {alert.resolvedAt && (
                      <span className="text-emerald-700 font-medium">
                        Resolved at: {new Date(alert.resolvedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-200">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    alert.status === 'ACTIVE'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {alert.status}
                </span>

                {isOfficialOrAdmin && alert.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleResolveAlert(alert._id)}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow transition"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Active Alerts Found</h4>
            <p className="text-xs">All monitored Arunachal corridors are currently reporting normal or resolved statuses.</p>
          </div>
        )}
      </div>
    </div>
  );
};
