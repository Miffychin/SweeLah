import React from 'react';
import { Currency, CheckpointStatus, ViewMode } from '../types';
import { sound } from '../utils/audio';
import { Volume2, VolumeX, Smartphone, Monitor, RefreshCw, Car, QrCode, Activity, IdCard, Wallet as WalletIcon, User, MessageSquare } from 'lucide-react';

interface HeaderProps {
  currency: Currency;
  onToggleCurrency: () => void;
  checkpoints: CheckpointStatus[];
  viewMode: ViewMode;
  onToggleViewMode: (mode?: ViewMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onRefreshTraffic: () => void;
  isRefreshingTraffic: boolean;
  activeTab?: 'book' | 'pass' | 'live' | 'driver' | 'wallet' | 'profile' | 'talk';
  onSelectTab?: (tab: 'book' | 'pass' | 'live' | 'driver' | 'wallet' | 'profile' | 'talk') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currency,
  onToggleCurrency,
  checkpoints,
  viewMode,
  onToggleViewMode,
  isMuted,
  onToggleMute,
  onRefreshTraffic,
  isRefreshingTraffic,
  activeTab,
  onSelectTab,
}) => {
  const woodlands = checkpoints.find((c) => c.id === 'woodlands');
  const tuas = checkpoints.find((c) => c.id === 'tuas');
  const rts = checkpoints.find((c) => c.id === 'rts');

  const webNavTabs = [
    { id: 'book' as const, label: 'Match Rides', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'pass' as const, label: 'Customs Pass', icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: 'live' as const, label: 'Live Cam Grid', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'driver' as const, label: 'Host Mode', icon: <IdCard className="w-3.5 h-3.5" /> },
    { id: 'wallet' as const, label: 'Wallet', icon: <WalletIcon className="w-3.5 h-3.5" /> },
    { id: 'profile' as const, label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'talk' as const, label: 'Talk to Us', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  return (
    <header
      id="app-header"
      className="bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white p-3.5 sm:p-4 shrink-0 shadow-xl border-b border-emerald-800/40 relative z-20"
    >
      {/* Top row: Brand & Global Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-xl text-emerald-950 shadow-md ring-2 ring-emerald-400/30 shrink-0">
            🇸🇬
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight leading-none text-white font-sans">
                Swee Lah
              </h1>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 tracking-wider">
                SG ⇄ JB
              </span>
              {viewMode === 'web' && (
                <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono px-1.5 py-0.5 rounded">
                  WEB PORTAL
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-200/80 font-medium mt-0.5">
              Cross-Border Commute & Traffic Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* App / Web Version Switcher Pill */}
          <div
            id="view-mode-segmented-control"
            className="flex bg-slate-950/80 p-0.5 rounded-xl border border-emerald-500/30 shadow-inner"
          >
            <button
              id="view-mode-app-btn"
              onClick={() => onToggleViewMode('app')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'app'
                  ? 'bg-emerald-500 text-slate-950 shadow font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Switch to Mobile App Version"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[11px]">App</span>
            </button>

            <button
              id="view-mode-web-btn"
              onClick={() => onToggleViewMode('web')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'web'
                  ? 'bg-emerald-500 text-slate-950 shadow font-extrabold'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Switch to Web Portal Version (Wide Desktop View)"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[11px]">Web</span>
            </button>
          </div>

          {/* Currency Toggle */}
          <button
            id="currency-toggle-btn"
            onClick={() => {
              if (!isMuted) sound.playToggle();
              onToggleCurrency();
            }}
            title="Toggle between SGD and MYR (1 SGD = 3.50 MYR)"
            className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-emerald-600/40 flex items-center gap-1 shadow-inner active:scale-95 cursor-pointer"
          >
            <span className="text-[10px] opacity-70">CURR:</span>
            <span className="text-emerald-300 font-extrabold">
              {currency === 'SGD' ? 'SGD' : 'MYR'}
            </span>
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

      {/* Web Portal Navigation Bar (Visible in Web View on Medium+ screens) */}
      {viewMode === 'web' && onSelectTab && (
        <div className="hidden md:flex items-center gap-1.5 mb-3 pt-1 border-t border-emerald-800/40 overflow-x-auto pb-1">
          {webNavTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (!isMuted && !isActive) sound.playTap();
                  onSelectTab(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900/80 border border-emerald-700/30'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Real-time Causeway Wait Times Banner */}
      <div className="bg-slate-950/70 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between text-xs border border-emerald-500/25 shadow-inner">
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
          <span>Singpass & VEP Synced • LTA DataMall Live</span>
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
