import React from 'react';
import { WifiOff, RefreshCw, AlertCircle, Database } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, isSyncing, queuedCount, syncPendingReports, cachedTimestamp } = useOffline();

  if (isOnline && queuedCount === 0) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-slate-900 border-b border-amber-600 px-4 py-2.5 text-sm font-medium transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-5 h-5 text-slate-950 animate-pulse" />
              <span>
                <strong>Offline Mode Active:</strong> You are currently disconnected. Showing cached road conditions
                {cachedTimestamp ? ` from ${new Date(cachedTimestamp).toLocaleTimeString()}` : ''}.
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-slate-950" />
              <span>You have <strong>{queuedCount}</strong> offline report(s) waiting to be uploaded.</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {queuedCount > 0 && (
            <button
              onClick={() => syncPendingReports()}
              disabled={isSyncing || !isOnline}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded text-xs hover:bg-slate-800 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : `Sync Reports (${queuedCount})`}
            </button>
          )}
          <span className="text-xs bg-amber-600/30 px-2 py-0.5 rounded text-slate-950 flex items-center gap-1">
            <Database className="w-3 h-3" /> IndexedDB Active
          </span>
        </div>
      </div>
    </div>
  );
};
