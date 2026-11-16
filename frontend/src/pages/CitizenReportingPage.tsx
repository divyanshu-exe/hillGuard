import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  User,
  ExternalLink,
  Info
} from 'lucide-react';
import api from '../services/api';
import { Report } from '../types';

interface CitizenReportingPageProps {
  onOpenReportModal: () => void;
}

export const CitizenReportingPage: React.FC<CitizenReportingPageProps> = ({ onOpenReportModal }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/reports');
        if (res.data.success) {
          setReports(res.data.data);
        }
      } catch (err) {
        console.warn('[CitizenReporting] Failed to load reports');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#123B2A] to-[#1c553d] text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-[#23684b] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Crowdsourced Highway Verification
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Citizen Road-Blockage Reporting
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
            Spotted a rockfall, fallen tree, or mudslide on your travel route? Use your device's live camera and GPS to file a verified incident report.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg transition transform active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Camera className="w-5 h-5" />
          Capture Live Incident
        </button>
      </div>

      {/* Verification Protocol Notice */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-800 text-sm block mb-1">
            HillGuard Anti-Fake Reporting Protocol:
          </strong>
          To prevent the spread of misleading rumours, gallery image uploads are disabled. Citizen reports require a <strong>direct live camera capture</strong> and automatic browser <strong>GPS coordinate tagging</strong>. Submissions are queued as <span className="font-semibold text-amber-600">NEW</span> and only alter highway passability after verification by authorized Border Roads Organisation (BRO) or APDMA officials.
        </div>
      </div>

      {/* Feed of Recent Reports */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-900 text-lg flex items-center justify-between">
          <span>Recent Citizen Incident Submissions</span>
          <span className="text-xs font-normal text-slate-500">{reports.length} Reports logged</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {report.reportId}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      report.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : report.status === 'UNDER_REVIEW'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : report.status === 'RESOLVED'
                        ? 'bg-sky-100 text-sky-800 border border-sky-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-bold">
                    {report.incidentType}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{report.roadName}</h4>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  "{report.description}"
                </p>

                {/* Location & Image Thumbnail Preview */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{report.location.latitude.toFixed(4)}° N, {report.location.longitude.toFixed(4)}° E</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Live Camera Verified
                  </span>
                </div>

                {report.verificationDetails && report.verificationDetails.officialRemarks && (
                  <div className="p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                    <span className="font-bold block flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Official Remarks:
                    </span>
                    <p className="italic text-[11px]">{report.verificationDetails.officialRemarks}</p>
                    {report.verificationDetails.verifiedByName && (
                      <span className="text-[10px] text-emerald-700 block text-right font-medium">
                        — {report.verificationDetails.verifiedByName}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t">
                <span>Reporter: {report.reporterName}</span>
                <span>{new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(report.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="col-span-2 bg-white p-10 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-2">
              <Camera className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No Citizen Reports Yet</h4>
              <p className="text-xs">Be the first to submit a verified roadway report using your camera.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
