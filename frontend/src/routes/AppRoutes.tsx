import React from 'react';
import { Routes, Route, Navigate, useOutletContext } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LandingPage } from '../pages/LandingPage';
import { AboutPage } from '../pages/AboutPage';
import { HowItWorksPage } from '../pages/HowItWorksPage';
import { LiveMonitoringPage } from '../pages/LiveMonitoringPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { HardwareSimulatorPage } from '../pages/HardwareSimulatorPage';
import { AlertsCentrePage } from '../pages/AlertsCentrePage';
import { CitizenReportingPage } from '../pages/CitizenReportingPage';
import { ProfileSettingsPage } from '../pages/ProfileSettingsPage';
import { DocumentationPage } from '../pages/DocumentationPage';
import { TravellerDashboard } from '../dashboards/TravellerDashboard';
import { OfficialDashboard } from '../dashboards/OfficialDashboard';
import { AdminDashboard } from '../dashboards/AdminDashboard';
import { useAuth } from '../context/AuthContext';

// Helper wrapper to pass modal opener down to pages
const LandingPageWrapper: React.FC = () => {
  const { onOpenReportModal } = useOutletContext<{ onOpenReportModal: () => void }>();
  return <LandingPage onOpenReportModal={onOpenReportModal} />;
};

const LiveMonitoringWrapper: React.FC = () => {
  const { onOpenReportModal } = useOutletContext<{ onOpenReportModal: () => void }>();
  return <LiveMonitoringPage onOpenReportModal={onOpenReportModal} />;
};

const CitizenReportingWrapper: React.FC = () => {
  const { onOpenReportModal } = useOutletContext<{ onOpenReportModal: () => void }>();
  return <CitizenReportingPage onOpenReportModal={onOpenReportModal} />;
};

const TravellerDashboardWrapper: React.FC = () => {
  const { onOpenReportModal } = useOutletContext<{ onOpenReportModal: () => void }>();
  return <TravellerDashboard onOpenReportModal={onOpenReportModal} />;
};

// Protected Route Guard
const ProtectedOfficialRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs text-slate-500">Checking authorization...</div>;
  if (!user || (user.role !== 'official' && user.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-xs text-slate-500">Checking authorization...</div>;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/live-monitoring" element={<LiveMonitoringWrapper />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/simulator" element={<HardwareSimulatorPage />} />
        <Route path="/alerts" element={<AlertsCentrePage />} />
        <Route path="/reporting" element={<CitizenReportingWrapper />} />
        <Route path="/profile" element={<ProfileSettingsPage />} />
        <Route path="/docs" element={<DocumentationPage />} />

        {/* Dashboards */}
        <Route path="/dashboard/traveller" element={<TravellerDashboardWrapper />} />
        <Route
          path="/dashboard/official"
          element={
            <ProtectedOfficialRoute>
              <OfficialDashboard />
            </ProtectedOfficialRoute>
          }
        />
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
