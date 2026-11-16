import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mountain,
  AlertTriangle,
  Camera,
  Cpu,
  User,
  LogOut,
  Menu,
  X,
  Activity,
  AlertOctagon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  onOpenReportModal: () => void;
  onOpenSos?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReportModal, onOpenSos }) => {
  const { user, isAuthenticated, logout, isOfficialOrAdmin } = useAuth();
  const { isConnected } = useSocketContext();
  const { isOnline } = useOffline();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `px-2 xl:px-2.5 py-1.5 rounded-md text-[13px] font-medium transition whitespace-nowrap ${
      isActive(path) ? 'bg-[#1b4e38] text-white' : 'text-slate-200 hover:text-white hover:bg-[#164330]'
    }`;

  return (
    <nav className="bg-[#123B2A] text-white sticky top-0 z-40 shadow-md border-b border-[#1b4e38]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#16A36A] flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-mono">
                  HILL<span className="text-[#16A36A]">GUARD</span>
                </span>
                <span className="hidden lg:inline-block text-[9px] font-bold bg-[#16A36A]/30 text-emerald-300 border border-[#16A36A]/50 px-1 py-0.5 rounded uppercase tracking-wider">
                  IoT Pilot
                </span>
              </div>
              <p className="text-[9px] text-emerald-300/80 -mt-0.5 hidden lg:block">
                {t('nav.brandSubtitle')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1">
            <Link to="/" className={navLinkClass('/')}>
              {t('nav.home')}
            </Link>

            <Link to="/live-monitoring" className={`${navLinkClass('/live-monitoring')} flex items-center gap-1`}>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              {t('nav.liveMap')}
            </Link>

            <Link to="/dashboard/traveller" className={navLinkClass('/dashboard/traveller')}>
              {t('nav.travellerHub')}
            </Link>

            <Link to="/dashboard/official" className={navLinkClass('/dashboard/official')}>
              {t('nav.officialControl')}
            </Link>

            <Link
              to="/simulator"
              className={`px-2 xl:px-2.5 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-1 transition whitespace-nowrap ${
                isActive('/simulator')
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-800/40 text-emerald-300 hover:bg-emerald-800/70 border border-emerald-600/30'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              {t('nav.simulator')}
            </Link>

            <Link to="/alerts" className={`${navLinkClass('/alerts')} flex items-center gap-1`}>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              {t('nav.alerts')}
            </Link>

            <Link to="/docs" className={navLinkClass('/docs')}>
              {t('nav.docs')}
            </Link>
          </div>

          {/* Action CTAs, Language Switcher, SOS & User Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Selector */}
            <LanguageSelector compact={true} />

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenSos}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm transition transform active:scale-95 whitespace-nowrap animate-pulse border border-red-500/50"
              title="Emergency SOS & Helplines (1070 / 112)"
            >
              <AlertOctagon className="w-3.5 h-3.5 text-white" />
              <span>SOS</span>
            </button>

            {/* Report CTA */}
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition transform active:scale-95 whitespace-nowrap"
              title="Capture Live Camera Snapshot and GPS"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('nav.report')}</span>
            </button>

            {/* Socket & Network Status Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 rounded bg-[#0b251a] border border-emerald-900 text-[10px]">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline && isConnected ? 'bg-emerald-400 radar-pulse-green' : 'bg-red-500'
                }`}
              />
              <span className="text-slate-300 whitespace-nowrap">
                {!isOnline ? t('nav.offline') : isConnected ? t('nav.liveTelemetry') : t('nav.connecting')}
              </span>
            </div>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1b4e38] hover:bg-[#235e45] text-xs font-medium transition"
                >
                  <User className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="max-w-[70px] truncate hidden sm:inline">{user?.name}</span>
                  <span className="text-[9px] uppercase font-bold text-emerald-300 bg-emerald-900/60 px-1 rounded">
                    {user?.role}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-1.5 rounded hover:bg-red-900/40 text-slate-300 hover:text-red-300 transition"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-200 hover:text-white hover:bg-[#1b4e38] transition"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block px-2.5 py-1.5 rounded-md text-xs font-medium bg-[#16A36A] hover:bg-emerald-700 text-white transition"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-slate-200 hover:text-white hover:bg-[#1b4e38]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0d2c1f] border-b border-[#1b4e38] px-4 pt-2 pb-4 space-y-1">
          <div className="pb-2 pt-1 border-b border-emerald-900/60 mb-2 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">{t('nav.language')}:</span>
            <LanguageSelector compact={false} />
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSos?.();
            }}
            className="w-full text-left px-3 py-2.5 rounded-md text-xs font-extrabold bg-red-700 text-white flex items-center justify-between shadow-xs mb-2"
          >
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 animate-pulse" />
              <span>EMERGENCY SOS & HELPLINES</span>
            </div>
            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">1070 / 112</span>
          </button>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/live-monitoring"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            {t('nav.liveMap')}
          </Link>
          <Link
            to="/dashboard/traveller"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            {t('nav.travellerHub')}
          </Link>
          <Link
            to="/dashboard/official"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            {t('nav.officialControl')}
          </Link>
          <Link
            to="/simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-emerald-400 bg-emerald-950/60"
          >
            {t('nav.simulator')}
          </Link>
          <Link
            to="/alerts"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            {t('nav.alerts')}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            {t('nav.about')}
          </Link>
          <Link
            to="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            {t('nav.docs')}
          </Link>
        </div>
      )}
    </nav>
  );
};
