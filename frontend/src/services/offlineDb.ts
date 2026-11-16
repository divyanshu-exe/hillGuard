import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Road, Alert } from '../types';

interface QueuedReport {
  id: string;
  roadId?: string;
  roadName: string;
  incidentType: string;
  description: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  imageBase64: string;
  reporterName?: string;
  reporterPhone?: string;
  capturedViaLiveCamera: boolean;
  queuedAt: string;
  syncStatus: 'PENDING' | 'SYNCING' | 'FAILED';
}

interface HillGuardDB extends DBSchema {
  roads: {
    key: string;
    value: { data: Road[]; cachedAt: string };
  };
  alerts: {
    key: string;
    value: { data: Alert[]; cachedAt: string };
  };
  queuedReports: {
    key: string;
    value: QueuedReport;
  };
}

const DB_NAME = 'hillguard_offline_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<HillGuardDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<HillGuardDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('roads')) {
          db.createObjectStore('roads');
        }
        if (!db.objectStoreNames.contains('alerts')) {
          db.createObjectStore('alerts');
        }
        if (!db.objectStoreNames.contains('queuedReports')) {
          db.createObjectStore('queuedReports', { keyPath: 'id' });
        }
      }
    });
  }
  return dbPromise;
};

// Cache roads
export const cacheRoads = async (roads: Road[]) => {
  try {
    const db = await getDB();
    await db.put('roads', { data: roads, cachedAt: new Date().toISOString() }, 'latest');
  } catch (e) {
    console.warn('[Offline DB] Failed to cache roads:', e);
  }
};

// Retrieve cached roads
export const getCachedRoads = async (): Promise<{ data: Road[]; cachedAt: string } | null> => {
  try {
    const db = await getDB();
    const result = await db.get('roads', 'latest');
    return result || null;
  } catch (e) {
    console.warn('[Offline DB] Failed to get cached roads:', e);
    return null;
  }
};

// Cache alerts
export const cacheAlerts = async (alerts: Alert[]) => {
  try {
    const db = await getDB();
    await db.put('alerts', { data: alerts, cachedAt: new Date().toISOString() }, 'latest');
  } catch (e) {
    console.warn('[Offline DB] Failed to cache alerts:', e);
  }
};

// Retrieve cached alerts
export const getCachedAlerts = async (): Promise<{ data: Alert[]; cachedAt: string } | null> => {
  try {
    const db = await getDB();
    const result = await db.get('alerts', 'latest');
    return result || null;
  } catch (e) {
    console.warn('[Offline DB] Failed to get cached alerts:', e);
    return null;
  }
};

// Queue offline report
export const queueOfflineReport = async (reportData: Omit<QueuedReport, 'id' | 'queuedAt' | 'syncStatus'>) => {
  const db = await getDB();
  const queuedItem: QueuedReport = {
    ...reportData,
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    queuedAt: new Date().toISOString(),
    syncStatus: 'PENDING'
  };
  await db.put('queuedReports', queuedItem);
  return queuedItem;
};

// Get all queued reports
export const getQueuedReports = async (): Promise<QueuedReport[]> => {
  try {
    const db = await getDB();
    return await db.getAll('queuedReports');
  } catch (e) {
    return [];
  }
};

// Remove queued report after successful sync
export const removeQueuedReport = async (id: string) => {
  try {
    const db = await getDB();
    await db.delete('queuedReports', id);
  } catch (e) {
    console.warn('[Offline DB] Failed to remove queued report:', e);
  }
};
