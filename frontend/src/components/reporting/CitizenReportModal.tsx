import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  RefreshCw,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Radio,
  Send,
  Eye,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCamera } from '../../hooks/useCamera';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useOffline } from '../../context/OfflineContext';
import { useAuth } from '../../context/AuthContext';
import { queueOfflineReport } from '../../services/offlineDb';
import api from '../../services/api';
import { Road, ReportIncidentType } from '../../types';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  roads: Road[];
  onReportSubmitted?: () => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  roads,
  onReportSubmitted
}) => {
  const { user } = useAuth();
  const { isOnline } = useOffline();

  // Camera hook
  const {
    videoRef,
    stream,
    error: cameraError,
    isLoading: cameraLoading,
    capturedPhoto,
    startCamera,
    stopCamera,
    capturePhoto,
    retakePhoto,
    setCapturedPhoto
  } = useCamera();

  // GPS Geolocation hook
  const {
    latitude,
    longitude,
    accuracy,
    error: gpsError,
    isLoading: gpsLoading,
    getLocation
  } = useGeolocation();

  // Form states
  const [selectedRoadId, setSelectedRoadId] = useState<string>('');
  const [roadName, setRoadName] = useState<string>('');
  const [incidentType, setIncidentType] = useState<ReportIncidentType>('Landslide');
  const [description, setDescription] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>(user?.name || '');
  const [reporterPhone, setReporterPhone] = useState<string>(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize camera and GPS when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera();
      getLocation().catch(() => {});
      if (roads.length > 0 && !selectedRoadId) {
        setSelectedRoadId(roads[0]._id);
        setRoadName(roads[0].name);
      }
    } else {
      stopCamera();
      setCapturedPhoto(null);
    }
  }, [isOpen, startCamera, stopCamera, getLocation, roads, setCapturedPhoto]);

  // Sync selectedRoadId with roadName
  const handleRoadChange = (id: string) => {
    setSelectedRoadId(id);
    const found = roads.find((r) => r._id === id);
    if (found) {
      setRoadName(found.name);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!capturedPhoto) {
      toast.error('A live camera snapshot is required to verify the incident.');
      return;
    }

    if (!roadName) {
      toast.error('Please select or specify the affected road section.');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a brief description of the blockage or landslide.');
      return;
    }

    // Default GPS to Itanagar coordinates if permission was denied in hill region
    const finalLat = latitude || 27.0844;
    const finalLng = longitude || 93.6053;

    setIsSubmitting(true);

    try {
      if (!isOnline) {
        // Queue report in IndexedDB for offline resilience!
        await queueOfflineReport({
          roadId: selectedRoadId,
          roadName,
          incidentType,
          description,
          latitude: finalLat,
          longitude: finalLng,
          accuracy: accuracy || 15,
          imageBase64: capturedPhoto,
          reporterName: reporterName || 'Concerned Traveller',
          reporterPhone,
          capturedViaLiveCamera: true
        });

        toast.success(
          'Offline Mode: Incident report saved to local IndexedDB queue. It will automatically upload once internet connects!',
          { duration: 6000 }
        );
        handleClose();
        if (onReportSubmitted) onReportSubmitted();
        return;
      }

      // Online submission via API
      const res = await api.post('/reports', {
        roadId: selectedRoadId,
        roadName,
        incidentType,
        description,
        latitude: finalLat,
        longitude: finalLng,
        accuracy: accuracy || 10,
        imageBase64: capturedPhoto,
        reporterName: reporterName || 'Concerned Traveller',
        reporterPhone,
        capturedViaLiveCamera: true
      });

      if (res.data.success) {
        toast.success('Incident reported successfully! Queued for official highway verification.', {
          duration: 5000
        });
        handleClose();
        if (onReportSubmitted) onReportSubmitted();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-[#123B2A] text-white flex items-center justify-between border-b border-[#1c553d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Report Road Blockage</h3>
              <p className="text-[11px] text-emerald-300">Live Camera & GPS Verification • NIT Arunachal Pilot</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-[#1b4e38] transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-sm">
          {/* Section 1: Live Camera Viewport (Strict: NO Gallery File Picker) */}
          <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 relative">
            <div className="aspect-video w-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
              {capturedPhoto ? (
                <div className="relative w-full h-full">
                  <img
                    src={capturedPhoto}
                    alt="Captured Incident Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-emerald-600/90 text-white text-[11px] px-2 py-0.5 rounded font-medium flex items-center gap-1 shadow">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live Snapshot Captured
                  </div>
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="absolute bottom-2 right-2 bg-slate-900/90 hover:bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Photo
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  {cameraLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-white text-xs gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      Opening Live Camera...
                    </div>
                  )}
                  {cameraError && (
                    <div className="absolute inset-0 p-4 flex flex-col items-center justify-center bg-slate-900 text-center text-xs text-red-400 gap-2">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                      <p>{cameraError}</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="mt-2 px-3 py-1 bg-slate-800 text-white rounded text-xs hover:bg-slate-700"
                      >
                        Retry Camera Permission
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Shutter Button when live camera stream is active */}
            {!capturedPhoto && stream && (
              <div className="p-2.5 bg-slate-900/95 flex items-center justify-center border-t border-slate-800">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  Capture Incident Photo
                </button>
              </div>
            )}
          </div>

          {/* Section 2: GPS Status Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Automatic GPS Verification
              </span>
              <button
                type="button"
                onClick={() => getLocation()}
                disabled={gpsLoading}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                {gpsLoading ? 'Acquiring...' : 'Refresh GPS'}
              </button>
            </div>

            {latitude && longitude ? (
              <div className="text-xs text-slate-600 grid grid-cols-2 gap-2 bg-white p-2 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 block">Latitude</span>
                  <span className="font-mono font-medium">{latitude.toFixed(5)}° N</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Longitude</span>
                  <span className="font-mono font-medium">{longitude.toFixed(5)}° E</span>
                </div>
                <div className="col-span-2 text-[11px] text-emerald-600 flex items-center gap-1 pt-1 border-t">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  GPS Ground Truthed (Accuracy: ±{Math.round(accuracy || 10)}m)
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {gpsError || 'Acquiring high-accuracy hill GPS fix... Please ensure location permissions are granted.'}
                </span>
              </div>
            )}
          </div>

          {/* Section 3: Incident Details Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Road Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Monitored Highway / Road Section <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedRoadId}
                onChange={(e) => handleRoadChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              >
                {roads.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.roadCode} - {r.name} ({r.district})
                  </option>
                ))}
              </select>
            </div>

            {/* Incident Type */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Incident Classification <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Landslide', 'Road Blockage', 'Fallen Trees', 'Rockfall', 'Flooding', 'Other'] as ReportIncidentType[]).map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setIncidentType(type)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition ${
                        incidentType === type
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {type}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Incident Description & Severity <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g. Boulders and mud have blocked both lanes 2km past Ganga Lake cutoff. Stranded vehicles present."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>

            {/* Optional Contact */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-600 mb-0.5">Your Name (Optional)</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Tana Tara"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-0.5">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 94022 ..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Verification Notice */}
            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded">
              * Note: In accordance with HillGuard disaster protocols, submitted reports are forwarded to authorized Border Roads Organisation (BRO) and APDMA officials for verification before altering official road clearance status.
            </p>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !capturedPhoto}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Submitting...' : 'Submit Verified Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
