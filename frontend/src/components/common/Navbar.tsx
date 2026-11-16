import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mountain,
  AlertTriangle,
  Camera,
  Cpu,
  Shield,
  User,
  LogOut,
  Menu,
  X,
  Radio,
  FileText,
  Activity,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocketContext } from '../../context/SocketContext';
import { useOffline } from '../../context/OfflineContext';

interface NavbarProps {
  onOpenReportModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenReportModal }) => {
  const { user, isAuthenticated, logout, isOfficialOrAdmin } = useAuth();
  const { isConnected } = useSocketContext();
  const { isOnline } = useOffline();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-[#123B2A] text-white sticky top-0 z-40 shadow-md border-b border-[#1b4e38]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#16A36A] flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-mono">
                  HILL<span className="text-[#16A36A]">GUARD</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold bg-[#16A36A]/30 text-emerald-300 border border-[#16A36A]/50 px-1.5 py-0.2 rounded uppercase tracking-wider">
                  IoT Pilot
                </span>
              </div>
              <p className="text-[10px] text-emerald-300/80 -mt-0.5 hidden sm:block">
                NIT Arunachal Pradesh • CSE Minor Project
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                isActive('/') ? 'bg-[#1b4e38] text-white' : 'text-slate-200 hover:text-white hover:bg-[#164330]'
              }`}
            >
              Home
            </Link>

            <Link
              to="/live-monitoring"
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition ${
                isActive('/live-monitoring') ? 'bg-[#1b4e38] text-white' : 'text-slate-200 hover:text-white hover:bg-[#164330]'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              Live Map
            </Link>

            <Link
              to="/dashboard/traveller"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                isActive('/dashboard/traveller') ? 'bg-[#1b4e38] text-white' : 'text-slate-200 hover:text-white hover:bg-[#164330]'
              }`}
            >
              Traveller Hub
            </Link>

            <Link
              to="/dashboard/official"
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition ${
                isActive('/dashboard/official') ? 'bg-[#1b4e38] text-white' : 'text-slate-200 hover:text-white hover:bg-[#164330]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Official Control
            </Link>

            <Link
              to="/simulator"
              className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-1.5 transition ${
                isActive('/simulator')
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-800/40 text-emerald-300 hover:bg-emerald-800/70 border border-emerald-600/30'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-300 animate-pulse" />
              Simulator
            </Link>

            <Link
              to="/alerts"
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition ${
                isActive('/alerts') ? 'bg-[#1b4e38] text-white' : 'text-slate-200 hover:text-white hover:bg-[#164330]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Alerts
            </Link>

            <Link
              to="/docs"
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition ${
                isActive('/docs') ? 'bg-[#1b4e38] text-white' : 'text-slate-200 hover:text-white hover:bg-[#164330]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-300" />
              Docs
            </Link>
          </div>

          {/* Action CTAs & User Menu */}
          <div className="flex items-center gap-3">
            {/* Live Camera Citizen Report CTA */}
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition transform active:scale-95"
              title="Capture Live Camera Snapshot and GPS"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Report Blockage</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* Socket & Network Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded bg-[#0b251a] border border-emerald-900 text-[11px]">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline && isConnected ? 'bg-emerald-400 radar-pulse-green' : 'bg-red-500'
                }`}
              />
              <span className="text-slate-300">
                {!isOnline ? 'Offline' : isConnected ? 'Live Telemetry' : 'Connecting'}
              </span>
            </div>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#1b4e38] hover:bg-[#235e45] text-xs font-medium transition"
                >
                  <User className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="max-w-[90px] truncate">{user?.name}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-900/60 px-1 rounded">
                    {user?.role}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-1.5 rounded hover:bg-red-900/40 text-slate-300 hover:text-red-300 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-slate-200 hover:text-white hover:bg-[#1b4e38] transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-[#16A36A] hover:bg-emerald-700 text-white transition"
                >
                  Register
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
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            Home
          </Link>
          <Link
            to="/live-monitoring"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            Live Road Map
          </Link>
          <Link
            to="/dashboard/traveller"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            Traveller Dashboard
          </Link>
          <Link
            to="/dashboard/official"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            Official Control Centre
          </Link>
          <Link
            to="/simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-semibold text-emerald-400 bg-emerald-950/60"
          >
            Hardware Simulator
          </Link>
          <Link
            to="/alerts"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            Alerts Centre
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            About Project
          </Link>
          <Link
            to="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-200 hover:bg-[#164330]"
          >
            System Documentation
          </Link>
        </div>
      )}
    </nav>
  );
};
