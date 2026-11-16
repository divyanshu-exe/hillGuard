import React from 'react';
import { Mountain, Shield, GraduationCap, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#123B2A] text-slate-300 border-t border-[#1e523b] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-[#16A36A] flex items-center justify-center text-white">
                <Mountain className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl text-white font-mono tracking-tight">
                HILL<span className="text-[#16A36A]">GUARD</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {t('footer.mission')}
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>{t('footer.phaseBadge')}</span>
            </div>
          </div>

          {/* Col 2: Academic Affiliation */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#16A36A]" />
              {t('footer.academic')}
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="font-medium text-white">{t('footer.institute')}</p>
              <p>{t('footer.dept')}</p>
              <p className="text-emerald-300">{t('footer.minorProject')}</p>
              <p className="pt-1 text-slate-400">
                {t('footer.guide')} <strong className="text-white">Dr. Koj Sambyo</strong>
              </p>
            </div>
          </div>

          {/* Col 3: Project Team */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4">{t('footer.developers')}</h4>
            <ul className="text-xs space-y-1.5 text-slate-300">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Divyanshu Gupta
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Riya Yadav
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Jainesh Birla
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Nabam Rana
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Ngilyang Nancy
              </li>
            </ul>
          </div>

          {/* Col 4: Monitored Corridors & Disclaimers */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Target Corridors
            </h4>
            <p className="text-xs text-slate-300 mb-2">
              NH-415 (Itanagar-Naharlagun), NH-13 (Bhalukpong-Bomdila), Sela Tunnel (Tawang Pass), Pasighat-Mariyang, Ziro Valley.
            </p>
            <div className="p-2.5 rounded bg-[#0e3022] border border-emerald-900/80 text-[11px] text-slate-400 leading-normal">
              <strong className="text-amber-400">Notice:</strong> Telemetry values in Phase 1 are generated via the Hardware Simulator for evaluation. Real ESP32 integration will connect in Phase 2.
            </div>
          </div>
        </div>

        <div className="border-t border-[#1b4e38] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} HillGuard. All Rights Reserved. National Institute of Technology Arunachal Pradesh.</p>
          <div className="flex items-center gap-4 text-slate-300">
            <span className="italic">"{t('hero.titleLine1')} {t('hero.titleLine2')}"</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
