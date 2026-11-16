import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  X,
  AlertOctagon,
  Copy,
  Check,
  MapPin,
  Ambulance,
  Radio,
  Flame,
  LifeBuoy,
  FileCheck,
  Compass
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../context/LanguageContext';

interface EmergencySOSDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSDrawer: React.FC<EmergencySOSDrawerProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [copiedGps, setCopiedGps] = useState(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'protocols'>('contacts');
  const [locating, setLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  if (!isOpen) return null;

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const coords = {
          lat: parseFloat(pos.coords.latitude.toFixed(5)),
          lng: parseFloat(pos.coords.longitude.toFixed(5))
        };
        setUserCoords(coords);
        const text = `SOS! I am stranded at Lat: ${coords.lat}, Lng: ${coords.lng} (Accuracy: ±${Math.round(pos.coords.accuracy)}m). Please send assistance.`;
        navigator.clipboard.writeText(text);
        setCopiedGps(true);
        toast.success('GPS coordinates copied to clipboard! Paste in SMS or WhatsApp.', { duration: 4000 });
        setTimeout(() => setCopiedGps(false), 3000);
      },
      (err) => {
        setLocating(false);
        toast.error('Unable to fetch GPS: ' + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const emergencyContacts = [
    {
      name: 'State Disaster Control Room (ASDMA)',
      subtitle: 'Arunachal Pradesh State Disaster Management Authority',
      number: '1070',
      dial: 'tel:1070',
      alt: '0360-2212223',
      icon: ShieldAlert,
      badge: '24x7 Toll-Free',
      color: 'bg-red-600 hover:bg-red-700 text-white'
    },
    {
      name: 'BRO Project Vartak / Arunank',
      subtitle: 'Border Roads Organisation Himalayan Task Force',
      number: '03782-222123',
      dial: 'tel:03782222123',
      alt: 'Sela / Tawang Clearance Base',
      icon: Compass,
      badge: 'Highway Clearance',
      color: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    {
      name: 'State Police & Emergency',
      subtitle: 'Emergency Response Support System (ERSS)',
      number: '112',
      dial: 'tel:112',
      alt: 'Pan-India Single Emergency',
      icon: Radio,
      badge: 'Police / Distress',
      color: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      name: 'Emergency Medical & Ambulance',
      subtitle: 'National Health Mission Emergency Fleet',
      number: '108',
      dial: 'tel:108',
      alt: 'Trauma & Mountain Evacuation',
      icon: Ambulance,
      badge: 'Medical',
      color: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    },
    {
      name: 'NDRF 12th Battalion (Doimukh)',
      subtitle: 'National Disaster Response Force Specialized Base',
      number: '0360-2244222',
      dial: 'tel:03602244222',
      alt: 'Arunachal Mountain Rescue',
      icon: LifeBuoy,
      badge: 'Search & Rescue',
      color: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    {
      name: 'Fire & Emergency Services',
      subtitle: 'State Fire Service Department',
      number: '101',
      dial: 'tel:101',
      alt: 'Accident Rescue',
      icon: Flame,
      badge: 'Rescue',
      color: 'bg-orange-600 hover:bg-orange-700 text-white'
    }
  ];

  const safetyProtocols = [
    {
      title: 'Active Rockfall / Shooting Stones',
      color: 'border-l-red-500 bg-red-50/60',
      points: [
        'Do not step outside your vehicle. The metallic car roof provides protection against falling debris.',
        'If rocks start tumbling ahead, immediately halt and reverse to a wider stretch or road overhang.',
        'Keep hazard blinkers ON to alert convoys following behind in blind curves.',
        'Never stand under unstable sheer rock faces or recently cut cliffs during heavy rain.'
      ]
    },
    {
      title: 'Encountering Deep Mudflow / Slurry',
      color: 'border-l-amber-500 bg-amber-50/60',
      points: [
        'Never attempt to drive through moving slurry or mudflows; even 6 inches of moving mud can derail 4WD vehicles.',
        'Watch for sudden drops or cracks developing across the asphalt surface.',
        'If vehicle gets stuck, abandon vehicle immediately towards the uphill side, away from the valley gorge.'
      ]
    },
    {
      title: 'Cloudburst & Sudden Flash Flood in Gorges',
      color: 'border-l-blue-500 bg-blue-50/60',
      points: [
        'Notice river sound: Sudden loud roaring or change from clear water to muddy brown indicates upstream burst.',
        'Immediately move to higher ground away from stream beds and seasonal mountain cascades.',
        'Do not park near bridge culverts that may choke with uprooted logs and debris.'
      ]
    },
    {
      title: 'No Network / Stranded in Mountain Pass',
      color: 'border-l-emerald-500 bg-emerald-50/60',
      points: [
        'Stay with your vehicle; search & rescue teams look for vehicles before individuals.',
        'Use HillGuard Offline Mode (cached data remains accessible without cellular connection).',
        'Conserve vehicle fuel by turning on cabin heating only 10 minutes every hour.',
        'Send an emergency SMS with copied GPS coordinates whenever phone catches a brief transient tower bounce.'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white px-5 py-4 shrink-0 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <AlertOctagon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight">Emergency SOS & Helplines</h2>
                  <span className="text-[10px] bg-white text-red-700 px-1.5 py-0.5 rounded font-extrabold uppercase">
                    24x7
                  </span>
                </div>
                <p className="text-xs text-red-100">Arunachal Disaster Relief & Quick Response</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick GPS Share Banner */}
          <div className="mt-3 bg-red-800/60 border border-red-400/30 rounded-lg p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-4 h-4 text-red-200 shrink-0" />
              <div>
                <div className="font-semibold text-white">Your Incident Coordinates</div>
                <div className="text-[10px] text-red-200">
                  {userCoords
                    ? `${userCoords.lat}°N, ${userCoords.lng}°E`
                    : 'Fetch GPS for Rescue SMS'}
                </div>
              </div>
            </div>
            <button
              onClick={handleGetGps}
              disabled={locating}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white text-red-700 hover:bg-red-50 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {locating ? (
                <span className="text-[11px]">Locating...</span>
              ) : copiedGps ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy GPS</span>
                </>
              )}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mt-3 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('contacts')}
              className={`flex-1 py-1.5 rounded-md transition text-center cursor-pointer ${
                activeTab === 'contacts'
                  ? 'bg-white text-red-700 font-bold shadow-xs'
                  : 'bg-red-800/40 text-red-100 hover:bg-red-800/60'
              }`}
            >
              Emergency Numbers
            </button>
            <button
              onClick={() => setActiveTab('protocols')}
              className={`flex-1 py-1.5 rounded-md transition text-center cursor-pointer ${
                activeTab === 'protocols'
                  ? 'bg-white text-red-700 font-bold shadow-xs'
                  : 'bg-red-800/40 text-red-100 hover:bg-red-800/60'
              }`}
            >
              Safety Protocols (Offline)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          {activeTab === 'contacts' && (
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
                Tap to Call Directly
              </div>

              {emergencyContacts.map((contact, idx) => {
                const Icon = contact.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {contact.name}
                          </h4>
                          <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
                            {contact.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{contact.subtitle}</p>
                        <div className="text-[11px] font-mono font-bold text-red-700 mt-0.5">
                          {contact.number}
                          {contact.alt && (
                            <span className="text-[10px] text-slate-400 font-normal ml-1.5">
                              • {contact.alt}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <a
                      href={contact.dial}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold shadow-xs transition active:scale-95 ${contact.color}`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'protocols' && (
            <div className="space-y-3">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  All protocols are stored locally via IndexedDB for offline mountain access.
                </span>
              </div>

              {safetyProtocols.map((protocol, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border border-slate-200 bg-white border-l-4 ${protocol.color} shadow-xs`}
                >
                  <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                    {protocol.title}
                  </h4>
                  <ul className="space-y-1.5">
                    {protocol.points.map((pt, pIdx) => (
                      <li key={pIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                        <span className="text-slate-400 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-white border-t border-slate-200 text-center text-[11px] text-slate-500 shrink-0">
          In emergency without cellular connectivity, tune vehicle radio to All India Radio (AIR) Itanagar/Tawang for flood advisories.
        </div>
      </div>
    </div>
  );
};
