import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getQueuedReports, removeQueuedReport } from '../services/offlineDb';
import api from '../services/api';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  queuedCount: number;
  syncPendingReports: () => Promise<void>;
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
  }, []);

  const syncPendingReports = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    const queue = await getQueuedReports();
    if (queue.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;

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
      } catch (err) {
        console.warn(`[Sync] Failed to sync report ${report.id}:`, err);
      }
    }

    setIsSyncing(false);
    await checkQueueCount();

    if (successCount > 0) {
      toast.success(`Online sync: Successfully uploaded ${successCount} queued road reports!`, { duration: 5000 });
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
    checkQueueCount();

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
