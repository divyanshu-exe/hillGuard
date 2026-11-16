import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AlertOctagon, PhoneCall } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { CitizenReportModal } from '../components/reporting/CitizenReportModal';
import { EmergencySOSDrawer } from '../components/common/EmergencySOSDrawer';
import api from '../services/api';
import { Road } from '../types';

export const MainLayout: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSosDrawerOpen, setIsSosDrawerOpen] = useState(false);
  const [roads, setRoads] = useState<Road[]>([]);

  useEffect(() => {
    const fetchRoads = async () => {
      try {
        const res = await api.get('/roads');
        if (res.data.success) {
          setRoads(res.data.data);
        }
      } catch (e) {}
    };
    fetchRoads();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8F6]">
      <OfflineBanner />
      <Navbar
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenSos={() => setIsSosDrawerOpen(true)}
      />

      <main className="flex-1">
        <Outlet
          context={{
            onOpenReportModal: () => setIsReportModalOpen(true),
            onOpenSos: () => setIsSosDrawerOpen(true)
          }}
        />
      </main>

      <Footer />

      {/* Floating 24x7 Emergency SOS Trigger Button */}
      <button
        onClick={() => setIsSosDrawerOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-xl shadow-red-900/30 font-extrabold text-xs tracking-wide transition transform hover:scale-105 active:scale-95 border-2 border-white/50 cursor-pointer animate-pulse"
        title="Emergency SOS & 24x7 Disaster Helplines (1070 / 112)"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <AlertOctagon className="w-4 h-4 text-white" />
        <span>SOS 1070 / 112</span>
      </button>

      {/* Globally mounted live camera citizen reporting modal */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        roads={roads}
      />

      {/* Globally mounted Emergency SOS Drawer */}
      <EmergencySOSDrawer
        isOpen={isSosDrawerOpen}
        onClose={() => setIsSosDrawerOpen(false)}
      />
    </div>
  );
};
