import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getQueuedReports, removeQueuedReport, clearAllQueuedReports } from '../services/offlineDb';
import api from '../services/api';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  queuedCount: number;
  syncPendingReports: () => Promise<void>;
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

  const checkQueueCount = useCallback(async () => {
    const queue = await getQueuedReports();
    setQueuedCount(queue.length);
    return queue.length;
  }, []);

  const clearQueue = useCallback(async () => {
    await clearAllQueuedReports();
    await checkQueueCount();
    toast.success('Cleared local offline reports queue.');
  }, [checkQueueCount]);

  const syncPendingReports = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    const queue = await getQueuedReports();
    if (queue.length === 0) {
      setQueuedCount(0);
      return;
    }

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
        // If server returned 400 (e.g. missing photo or unrecoverable bad data), remove from queue so it doesn't get stuck
        if (err?.response?.status === 400) {
          console.warn(`[Sync] Removing unrecoverable report ${report.id} from queue`);
          await removeQueuedReport(report.id);
        }
      }
    }

    setIsSyncing(false);
    await checkQueueCount();

    if (successCount > 0) {
      toast.success(`Online sync: Successfully uploaded ${successCount} queued road reports!`, { duration: 5000 });
    } else if (failedCount > 0 && successCount === 0) {
      toast.error('Sync failed: Could not connect to reporting server. Will retry when connection stabilizes.');
    }
  }, [isSyncing, checkQueueCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet connection restored. Synchronizing data...', { icon: '🌐' });
      syncPendingReports();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Network disconnected. HillGuard switched to Offline PWA Mode.', { icon: '📡' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check & auto-sync if already online
    checkQueueCount().then((count) => {
      if (navigator.onLine && count > 0) {
        syncPendingReports();
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingReports, checkQueueCount]);

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
