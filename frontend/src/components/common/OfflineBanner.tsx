import React, { useState } from 'react';
import { WifiOff, RefreshCw, AlertCircle, Database, Trash2, X } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline, isSyncing, queuedCount, syncPendingReports, clearQueue, cachedTimestamp } = useOffline();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isOnline && (queuedCount === 0 || isDismissed)) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-slate-950 border-b border-amber-600 px-4 py-2 text-xs sm:text-sm font-medium transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 text-slate-950 animate-pulse shrink-0" />
              <span>
                <strong>Offline Mode Active:</strong> You are currently disconnected from internet. Showing cached road conditions
                {cachedTimestamp ? ` from ${new Date(cachedTimestamp).toLocaleTimeString()}` : ''}.
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-slate-950 shrink-0" />
              <span>
                You have <strong>{queuedCount}</strong> offline report(s) queued in local storage ready to be uploaded.
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {queuedCount > 0 && isOnline && (
            <button
              onClick={() => syncPendingReports()}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-lg text-xs shadow transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : `Sync Reports (${queuedCount})`}
            </button>
          )}

          {queuedCount > 0 && (
            <button
              onClick={() => clearQueue()}
              className="inline-flex items-center gap-1 px-2 py-1 bg-amber-600/40 hover:bg-amber-600/70 text-slate-950 rounded text-xs transition font-semibold"
              title="Clear queued offline reports"
            >
              <Trash2 className="w-3 h-3" />
              Clear
            </button>
          )}

          <span className="text-[11px] bg-amber-600/30 px-2 py-0.5 rounded text-slate-950 flex items-center gap-1 font-mono">
            <Database className="w-3 h-3" /> IndexedDB Active
          </span>

          {isOnline && (
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-950 hover:bg-amber-600/40 rounded transition"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
