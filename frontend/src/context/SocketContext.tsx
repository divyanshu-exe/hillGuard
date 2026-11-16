import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { getSocket } from '../services/socket';
import { Alert, Telemetry, Road } from '../types';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  latestTelemetry: { telemetry: Telemetry; road: Partial<Road> } | null;
  latestAlert: Alert | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [latestTelemetry, setLatestTelemetry] = useState<{ telemetry: Telemetry; road: Partial<Road> } | null>(null);
  const [latestAlert, setLatestAlert] = useState<Alert | null>(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    s.on('telemetry_update', (data) => {
      setLatestTelemetry(data);
    });

    s.on('new_alert', (alert: Alert) => {
      setLatestAlert(alert);
      if (alert.severity === 'CRITICAL') {
        toast.error(`CRITICAL ALERT: ${alert.title}\n${alert.message}`, { duration: 6000 });
      } else {
        toast((t) => (
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-bold">⚠️ WARNING</span>
            <span>{alert.title}</span>
          </div>
        ), { duration: 4000 });
      }
    });

    s.on('road_blocked_alert', (alert: Alert) => {
      setLatestAlert(alert);
      toast.error(`⛔ ROAD BLOCKED: ${alert.title}\n${alert.message}`, { duration: 8000 });
    });

    s.on('road_status_changed', (data) => {
      toast.success(`Road ${data.roadCode} status updated to: ${data.passability}`);
    });

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('telemetry_update');
      s.off('new_alert');
      s.off('road_blocked_alert');
      s.off('road_status_changed');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, latestTelemetry, latestAlert }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
