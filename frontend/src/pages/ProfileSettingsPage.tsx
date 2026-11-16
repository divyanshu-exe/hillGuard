import React, { useState } from 'react';
import {
  User,
  Shield,
  Bell,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Wifi,
  Smartphone,
  Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useOffline } from '../context/OfflineContext';
import api from '../services/api';

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateUser, isAuthenticated } = useAuth();
  const { isOnline, queuedCount, syncPendingReports, cachedTimestamp } = useOffline();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emailAlerts, setEmailAlerts] = useState(user?.preferences?.emailAlerts ?? true);
  const [soundAlerts, setSoundAlerts] = useState(user?.preferences?.soundAlerts ?? true);
  const [criticalOnly, setCriticalOnly] = useState(user?.preferences?.criticalOnly ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to save settings.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        name,
        phone,
        preferences: {
          emailAlerts,
          soundAlerts,
          criticalOnly
        }
      });
      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile settings updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear the offline IndexedDB cache?')) {
      indexedDB.deleteDatabase('hillguard_offline_db');
      toast.success('Offline cache cleared. It will repopulate on your next online query.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <User className="w-7 h-7 text-emerald-600" />
          Profile & Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Manage your account credentials, emergency notification preferences, and offline PWA data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (1 Col): Account Overview */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-2xl flex items-center justify-center mx-auto shadow-inner">
            {user ? user.name.charAt(0) : 'G'}
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base">{user?.name || 'Guest Commuter'}</h3>
            <p className="text-xs text-slate-500">{user?.email || 'Not authenticated'}</p>
            <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              {user?.role || 'traveller'}
            </span>
          </div>

          {user?.department && (
            <div className="p-3 bg-slate-50 rounded-xl border text-xs text-slate-600 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Department</span>
              <p className="font-medium text-slate-800">{user.department}</p>
              {user.badgeNumber && (
                <p className="text-[11px] font-mono text-emerald-700">Badge: {user.badgeNumber}</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column (2 Cols): Form Settings & Offline Diagnostics */}
        <div className="md:col-span-2 space-y-6">
          {/* User Settings Form */}
          <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isAuthenticated}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isAuthenticated}
                  placeholder="+91 94022 ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* Notification Preferences */}
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b pb-2 pt-2 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Alert Subscriptions
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border cursor-pointer hover:bg-slate-100/70 transition">
                <div>
                  <span className="font-bold text-slate-800 block">Critical Sound Alarms</span>
                  <span className="text-slate-500">Play auditory horn sound when a high-priority rockfall occurs</span>
                </div>
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border cursor-pointer hover:bg-slate-100/70 transition">
                <div>
                  <span className="font-bold text-slate-800 block">Filter Warnings (Critical Only)</span>
                  <span className="text-slate-500">Only receive push updates for RED critical risks and road closures</span>
                </div>
                <input
                  type="checkbox"
                  checked={criticalOnly}
                  onChange={(e) => setCriticalOnly(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600"
                />
              </label>
            </div>

            {isAuthenticated && (
              <div className="pt-2 text-right">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition ml-auto disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            )}
          </form>

          {/* PWA Offline & IndexedDB Diagnostics Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-600" />
              Progressive Web App (PWA) Offline Storage Diagnostics
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="text-slate-400 block text-[10px]">Network Connectivity</span>
                <span className={`font-bold text-sm ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isOnline ? 'ONLINE (Broadband / Mobile Data)' : 'OFFLINE (PWA Cache Active)'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border">
                <span className="text-slate-400 block text-[10px]">Queued Offline Reports</span>
                <span className="font-bold text-slate-800 text-sm">{queuedCount} waiting for sync</span>
              </div>

              <div className="col-span-1 sm:col-span-2 p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[10px]">Cached Highway Snapshot</span>
                  <span className="font-medium text-slate-700">
                    {cachedTimestamp ? new Date(cachedTimestamp).toLocaleString() : 'Live Cache Sync'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => syncPendingReports()}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <RefreshCw className="w-3 h-3" /> Sync Now
                  </button>
                  <button
                    onClick={handleClearCache}
                    className="px-3 py-1 bg-slate-200 hover:bg-red-100 hover:text-red-700 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Cache
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
