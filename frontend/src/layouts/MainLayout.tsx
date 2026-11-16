import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { CitizenReportModal } from '../components/reporting/CitizenReportModal';
import api from '../services/api';
import { Road } from '../types';

export const MainLayout: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
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
      <Navbar onOpenReportModal={() => setIsReportModalOpen(true)} />

      <main className="flex-1">
        <Outlet context={{ onOpenReportModal: () => setIsReportModalOpen(true) }} />
      </main>

      <Footer />

      {/* Globally mounted live camera citizen reporting modal */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        roads={roads}
      />
    </div>
  );
};
