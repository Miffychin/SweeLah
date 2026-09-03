import React from 'react';
import { Currency, CheckpointStatus } from '../types';
import { sound } from '../utils/audio';
import { Volume2, VolumeX, Smartphone, Monitor, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currency: Currency;
  onToggleCurrency: () => void;
  checkpoints: CheckpointStatus[];
  isPhoneMock: boolean;
  onTogglePhoneMock: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onRefreshTraffic: () => void;
  isRefreshingTraffic: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  onToggleCurrency,
  checkpoints,
  isPhoneMock,
  onTogglePhoneMock,
  isMuted,
  onToggleMute,
  onRefreshTraffic,
  isRefreshingTraffic,
}) => {
  const woodlands = checkpoints.find((c) => c.id === 'woodlands');
  const tuas = checkpoints.find((c) => c.id === 'tuas');
  const rts = checkpoints.find((c) => c.id === 'rts');

  return (
    <header id="app-header" className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white p-4 shrink-0 shadow-xl border-b border-emerald-800/40 relative z-20">
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-xl text-emerald-950 shadow-md ring-2 ring-emerald-400/30">
            🇸🇬
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold tracking-tight leading-none text-white font-sans">
                Swee Lah
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 tracking-wider">
                SG ⇄ JB
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 font-medium mt-0.5">
              Cross-Border Commute Engine
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Currency Toggle */}
          <button
            id="currency-toggle-btn"
            onClick={() => {
              if (!isMuted) sound.playToggle();
              onToggleCurrency();
            }}
            title="Toggle between SGD and MYR (1 SGD = 3.50 MYR)"
            className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-emerald-600/40 flex items-center gap-1.5 shadow-inner active:scale-95 cursor-pointer"
          >
            <span className="text-[10px] opacity-70">CURR:</span>
            <span className="text-emerald-300 font-extrabold">
              {currency === 'SGD' ? 'SGD ($)' : 'MYR (RM)'}
            </span>
          </button>

          {/* Desktop Frame Toggle (hidden on small screens) */}
          <button
            id="frame-toggle-btn"
            onClick={() => {
              if (!isMuted) sound.playTap();
              onTogglePhoneMock();
            }}
            title={isPhoneMock ? 'Switch to Full Screen View' : 'Switch to Mobile Frame'}
            className="hidden sm:flex bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded-xl text-xs transition-colors border border-slate-700/60 items-center justify-center cursor-pointer"
          >
            {isPhoneMock ? <Monitor className="w-4 h-4 text-emerald-400" /> : <Smartphone className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Mute Toggle */}
          <button
            id="mute-toggle-btn"
            onClick={() => {
              if (isMuted) sound.playTap();
              onToggleMute();
            }}
            title={isMuted ? 'Unmute UI sounds' : 'Mute UI sounds'}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded-xl text-xs transition-colors border border-slate-700/60 flex items-center justify-center cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Real-time Causeway Wait Times Banner */}
      <div className="bg-slate-950/70 backdrop-blur-md rounded-xl p-2.5 flex items-center justify-between text-xs border border-emerald-500/25 shadow-inner">
        {/* Woodlands */}
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <div className="text-[11px] leading-tight">
            <span className="text-slate-400 font-medium">Woodlands: </span>
            <strong className="text-amber-400 font-bold">~{woodlands?.sgToMyTimeMin || 24}m</strong>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-slate-700/60"></div>

        {/* Tuas */}
        <div className="flex items-center space-x-1.5">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <div className="text-[11px] leading-tight">
            <span className="text-slate-400 font-medium">Tuas 2nd: </span>
            <strong className="text-emerald-400 font-bold">~{tuas?.sgToMyTimeMin || 14}m</strong>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-slate-700/60"></div>

        {/* RTS Hub */}
        <div className="flex items-center space-x-1.5">
          <div className="text-[11px] leading-tight">
            <span className="text-slate-400 font-medium">RTS: </span>
            <strong className="text-cyan-400 font-bold">{rts?.sgToMyTimeMin || 5}m avg</strong>
          </div>
        </div>

        {/* Refresh button */}
        <button
          id="refresh-traffic-btn"
          onClick={() => {
            if (!isMuted) sound.playTap();
            onRefreshTraffic();
          }}
          title="Refresh live causeway times"
          className="text-slate-400 hover:text-emerald-300 transition-transform active:rotate-180 p-0.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTraffic ? 'animate-spin text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Connectivity strip */}
      <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-emerald-200/70 border-t border-emerald-800/30 font-medium">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Singpass & VEP Synced</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-300/80">
            <span className="text-[9px] bg-emerald-800/80 px-1 rounded text-emerald-200">WeChat</span> Mini-App
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-amber-300/90">
            <span className="text-[9px] bg-amber-900/60 px-1 rounded text-amber-200">Kakao</span> Sync
          </span>
        </div>
      </div>
    </header>
  );
};
