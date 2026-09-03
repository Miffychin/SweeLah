import React, { useState } from 'react';
import { CheckpointStatus } from '../types';
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
} from 'lucide-react';

interface LiveGridTabProps {
  checkpoints: CheckpointStatus[];
  isMuted: boolean;
  onToast: (msg: string, type?: 'success' | 'alert' | 'info') => void;
  onReserveRtsFeeder: () => void;
}

export const LiveGridTab: React.FC<LiveGridTabProps> = ({
  checkpoints,
  isMuted,
  onToast,
  onReserveRtsFeeder,
}) => {
  const [selectedCam, setSelectedCam] = useState<'woodlands_sg' | 'woodlands_my' | 'tuas_sg' | 'tuas_my'>('woodlands_sg');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const woodlands = checkpoints.find((c) => c.id === 'woodlands');
  const tuas = checkpoints.find((c) => c.id === 'tuas');

  const handleRefreshCams = () => {
    if (!isMuted) sound.playTap();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (!isMuted) sound.playSuccess();
      onToast('Traffic cameras & queue estimates updated.');
    }, 600);
  };

  const handleReserveFeeder = () => {
    if (!isMuted) sound.playSuccess();
    onReserveRtsFeeder();
  };

  return (
    <div id="tab-live" className="space-y-4 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-extrabold text-slate-800">Causeway Traffic Cameras & RTS Hub</h2>
          <p className="text-[11px] text-slate-500">Real-time border queue analytics & live webcams</p>
        </div>
        <button
          onClick={handleRefreshCams}
          disabled={isRefreshing}
          className="text-[10px] text-emerald-800 font-bold bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Live Feed</span>
        </button>
      </div>

      {/* Woodlands Causeway Camera Feed Card */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
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
              ~{woodlands?.sgToMyTimeMin || 24} mins
            </span>
            <span className="text-[10px] text-slate-400 block">SG ➔ JB Queue</span>
          </div>
        </div>

        {/* Cam Selection Pills */}
        <div className="flex gap-1 text-[10px]">
          <button
            onClick={() => setSelectedCam('woodlands_sg')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedCam === 'woodlands_sg' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            SG ➔ MY (Cam #102)
          </button>
          <button
            onClick={() => setSelectedCam('woodlands_my')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedCam === 'woodlands_my' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            MY ➔ SG (Cam #105)
          </button>
        </div>

        {/* Camera Visualizer Screen */}
        <div className="h-36 bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 rounded-2xl flex flex-col justify-between p-3 relative overflow-hidden text-white border border-slate-700/60 shadow-inner group">
          {/* Scanline simulation */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>

          {/* Road traffic visualization graphic */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-full h-8 border-y border-dashed border-emerald-400/40 flex justify-around items-center px-4">
              <span className="text-xs">🚗 🚙 🛻 🚗</span>
              <span className="text-xs">🚙 🚗 🛻</span>
            </div>
          </div>

          <div className="flex justify-between items-center z-10 text-[10px] text-emerald-300 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              REC • LIVE BSI FEED
            </span>
            <span>{selectedCam === 'woodlands_sg' ? 'WOODLANDS_CAM_102' : 'WOODLANDS_CAM_105'}</span>
          </div>

          <div className="z-10 text-center space-y-1">
            <div className="text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5">
              <Video className="w-4 h-4 text-emerald-400" />
              <span>
                {selectedCam === 'woodlands_sg'
                  ? 'Woodlands Causeway (Towards JB)'
                  : 'Johor Bahru CIQ (Towards SG)'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Moderate flow • Bus lanes moving steadily</p>
          </div>

          <div className="flex justify-between items-center z-10 text-[9px] text-slate-400">
            <span>Flow Rate: ~42 cars/min</span>
            <span className="bg-slate-900/80 px-1.5 py-0.5 rounded font-mono">Updated 30s ago</span>
          </div>
        </div>
      </div>

      {/* Tuas Second Link Camera Feed Card */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
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
              ~{tuas?.sgToMyTimeMin || 14} mins
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block">Fast Flow 🟢</span>
          </div>
        </div>

        {/* Cam Selection */}
        <div className="flex gap-1 text-[10px]">
          <button
            onClick={() => setSelectedCam('tuas_sg')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedCam === 'tuas_sg' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tuas SG ➔ MY (Cam #204)
          </button>
          <button
            onClick={() => setSelectedCam('tuas_my')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedCam === 'tuas_my' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tuas MY ➔ SG (Cam #208)
          </button>
        </div>

        <div className="h-28 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex flex-col justify-between p-3 relative overflow-hidden text-white border border-slate-700/60 shadow-inner">
          <div className="flex justify-between items-center text-[10px] text-emerald-300 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              CLEAR TRAFFIC
            </span>
            <span>TUAS_LINK_CAM_204</span>
          </div>

          <div className="text-center">
            <div className="text-xs font-bold text-slate-200">Tuas 2nd Link Checkpoint Concourse</div>
            <p className="text-[10px] text-emerald-300 font-medium">Optimal choice for West Singapore commuters</p>
          </div>

          <div className="flex justify-between items-center text-[9px] text-slate-400">
            <span>Toll Split: ~$3.50 SGD</span>
            <span className="bg-slate-900/80 px-1.5 py-0.5 rounded font-mono">Updated 15s ago</span>
          </div>
        </div>
      </div>

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
    </div>
  );
};
