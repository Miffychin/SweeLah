import React, { useState, useEffect, useRef } from 'react';
import { CheckpointStatus, OneMotoringCamera, ViewMode } from '../types';
import { sound } from '../utils/audio';
import {
  Video,
  Clock,
  TrendingUp,
  AlertCircle,
  Train,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Maximize2,
  LayoutGrid,
  Layers,
  MapPin,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import {
  fetchLiveOneMotoringCameras,
  getDefaultOneMotoringCameras,
  ONEMOTORING_URL,
} from '../services/trafficCameraService';
import { CameraZoomModal } from './CameraZoomModal';

interface LiveGridTabProps {
  checkpoints: CheckpointStatus[];
  isMuted: boolean;
  onToast: (msg: string, type?: 'success' | 'alert' | 'info') => void;
  onReserveRtsFeeder: () => void;
  viewMode?: ViewMode;
}

export const LiveGridTab: React.FC<LiveGridTabProps> = ({
  checkpoints,
  isMuted,
  onToast,
  onReserveRtsFeeder,
  viewMode = 'app',
}) => {
  const [cameras, setCameras] = useState<OneMotoringCamera[]>(getDefaultOneMotoringCameras);
  const [isLoadingCams, setIsLoadingCams] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('Just now');
  const [countdown, setCountdown] = useState<number>(25);

  // Selected cameras in focused view
  const [woodlandsCamId, setWoodlandsCamId] = useState<string>('2701');
  const [tuasCamId, setTuasCamId] = useState<string>('4703');

  // Display mode: 'focused' (Woodlands + Tuas cards) or 'grid' (All 6 OneMotoring cameras)
  const [displayMode, setDisplayMode] = useState<'focused' | 'grid'>('focused');

  // Zoom modal
  const [zoomCamera, setZoomCamera] = useState<OneMotoringCamera | null>(null);

  const woodlandsCheckpoint = checkpoints.find((c) => c.id === 'woodlands');
  const tuasCheckpoint = checkpoints.find((c) => c.id === 'tuas');

  const woodlandsCams = cameras.filter((c) => c.checkpoint === 'woodlands');
  const tuasCams = cameras.filter((c) => c.checkpoint === 'tuas');

  const selectedWoodlandsCam =
    woodlandsCams.find((c) => c.id === woodlandsCamId) || woodlandsCams[0] || cameras[0];
  const selectedTuasCam =
    tuasCams.find((c) => c.id === tuasCamId) || tuasCams[0] || cameras[3];

  const loadCameras = async (silent = false) => {
    if (!silent) setIsLoadingCams(true);
    try {
      const result = await fetchLiveOneMotoringCameras();
      setCameras(result.cameras);
      setLastUpdatedTime(result.fetchedAt);
      setCountdown(25);
      if (!silent) {
        if (!isMuted) sound.playSuccess();
        onToast(`OneMotoring cameras updated (${result.source === 'live' ? 'Live LTA DataMall' : 'Cached'}).`);
      }
    } catch {
      if (!silent) {
        onToast('Using latest cached OneMotoring snapshot.', 'info');
      }
    } finally {
      if (!silent) setIsLoadingCams(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    loadCameras(true);
  }, []);

  // Periodic refresh & countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadCameras(true);
          return 25;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMuted]);

  const handleManualRefresh = () => {
    if (!isMuted) sound.playTap();
    loadCameras(false);
  };

  const handleReserveFeeder = () => {
    if (!isMuted) sound.playSuccess();
    onReserveRtsFeeder();
  };

  const handleCameraSelect = (camId: string, checkpoint: 'woodlands' | 'tuas') => {
    if (!isMuted) sound.playTap();
    if (checkpoint === 'woodlands') {
      setWoodlandsCamId(camId);
    } else {
      setTuasCamId(camId);
    }
  };

  return (
    <div id="tab-live" className="space-y-4 animate-in fade-in duration-200">
      {/* Top Header & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3.5 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-1.5">
              <span>Causeway Live Cameras & RTS Hub</span>
            </h2>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300/60">
              <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
              <span>OneMotoring Live</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time traffic images sourced from{' '}
            <a
              href={ONEMOTORING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 font-semibold underline hover:text-emerald-800 inline-flex items-center gap-0.5"
            >
              LTA OneMotoring
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Grid vs Focused Mode Switcher */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                if (!isMuted) sound.playTap();
                setDisplayMode('focused');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                displayMode === 'focused'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dual Checkpoint Focused View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Focused</span>
            </button>
            <button
              onClick={() => {
                if (!isMuted) sound.playTap();
                setDisplayMode('grid');
              }}
              className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                displayMode === 'grid'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="6-Camera Live Matrix View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">6-Cam Grid</span>
            </button>
          </div>

          {/* Refresh Button with countdown */}
          <button
            onClick={handleManualRefresh}
            disabled={isLoadingCams}
            className="text-[11px] text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh OneMotoring Camera Feeds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCams ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="font-mono text-[10px]">{countdown}s</span>
          </button>
        </div>
      </div>

      {/* Official OneMotoring LTA Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white p-3.5 rounded-3xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Official OneMotoring Traffic Cameras</span>
              <span className="text-[9px] bg-emerald-500/30 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40">
                LTA DataMall
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Live border surveillance cameras covering Woodlands Causeway & Tuas Second Link. Updated every 20-30s.
            </p>
          </div>
        </div>

        <a
          href={ONEMOTORING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow active:scale-95 shrink-0 cursor-pointer"
        >
          <span>OneMotoring Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 6-Camera Live Matrix Mode */}
      {displayMode === 'grid' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
            <span>All 6 Checkpoint Traffic Cameras (OneMotoring Feed)</span>
            <span className="text-[10px] text-slate-400 font-mono">Synced: {lastUpdatedTime}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cameras.map((cam) => (
              <div
                key={cam.id}
                className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-2 flex flex-col"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        cam.checkpoint === 'woodlands' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    ></span>
                    <span className="font-bold text-slate-800 text-[11px] truncate" title={cam.name}>
                      {cam.direction}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                    #{cam.id}
                  </span>
                </div>

                {/* Camera Image Thumbnail */}
                <div
                  onClick={() => setZoomCamera(cam)}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl bg-black aspect-video flex items-center justify-center border border-slate-700/60"
                >
                  <img
                    src={cam.imageUrl}
                    alt={cam.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Scanline subtle effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30"></div>

                  {/* Hover magnifier */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold">
                    <Maximize2 className="w-4 h-4 text-emerald-400" />
                    <span>Click to Zoom</span>
                  </div>

                  <div className="absolute bottom-1.5 left-2 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono text-emerald-300">
                    {cam.formattedTime}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 line-clamp-1 mt-auto">
                  {cam.locationDescription}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focused Mode (Woodlands + Tuas Dedicated Cards) */}
      {displayMode === 'focused' && (
        <div className={`grid gap-4 ${viewMode === 'web' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Woodlands Causeway Camera Feed Card */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Woodlands Causeway</span>
                    <span className="text-[10px] text-slate-400 block">BSI Customs ⇄ Woodlands Checkpoint</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-600 font-mono">
                    ~{woodlandsCheckpoint?.sgToMyTimeMin || 24} mins
                  </span>
                  <span className="text-[10px] text-slate-400 block">SG ➔ JB Queue</span>
                </div>
              </div>

              {/* Cam Selection Pills */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {woodlandsCams.map((cam) => {
                  const isSelected = cam.id === woodlandsCamId;
                  return (
                    <button
                      key={cam.id}
                      onClick={() => handleCameraSelect(cam.id, 'woodlands')}
                      className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cam.id === '2701' && 'Causeway (Cam #2701)'}
                      {cam.id === '2702' && 'BKE View (Cam #2702)'}
                      {cam.id === '2704' && 'Flyover (Cam #2704)'}
                    </button>
                  );
                })}
              </div>

              {/* Camera Visualizer Screen */}
              <div
                onClick={() => setZoomCamera(selectedWoodlandsCam)}
                className="group relative h-48 sm:h-52 bg-slate-950 rounded-2xl overflow-hidden flex flex-col justify-between p-3 text-white border border-slate-700/60 shadow-inner cursor-pointer"
              >
                {/* Real Live Image from OneMotoring */}
                <img
                  src={selectedWoodlandsCam.imageUrl}
                  alt={selectedWoodlandsCam.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 select-none"
                />

                {/* Dark gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none"></div>

                {/* Scanline simulation */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-25"></div>

                {/* Top bar info */}
                <div className="flex justify-between items-center z-10 text-[10px] text-emerald-300 font-mono">
                  <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span>LIVE ONEMOTORING</span>
                  </span>
                  <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg font-bold text-slate-200">
                    CAM #{selectedWoodlandsCam.id}
                  </span>
                </div>

                {/* Center Hover Action */}
                <div className="z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-slate-900/90 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl border border-slate-600 flex items-center gap-1.5 shadow-xl">
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Click to Expand Live Cam</span>
                  </span>
                </div>

                {/* Bottom bar info */}
                <div className="z-10 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 drop-shadow-md">
                    <Video className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{selectedWoodlandsCam.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-300 font-mono">
                    <span className="truncate text-slate-200">{selectedWoodlandsCam.locationDescription}</span>
                    <span className="bg-slate-900/90 px-1.5 py-0.5 rounded text-emerald-300 shrink-0 ml-2">
                      {selectedWoodlandsCam.formattedTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Woodlands BSI queue sensor active</span>
              </span>
              <a
                href={ONEMOTORING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-500 hover:text-emerald-700 font-bold flex items-center gap-1"
              >
                <span>OneMotoring Details</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Tuas Second Link Camera Feed Card */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Tuas Second Link</span>
                    <span className="text-[10px] text-slate-400 block">KSAB Tanjung Kupang ⇄ Tuas CIQ</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-700 font-mono">
                    ~{tuasCheckpoint?.sgToMyTimeMin || 14} mins
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold block">Fast Flow 🟢</span>
                </div>
              </div>

              {/* Cam Selection */}
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                {tuasCams.map((cam) => {
                  const isSelected = cam.id === tuasCamId;
                  return (
                    <button
                      key={cam.id}
                      onClick={() => handleCameraSelect(cam.id, 'tuas')}
                      className={`px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cam.id === '4703' && 'Second Link Bridge (Cam #4703)'}
                      {cam.id === '4713' && 'Tuas Checkpoint (Cam #4713)'}
                      {cam.id === '4712' && 'After Tuas West (Cam #4712)'}
                    </button>
                  );
                })}
              </div>

              {/* Camera Visualizer Screen */}
              <div
                onClick={() => setZoomCamera(selectedTuasCam)}
                className="group relative h-48 sm:h-52 bg-slate-950 rounded-2xl overflow-hidden flex flex-col justify-between p-3 text-white border border-slate-700/60 shadow-inner cursor-pointer"
              >
                {/* Real Live Image from OneMotoring */}
                <img
                  src={selectedTuasCam.imageUrl}
                  alt={selectedTuasCam.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 select-none"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-25"></div>

                <div className="flex justify-between items-center z-10 text-[10px] text-emerald-300 font-mono">
                  <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>CLEAR TRAFFIC • LTA</span>
                  </span>
                  <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-lg font-bold text-slate-200">
                    CAM #{selectedTuasCam.id}
                  </span>
                </div>

                <div className="z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-slate-900/90 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl border border-slate-600 flex items-center gap-1.5 shadow-xl">
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Click to Expand Live Cam</span>
                  </span>
                </div>

                <div className="z-10 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 drop-shadow-md">
                    <Video className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{selectedTuasCam.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-300 font-mono">
                    <span className="truncate text-slate-200">{selectedTuasCam.locationDescription}</span>
                    <span className="bg-slate-900/90 px-1.5 py-0.5 rounded text-emerald-300 shrink-0 ml-2">
                      {selectedTuasCam.formattedTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Second Link tolls normal (~$3.50 SGD)</span>
              </span>
              <a
                href={ONEMOTORING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-slate-500 hover:text-emerald-700 font-bold flex items-center gap-1"
              >
                <span>OneMotoring Details</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* RTS Link Shuttle Connector Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-850 to-slate-900 text-white p-4 rounded-3xl shadow-md space-y-2.5 border border-emerald-600/30">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-200">RTS Link Shuttle Connector</span>
          </div>
          <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
            RTS SYNERGY
          </span>
        </div>
        <p className="text-xs text-emerald-100 leading-relaxed">
          Arriving via RTS Train at <strong>Bukit Chagar</strong> or <strong>Woodlands North</strong>? Sync seamlessly with pooled feeder vans for door-to-door transit into JB or SG hubs.
        </p>
        <button
          onClick={handleReserveFeeder}
          className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold py-2.5 rounded-xl transition-all shadow active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Train className="w-3.5 h-3.5" />
          <span>Reserve RTS Shuttle Feeder Van</span>
        </button>
      </div>

      {/* AI Causeway Forecast & Optimal Window */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Optimal Causeway Departure Window</span>
        </div>

        {/* Hourly Forecast Bars */}
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-500 text-[10px]">
            <span>5:00 PM</span>
            <span className="font-semibold text-emerald-700">Recommended Window: 8:15 PM onwards</span>
          </div>

          <div className="grid grid-cols-6 gap-1 text-center font-mono text-[10px]">
            <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200">
              <div className="text-[9px] text-slate-400">5 PM</div>
              <div className="font-bold text-amber-600">25m</div>
              <div className="h-1 bg-amber-400 rounded-full mt-1"></div>
            </div>
            <div className="bg-rose-50 p-1.5 rounded-lg border border-rose-200">
              <div className="text-[9px] text-rose-500">6 PM</div>
              <div className="font-bold text-rose-700">45m</div>
              <div className="h-1 bg-rose-500 rounded-full mt-1"></div>
            </div>
            <div className="bg-rose-50 p-1.5 rounded-lg border border-rose-200">
              <div className="text-[9px] text-rose-500">7 PM</div>
              <div className="font-bold text-rose-700">55m</div>
              <div className="h-1 bg-rose-500 rounded-full mt-1"></div>
            </div>
            <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-200">
              <div className="text-[9px] text-amber-600">8 PM</div>
              <div className="font-bold text-amber-700">30m</div>
              <div className="h-1 bg-amber-400 rounded-full mt-1"></div>
            </div>
            <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-200 ring-1 ring-emerald-500">
              <div className="text-[9px] text-emerald-700 font-bold">9 PM</div>
              <div className="font-bold text-emerald-800">12m</div>
              <div className="h-1 bg-emerald-500 rounded-full mt-1"></div>
            </div>
            <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
              <div className="text-[9px] text-emerald-700">10 PM</div>
              <div className="font-bold text-emerald-800">10m</div>
              <div className="h-1 bg-emerald-500 rounded-full mt-1"></div>
            </div>
          </div>
        </div>

        {/* Regulatory Customs Reminders */}
        <div className="bg-slate-50 p-2.5 rounded-2xl text-[11px] text-slate-600 space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Cross-Border Rules Summary</span>
          </div>
          <p className="text-[10px] text-slate-500">
            • 3/4 Tank Rule: SG-registered cars must have at least 3/4 fuel tank when departing SG.
          </p>
          <p className="text-[10px] text-slate-500">
            • VEP RFID Tag: Verified on all Swee Lah host vehicles.
          </p>
        </div>
      </div>

      {/* Fullscreen Camera Zoom Modal */}
      <CameraZoomModal
        camera={zoomCamera}
        isOpen={!!zoomCamera}
        onClose={() => setZoomCamera(null)}
        onRefresh={() => loadCameras(false)}
        isRefreshing={isLoadingCams}
      />
    </div>
  );
};
