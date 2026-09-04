import React from 'react';
import { OneMotoringCamera } from '../types';
import { X, ExternalLink, RefreshCw, ZoomIn, ZoomOut, MapPin, Clock, ShieldCheck, Video } from 'lucide-react';
import { ONEMOTORING_URL } from '../services/trafficCameraService';

interface CameraZoomModalProps {
  camera: OneMotoringCamera | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const CameraZoomModal: React.FC<CameraZoomModalProps> = ({
  camera,
  isOpen,
  onClose,
  onRefresh,
  isRefreshing = false,
}) => {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (isOpen) {
      setScale(1);
    }
  }, [isOpen]);

  if (!isOpen || !camera) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  {camera.name}
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-600/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  CAM #{camera.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{camera.locationDescription}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Display Area with Pan/Zoom */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[380px] p-2">
          <img
            src={camera.imageUrl}
            alt={camera.name}
            referrerPolicy="no-referrer"
            style={{ transform: `scale(${scale})` }}
            className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl transition-transform duration-150 select-none shadow-2xl"
          />

          {/* Live Overlay watermark */}
          <div className="absolute top-4 left-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="font-bold">LIVE LTA ONEMOTORING</span>
            <span className="text-slate-400">|</span>
            <span className="text-[11px] text-slate-300">{camera.formattedTime || 'Real-time'}</span>
          </div>

          {/* Zoom floating controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-lg">
            <button
              onClick={() => setScale((s) => Math.max(0.8, s - 0.2))}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-bold px-1.5 text-slate-300 min-w-[40px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.4, s + 0.2))}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setScale(1)}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors ml-1 cursor-pointer"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Modal Footer with OneMotoring Link and Meta */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-3 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Snapshot: {camera.formattedTime} (SGT)</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>GPS: {camera.latitude.toFixed(4)}°N, {camera.longitude.toFixed(4)}°E</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official DataMall Feed</span>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
                <span>Refresh Now</span>
              </button>
            )}

            <a
              href={ONEMOTORING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Open OneMotoring</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
