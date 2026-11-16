import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { getQueuedReports, removeQueuedReport, clearAllQueuedReports } from '../services/offlineDb';
import api from '../services/api';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  queuedCount: number;
  syncPendingReports: (isManual?: boolean) => Promise<void>;
  clearQueue: () => Promise<void>;
  cachedTimestamp: string | null;
  setCachedTimestamp: (ts: string | null) => void;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [queuedCount, setQueuedCount] = useState<number>(0);
  const [cachedTimestamp, setCachedTimestamp] = useState<string | null>(null);

  const isSyncingRef = useRef<boolean>(false);

  const checkQueueCount = useCallback(async () => {
    try {
      const queue = await getQueuedReports();
      setQueuedCount(queue.length);
      return queue.length;
    } catch {
      return 0;
    }
  }, []);

  const clearQueue = useCallback(async () => {
    await clearAllQueuedReports();
    await checkQueueCount();
    toast.success('Cleared local offline reports queue.', { id: 'offline-sync' });
  }, [checkQueueCount]);

  const syncPendingReports = useCallback(async (isManual = false) => {
    if (!navigator.onLine || isSyncingRef.current) return;

    const queue = await getQueuedReports();
    if (queue.length === 0) {
      setQueuedCount(0);
      return;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);
    let successCount = 0;
    let failedCount = 0;

    for (const report of queue) {
      try {
        await api.post('/reports', {
          roadId: report.roadId,
          roadName: report.roadName,
          incidentType: report.incidentType,
          description: report.description,
          latitude: report.latitude,
          longitude: report.longitude,
          accuracy: report.accuracy,
          imageBase64: report.imageBase64,
          reporterName: report.reporterName,
          reporterPhone: report.reporterPhone,
          capturedViaLiveCamera: report.capturedViaLiveCamera
        });
        await removeQueuedReport(report.id);
        successCount++;
      } catch (err: any) {
        failedCount++;
        console.warn(`[Sync] Failed to sync report ${report.id}:`, err);
        // If server rejected with 400 or report is permanently invalid, delete it so it never loops
        if (err?.response?.status === 400) {
          console.warn(`[Sync] Dropping invalid queued report ${report.id}`);
          await removeQueuedReport(report.id);
        }
      }
    }

    isSyncingRef.current = false;
    setIsSyncing(false);
    await checkQueueCount();

    if (successCount > 0) {
      toast.success(`Online sync: Successfully uploaded ${successCount} queued report(s)!`, {
        id: 'offline-sync',
        duration: 4000
      });
    } else if (failedCount > 0 && isManual) {
      // ONLY show error toast if user clicked manually, and use single toast id
      toast.error('Sync failed: Could not connect to reporting server.', {
        id: 'offline-sync',
        duration: 4000
      });
    }
  }, [checkQueueCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet connection restored.', { id: 'network-status', duration: 3000 });
      syncPendingReports(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Switched to Offline Mode.', { id: 'network-status', duration: 3000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount once only
    checkQueueCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Run ONCE on mount - prevents infinite re-render loops!

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        queuedCount,
        syncPendingReports,
        clearQueue,
        cachedTimestamp,
        setCachedTimestamp
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
