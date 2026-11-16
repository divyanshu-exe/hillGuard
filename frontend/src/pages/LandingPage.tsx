import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mountain,
  ShieldCheck,
  AlertTriangle,
  Camera,
  Activity,
  Cpu,
  Radio,
  CloudRain,
  MapPin,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  Wifi,
  ExternalLink,
  AlertOctagon
} from 'lucide-react';
import api from '../services/api';
import { RoadRiskMap } from '../components/map/RoadRiskMap';
import { RoadDetailsModal } from '../components/map/RoadDetailsModal';
import { useLanguage } from '../context/LanguageContext';
import { VoiceStatusAnnouncement } from '../components/common/VoiceStatusAnnouncement';
import { Road } from '../types';

interface LandingPageProps {
  onOpenReportModal: () => void;
  onOpenSos?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenReportModal, onOpenSos }) => {
  const { t } = useLanguage();
  const [roads, setRoads] = useState<Road[]>([]);
  const [stats, setStats] = useState({
    monitoredSections: 5,
    activeNodes: 5,
    activeWarnings: 1,
    verifiedIncidents: 2,
    systemStatus: 'OPERATIONAL'
  });
  const [selectedRoad, setSelectedRoad] = useState<Road | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roadsRes, statsRes] = await Promise.all([
          api.get('/roads'),
          api.get('/dashboard/stats')
        ]);
        if (roadsRes.data.success) {
          setRoads(roadsRes.data.data);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.warn('[LandingPage] Error loading data');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section - Light, Modern & Professional */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-emerald-50/20 to-white text-slate-900 pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        {/* Subtle grid pattern & ambient lighting */}
        <div className="absolute inset-0 opacity-[0.35] bg-[radial-gradient(#059669_0.8px,transparent_0.8px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 right-1/4 w-96 h-96 bg-emerald-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-4 w-72 h-72 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Pilot Badge & Voice Road Safety Bulletin */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 radar-pulse-green" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Voice Audio Announcement Component */}
            <VoiceStatusAnnouncement />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left 7 Cols */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight font-sans text-slate-900">
                {t('hero.titleLine1')} <br />
                <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                  {t('hero.titleLine2')}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                {t('hero.description')}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/live-monitoring"
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm shadow-emerald-600/30 flex items-center gap-2 transition hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Activity className="w-4 h-4" />
                  {t('hero.ctaExplore')}
                </Link>

                <button
                  onClick={onOpenReportModal}
                  className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm shadow-rose-600/30 flex items-center gap-2 transition hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Camera className="w-4 h-4" />
                  {t('hero.ctaReport')}
                </button>

                {/* Emergency SOS & Helpline Trigger */}
                <button
                  onClick={onOpenSos}
                  className="px-4 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-extrabold text-sm shadow-sm shadow-red-700/30 flex items-center gap-2 transition hover:-translate-y-0.5 active:translate-y-0 animate-pulse border border-red-500/50"
                  title="Open 24x7 Emergency Helplines (1070 / 112)"
                >
                  <AlertOctagon className="w-4 h-4 text-white" />
                  <span>SOS 1070 / 112</span>
                </button>

                <Link
                  to="/simulator"
                  className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-semibold flex items-center gap-2 shadow-xs transition hover:border-slate-400"
                >
                  <Cpu className="w-4 h-4 text-emerald-600 animate-pulse" />
                  {t('hero.ctaSimulator')}
                </Link>
              </div>

              {/* Live telemetry indicator banner */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-600 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{t('hero.telemetryActive')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('hero.simulatorRunning')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-sky-600" />
                  <span>{t('hero.pwaReady')}</span>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Live System Status Card (Light Executive Edition) */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 border border-slate-200 shadow-xl shadow-slate-200/60 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-slate-900 text-sm">{t('status.cardTitle')}</h3>
                  </div>
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {t('status.pilotMetrics')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('status.monitoredHighways')}</span>
                    <span className="text-2xl font-black text-slate-900">{stats.monitoredSections}</span>
                    <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">{t('status.monitoredSubtitle')}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('status.activeNodes')}</span>
                    <span className="text-2xl font-black text-emerald-600">{stats.activeNodes}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{t('status.activeNodesSubtitle')}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('status.activeWarnings')}</span>
                    <span className="text-2xl font-black text-amber-600">{stats.activeWarnings}</span>
                    <span className="text-[10px] text-amber-700 block mt-0.5">{t('status.activeWarningsSubtitle')}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">{t('status.verifiedIncidents')}</span>
                    <span className="text-2xl font-black text-rose-600">{stats.verifiedIncidents}</span>
                    <span className="text-[10px] text-rose-700 block mt-0.5">{t('status.verifiedIncidentsSubtitle')}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-rose-50/90 rounded-xl border border-rose-200/80 text-xs text-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 block">{t('status.alertRoute')}</span>
                    <span className="text-rose-700 font-bold">{t('status.alertText')}</span>
                  </div>
                  <Link
                    to="/live-monitoring"
                    className="text-rose-700 hover:text-rose-800 font-bold text-xs flex items-center gap-1"
                  >
                    {t('status.alertView')} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="text-[10px] text-slate-400 italic text-center">
                  {t('status.simulatorNote')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Monitoring Preview (Embedded Interactive Map) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            {t('map.eyebrow')}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            {t('map.title')}
          </h2>
          <p className="text-sm text-slate-600">
            {t('map.description')}
          </p>
        </div>

        <RoadRiskMap
          roads={roads}
          selectedRoadId={selectedRoad?._id}
          onSelectRoad={(road: Road) => setSelectedRoad(road)}
          height="520px"
        />
      </section>

      {/* 3. Why HillGuard Matters (Solving the Real-World Problem) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-white to-slate-50/80 text-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm">
          <div className="max-w-3xl mb-10 space-y-3">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              {t('why.eyebrow')}
            </span>
            <h2 className="text-3xl font-black text-slate-900">{t('why.title')}</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t('why.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300/80 shadow-xs hover:shadow-md transition-all space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold">
                ⚠️
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('why.f1Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('why.f1Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300/80 shadow-xs hover:shadow-md transition-all space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                📡
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('why.f2Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('why.f2Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300/80 shadow-xs hover:shadow-md transition-all space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center font-bold">
                📷
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('why.f3Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('why.f3Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300/80 shadow-xs hover:shadow-md transition-all space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold">
                🧠
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('why.f4Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('why.f4Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300/80 shadow-xs hover:shadow-md transition-all space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
                🛡️
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('why.f5Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('why.f5Desc')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300/80 shadow-xs hover:shadow-md transition-all space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
                ⚡
              </div>
              <h3 className="font-bold text-slate-900 text-base">{t('why.f6Title')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('why.f6Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How the System Works (Pipeline) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            {t('how.eyebrow')}
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">{t('how.title')}</h2>
          <p className="text-sm text-slate-600">
            {t('how.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all relative group">
            <span className="text-3xl font-black text-slate-200 group-hover:text-emerald-200 transition-colors absolute top-4 right-4">01</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">{t('how.step1Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('how.step1Desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all relative group">
            <span className="text-3xl font-black text-slate-200 group-hover:text-emerald-200 transition-colors absolute top-4 right-4">02</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">{t('how.step2Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('how.step2Desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all relative group">
            <span className="text-3xl font-black text-slate-200 group-hover:text-emerald-200 transition-colors absolute top-4 right-4">03</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">{t('how.step3Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('how.step3Desc')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all relative group">
            <span className="text-3xl font-black text-slate-200 group-hover:text-emerald-200 transition-colors absolute top-4 right-4">04</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-4">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">{t('how.step4Title')}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('how.step4Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Risk Classification Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{t('risk.eyebrow')}</span>
              <h2 className="text-2xl font-black text-slate-900">{t('risk.title')}</h2>
            </div>
            <span className="text-xs text-slate-500">{t('risk.note')}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* Green */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-2">
              <div className="flex items-center justify-between font-bold text-emerald-800">
                <span className="flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> GREEN
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">0 - 29</span>
              </div>
              <strong className="block text-emerald-950 font-semibold">{t('risk.greenTitle')}</strong>
              <p className="text-slate-600 leading-relaxed">
                {t('risk.greenDesc')}
              </p>
            </div>

            {/* Yellow */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-800">
                <span className="flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> YELLOW
                </span>
                <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">30 - 69</span>
              </div>
              <strong className="block text-amber-950 font-semibold">{t('risk.yellowTitle')}</strong>
              <p className="text-slate-600 leading-relaxed">
                {t('risk.yellowDesc')}
              </p>
            </div>

            {/* Red */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 space-y-2">
              <div className="flex items-center justify-between font-bold text-rose-800">
                <span className="flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> RED
                </span>
                <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded">70 - 100</span>
              </div>
              <strong className="block text-rose-950 font-semibold">{t('risk.redTitle')}</strong>
              <p className="text-slate-600 leading-relaxed">
                {t('risk.redDesc')}
              </p>
            </div>

            {/* Blocked */}
            <div className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50/80 space-y-2">
              <div className="flex items-center justify-between font-bold text-rose-800">
                <span className="flex items-center gap-1.5 text-sm">
                  ⛔ BLOCKED
                </span>
                <span className="text-xs bg-rose-200 text-rose-900 font-bold px-2 py-0.5 rounded">PHYSICAL</span>
              </div>
              <strong className="block text-rose-950 font-semibold">{t('risk.blockedTitle')}</strong>
              <p className="text-rose-900/80 leading-relaxed">
                {t('risk.blockedDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Hardware Preview (Phase 2 Readiness) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-white to-emerald-50/20 rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                {t('hardware.eyebrow')}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{t('hardware.title')}</h2>
            </div>
            <Link
              to="/simulator"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 self-start md:self-auto"
            >
              {t('hardware.button')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            {t('hardware.description')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 transition rounded-xl border border-slate-200/80 text-center space-y-0.5">
              <span className="text-xs font-bold block text-slate-900">{t('hardware.esp32')}</span>
              <span className="text-[11px] text-emerald-700 font-medium">{t('hardware.esp32Spec')}</span>
            </div>
            <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 transition rounded-xl border border-slate-200/80 text-center space-y-0.5">
              <span className="text-xs font-bold block text-slate-900">{t('hardware.soil')}</span>
              <span className="text-[11px] text-emerald-700 font-medium">{t('hardware.soilSpec')}</span>
            </div>
            <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 transition rounded-xl border border-slate-200/80 text-center space-y-0.5">
              <span className="text-xs font-bold block text-slate-900">{t('hardware.mpu')}</span>
              <span className="text-[11px] text-emerald-700 font-medium">{t('hardware.mpuSpec')}</span>
            </div>
            <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 transition rounded-xl border border-slate-200/80 text-center space-y-0.5">
              <span className="text-xs font-bold block text-slate-900">{t('hardware.rain')}</span>
              <span className="text-[11px] text-emerald-700 font-medium">{t('hardware.rainSpec')}</span>
            </div>
            <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 transition rounded-xl border border-slate-200/80 text-center space-y-0.5">
              <span className="text-xs font-bold block text-slate-900">{t('hardware.gsm')}</span>
              <span className="text-[11px] text-emerald-700 font-medium">{t('hardware.gsmSpec')}</span>
            </div>
            <div className="p-3.5 bg-slate-50 hover:bg-slate-100/80 transition rounded-xl border border-slate-200/80 text-center space-y-0.5">
              <span className="text-xs font-bold block text-slate-900">{t('hardware.solar')}</span>
              <span className="text-[11px] text-emerald-700 font-medium">{t('hardware.solarSpec')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Road Details Modal */}
      {selectedRoad && (
        <RoadDetailsModal
          road={selectedRoad}
          onClose={() => setSelectedRoad(null)}
          onOpenReportModal={(_road: Road) => {
            setSelectedRoad(null);
            onOpenReportModal();
          }}
        />
      )}
    </div>
  );
};
