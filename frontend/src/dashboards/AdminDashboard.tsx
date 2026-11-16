import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  UserPlus,
  Sliders,
  History,
  CheckCircle2,
  XCircle,
  Save,
  Search,
  Lock,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { User, AuditLog } from '../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'provision' | 'logs' | 'settings'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // User Provisioning State
  const [provName, setProvName] = useState('');
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provRole, setProvRole] = useState<'official' | 'admin'>('official');
  const [provDept, setProvDept] = useState('Border Roads Organisation (BRO) - Project Vartak');
  const [provBadge, setProvBadge] = useState('');
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Risk Thresholds & Weights State
  const [soilWeight, setSoilWeight] = useState(0.35);
  const [tiltWeight, setTiltWeight] = useState(0.30);
  const [rainWeight, setRainWeight] = useState(0.25);
  const [vibWeight, setVibWeight] = useState(0.10);
  const [criticalThreshold, setCriticalThreshold] = useState(70);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      if (res.data.success) setUsers(res.data.data);
    } catch (e) {}
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.data.success) setAuditLogs(res.data.data);
    } catch (e) {}
  };

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      if (res.data.success && res.data.data) {
        setSettings(res.data.data);
        if (res.data.data.weights) {
          setSoilWeight(res.data.data.weights.soil);
          setTiltWeight(res.data.data.weights.tilt);
          setRainWeight(res.data.data.weights.rain);
          setVibWeight(res.data.data.weights.vibration);
        }
        if (res.data.data.thresholds) {
          setCriticalThreshold(res.data.data.thresholds.criticalMin);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
    fetchSettings();
  }, []);

  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProvisioning(true);
    try {
      const res = await api.post('/admin/users', {
        name: provName,
        email: provEmail,
        password: provPassword,
        role: provRole,
        department: provDept,
        badgeNumber: provBadge
      });
      if (res.data.success) {
        toast.success(`Account for ${provName} created as ${provRole}!`);
        setProvName('');
        setProvEmail('');
        setProvPassword('');
        setProvBadge('');
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || 'Provisioning failed.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    try {
      const res = await api.put('/admin/settings', {
        weights: {
          soil: soilWeight,
          tilt: tiltWeight,
          rain: rainWeight,
          vibration: vibWeight
        },
        thresholds: {
          safeMax: 29,
          warningMax: criticalThreshold - 1,
          criticalMin: criticalThreshold
        }
      });
      if (res.data.success) {
        toast.success('Risk engine weights and thresholds updated!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Settings update failed.');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Title */}
      <div className="bg-[#123B2A] text-white p-6 sm:p-8 rounded-3xl border border-[#1e523b] shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
            System Administration &amp; Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">HillGuard Admin Suite</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Official provisioning, security audit logs, and geotechnical engine calibration
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow">
          <ShieldAlert className="w-6 h-6" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3 text-xs sm:text-sm">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
            activeTab === 'users' ? 'bg-[#123B2A] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Users Directory
        </button>
        <button
          onClick={() => setActiveTab('provision')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
            activeTab === 'provision' ? 'bg-[#123B2A] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-4 h-4" /> Provision Official
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
            activeTab === 'logs' ? 'bg-[#123B2A] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" /> Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-[#123B2A] text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" /> Risk Engine Settings
        </button>
      </div>

      {/* Tab: Users Directory */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">System Users &amp; Roles</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b">
                  <th className="p-3 font-bold">Name</th>
                  <th className="p-3 font-bold">Email</th>
                  <th className="p-3 font-bold">Role</th>
                  <th className="p-3 font-bold">Department</th>
                  <th className="p-3 font-bold">Badge No</th>
                  <th className="p-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id || u.email}>
                    <td className="p-3 font-bold text-slate-900">{u.name}</td>
                    <td className="p-3 font-mono text-slate-600">{u.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'official'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{u.department || 'Public Traveller'}</td>
                    <td className="p-3 font-mono text-slate-500">{u.badgeNumber || '—'}</td>
                    <td className="p-3">
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Provision Official */}
      {activeTab === 'provision' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Provision New Official or Administrator</h3>
            <p className="text-xs text-slate-500">
              Only administrators can authorize government and Border Roads Organisation (BRO) personnel.
            </p>
          </div>

          <form onSubmit={handleProvisionUser} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={provName}
                  onChange={(e) => setProvName(e.target.value)}
                  placeholder="e.g. Major Vikram Negi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  value={provEmail}
                  onChange={(e) => setProvEmail(e.target.value)}
                  placeholder="official@hillguard.in"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Role Permission</label>
                <select
                  value={provRole}
                  onChange={(e) => setProvRole(e.target.value as 'official' | 'admin')}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold outline-none cursor-pointer"
                >
                  <option value="official">Official (Highway Operator / BRO)</option>
                  <option value="admin">Administrator (System Supervisor)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Default Password</label>
                <input
                  type="password"
                  value={provPassword}
                  onChange={(e) => setProvPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Agency / Department</label>
                <input
                  type="text"
                  value={provDept}
                  onChange={(e) => setProvDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Badge / Service Number</label>
                <input
                  type="text"
                  value={provBadge}
                  onChange={(e) => setProvBadge(e.target.value)}
                  placeholder="BRO-VRTK-904"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="submit"
                disabled={isProvisioning}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 ml-auto shadow"
              >
                <UserPlus className="w-4 h-4" />
                {isProvisioning ? 'Provisioning...' : 'Provision Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Security &amp; Operational Audit Trail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b">
                  <th className="p-3 font-bold">Action</th>
                  <th className="p-3 font-bold">User</th>
                  <th className="p-3 font-bold">Target</th>
                  <th className="p-3 font-bold">IP Address</th>
                  <th className="p-3 font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="p-3 font-bold text-slate-800">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.userName} ({log.userRole})</td>
                    <td className="p-3 text-emerald-700">{log.targetEntity} #{log.targetId.slice(-6)}</td>
                    <td className="p-3 text-slate-500">{log.ipAddress}</td>
                    <td className="p-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Risk Engine Settings */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 max-w-2xl text-xs">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Risk Engine Weights Calibration</h3>
            <p className="text-slate-500">Adjust the relative weighting of environmental parameters in the formula.</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Soil Moisture Weight (S)</span>
                <span>{(soilWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.60"
                step="0.05"
                value={soilWeight}
                onChange={(e) => setSoilWeight(parseFloat(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Slope Tilt Weight (T)</span>
                <span>{(tiltWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.60"
                step="0.05"
                value={tiltWeight}
                onChange={(e) => setTiltWeight(parseFloat(e.target.value))}
                className="w-full accent-amber-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Rainfall Intensity Weight (W)</span>
                <span>{(rainWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.50"
                step="0.05"
                value={rainWeight}
                onChange={(e) => setRainWeight(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Vibration Intensity Weight (V)</span>
                <span>{(vibWeight * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={vibWeight}
                onChange={(e) => setVibWeight(parseFloat(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between font-semibold mb-1">
                <span>Critical Red Risk Score Threshold</span>
                <span className="font-bold text-red-600">{criticalThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                step="1"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-red-600"
              />
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="submit"
              disabled={isUpdatingSettings}
              className="px-5 py-2.5 bg-[#123B2A] hover:bg-[#1a4a36] text-white rounded-xl font-bold flex items-center gap-1.5 ml-auto shadow"
            >
              <Save className="w-4 h-4" />
              {isUpdatingSettings ? 'Updating...' : 'Save Engine Calibration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
