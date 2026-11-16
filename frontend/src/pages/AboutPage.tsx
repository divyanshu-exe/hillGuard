import React from 'react';
import { Mountain, GraduationCap, ShieldCheck, Target, Award, Users, BookOpen } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-[#16A36A] uppercase tracking-widest">
          Academic Minor Project
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          About Project HillGuard
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          Real-Time Landslide Detection & Road-Blockage Alert System designed for the vulnerable highway corridors of Arunachal Pradesh.
        </p>
      </div>

      {/* Institutional Banner */}
      <div className="bg-gradient-to-r from-[#123B2A] to-[#1c553d] text-white p-6 sm:p-8 rounded-3xl border border-[#256e50] shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
            Institutional Affiliation
          </span>
          <h2 className="text-2xl font-black text-white">
            National Institute of Technology Arunachal Pradesh
          </h2>
          <p className="text-xs text-slate-300">
            Department of Computer Science and Engineering • B.Tech 3rd Year Minor Project
          </p>
          <p className="text-xs text-emerald-200 pt-1">
            Project Supervisor & Guide: <strong className="text-white">Dr. Koj Sambyo</strong>
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shrink-0">
          <GraduationCap className="w-9 h-9" />
        </div>
      </div>

      {/* Project Team */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          Student Development Team
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Divyanshu Gupta', role: 'Full-Stack & IoT Systems Architect' },
            { name: 'Riya Yadav', role: 'UI/UX & Frontend Lead' },
            { name: 'Jainesh Birla', role: 'Backend Services & Database Architect' },
            { name: 'Nabam Rana', role: 'Hardware Simulation & Sensor Engineering' },
            { name: 'Ngilyang Nancy', role: 'Geospatial Intelligence & PWA Testing' }
          ].map((member, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                0{idx + 1}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                <p className="text-xs text-slate-500">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motivation & Problem Statement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Target className="w-5 h-5 text-red-500" />
            The Arunachal Challenge
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The state of Arunachal Pradesh features vast mountainous terrain interconnected by highways such as NH-415, NH-13 (Trans-Arunachal Highway), and high-altitude passes like Sela Pass. During the monsoon season, continuous precipitation causes severe slope destabilisation, rockfalls, and mudslides.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Commuters currently depend on delayed official announcements or misinformation circulating on messaging platforms. When connectivity drops in deep valleys, travellers have no way of knowing whether the pass ahead is blocked.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            The HillGuard Solution
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            HillGuard addresses this challenge with a dual-phase architecture:
          </p>
          <ul className="text-xs sm:text-sm text-slate-600 space-y-1.5 list-disc list-inside">
            <li><strong>Phase 1 (Current):</strong> Complete web platform with Hardware Simulator, real-time Leaflet map, automated Risk Assessment Engine, live camera citizen reporting, and PWA offline support.</li>
            <li><strong>Phase 2 (Future):</strong> Physical solar-powered ESP32 nodes equipped with Capacitive Soil Moisture, MPU6050, and Optical Rain sensors feeding into the same APIs.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
