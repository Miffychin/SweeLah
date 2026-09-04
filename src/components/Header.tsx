import React from 'react';
import { Currency, CheckpointStatus, ViewMode, EyeComfortMode } from '../types';
import { sound } from '../utils/audio';
import { Volume2, VolumeX, Smartphone, Monitor, RefreshCw, Car, QrCode, Activity, IdCard, Wallet as WalletIcon, User, MessageSquare, Eye } from 'lucide-react';

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
  eyeComfortMode?: EyeComfortMode;
  onCycleEyeComfort?: () => void;
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
  eyeComfortMode = 'sage',
  onCycleEyeComfort,
}) => {
  const woodlands = checkpoints.find((c) => c.id === 'woodlands');
  const tuas = checkpoints.find((c) => c.id === 'tuas');
  const rts = checkpoints.find((c) => c.id === 'rts');

  const eyeComfortLabels: Record<EyeComfortMode, string> = {
    sage: 'Sage Paper',
    sepia: 'Warm Sepia',
    night: 'Soft Night',
  };

  const webNavTabs = [
    { id: 'book' as const, label: 'Match Rides', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'pass' as const, label: 'Customs Pass', icon: <QrCode className="w-3.5 h-3.5" /> },
    { id: 'live' as const, label: 'Live Cam Grid', icon: <Activity className="w-3.5 h-3.5" /> },
    { id: 'driver' as const, label: 'Host Mode', icon: <IdCard className="w-3.5 h-3.5" /> },
    { id: 'wallet' as const, label: 'Wallet', icon: <WalletIcon className="w-3.5 h-3.5" /> },
    { id: 'profile' as const, label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'talk' as const, label: 'Talk to Us', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  // Header background theme according to eye comfort mode
  const headerBgClass =
    eyeComfortMode === 'sepia'
      ? 'bg-gradient-to-b from-[#382b20] via-[#433427] to-[#2c2118] border-[#5a4433]/70'
      : eyeComfortMode === 'night'
      ? 'bg-gradient-to-b from-[#18211b] via-[#1d2720] to-[#141a16] border-[#2c3d31]/70'
      : 'bg-gradient-to-b from-[#23352a] via-[#2a3f32] to-[#1e2a22] border-[#3f5647]/70';

  return (
    <header
      id="app-header"
      className={`${headerBgClass} text-white p-3.5 sm:p-4 shrink-0 shadow-lg border-b relative z-20 transition-colors duration-300`}
    >
      {/* Top row: Brand & Global Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3b5946] to-[#294233] flex items-center justify-center font-black text-xl text-white shadow-md ring-2 ring-[#4f755e]/40 shrink-0">
            🇸🇬
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight leading-none text-[#faf8f4] font-sans">
                Swee Lah
              </h1>
              <span className="text-[10px] bg-[#375241]/70 text-[#d4e4db] font-bold px-2 py-0.5 rounded-full border border-[#4d705a]/50 tracking-wider">
                SG ⇄ JB
              </span>
              {viewMode === 'web' && (
                <span className="text-[9px] bg-[#22332a] text-[#a5cfba] border border-[#3e5e4d] font-mono px-1.5 py-0.5 rounded">
                  WEB PORTAL
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#cfdad3] font-medium mt-0.5">
              Cross-Border Commute & Traffic Engine
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Eye Comfort Quick Toggle */}
          {onCycleEyeComfort && (
            <button
              id="eye-comfort-toggle-btn"
              onClick={() => {
                if (!isMuted) sound.playToggle();
                onCycleEyeComfort();
              }}
              title={`Current Eye Comfort: ${eyeComfortLabels[eyeComfortMode]}. Click to switch tone.`}
              className="bg-[#2d4235]/90 hover:bg-[#375141] text-[#e3ece6] px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border border-[#486754]/60 flex items-center gap-1.5 shadow-inner active:scale-95 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#a8d3bc]" />
              <span className="hidden sm:inline text-[11px] text-[#cfdad3]">Eyes:</span>
              <span className="text-[11px] font-extrabold text-[#d8eae0]">
                {eyeComfortLabels[eyeComfortMode]}
              </span>
            </button>
          )}

          {/* App / Web Version Switcher Pill */}
          <div
            id="view-mode-segmented-control"
            className="flex bg-[#16211a]/80 p-0.5 rounded-xl border border-[#395040]/60 shadow-inner"
          >
            <button
              id="view-mode-app-btn"
              onClick={() => onToggleViewMode('app')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'app'
                  ? 'bg-[#3b5f4a] text-white shadow font-extrabold'
                  : 'text-[#aabcb2] hover:text-white'
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
                  ? 'bg-[#3b5f4a] text-white shadow font-extrabold'
                  : 'text-[#aabcb2] hover:text-white'
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
            className="bg-[#2a3d31]/90 hover:bg-[#344b3c] text-[#e0ece5] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-[#456350]/60 flex items-center gap-1 shadow-inner active:scale-95 cursor-pointer"
          >
            <span className="text-[10px] opacity-70">CURR:</span>
            <span className="text-[#a4d4b9] font-extrabold">
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
            className="bg-[#223027]/90 hover:bg-[#2c3d32] text-[#bac9c1] p-2 rounded-xl text-xs transition-colors border border-[#3b4f42]/60 flex items-center justify-center cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#8a9b92]" /> : <Volume2 className="w-4 h-4 text-[#9ecab2]" />}
          </button>
        </div>
      </div>

      {/* Web Portal Navigation Bar (Visible in Web View on Medium+ screens) */}
      {viewMode === 'web' && onSelectTab && (
        <div className="hidden md:flex items-center gap-1.5 mb-3 pt-1 border-t border-[#3b5143]/50 overflow-x-auto pb-1">
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
                    ? 'bg-[#3b5f4a] text-white shadow-md font-extrabold'
                    : 'bg-[#1e2a22]/70 text-[#cfdad3] hover:bg-[#28382d] border border-[#3a4d3f]/40'
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
      <div className="bg-[#152019]/85 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between text-xs border border-[#384f40]/50 shadow-inner">
        {/* Woodlands */}
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <div className="text-[11px] leading-tight">
            <span className="text-[#aabcb2] font-medium">Woodlands: </span>
            <strong className="text-amber-300 font-bold">~{woodlands?.sgToMyTimeMin || 24}m</strong>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#334638]"></div>

        {/* Tuas */}
        <div className="flex items-center space-x-1.5">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#70b991]"></span>
          </span>
          <div className="text-[11px] leading-tight">
            <span className="text-[#aabcb2] font-medium">Tuas 2nd: </span>
            <strong className="text-[#92cdae] font-bold">~{tuas?.sgToMyTimeMin || 14}m</strong>
          </div>
        </div>

        <div className="h-4 w-[1px] bg-[#334638]"></div>

        {/* RTS Hub */}
        <div className="flex items-center space-x-1.5">
          <div className="text-[11px] leading-tight">
            <span className="text-[#aabcb2] font-medium">RTS: </span>
            <strong className="text-[#8ec1c9] font-bold">{rts?.sgToMyTimeMin || 5}m avg</strong>
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
          className="text-[#9bb0a5] hover:text-[#c4ded1] transition-transform active:rotate-180 p-0.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTraffic ? 'animate-spin text-[#92cdae]' : ''}`} />
        </button>
      </div>

      {/* Connectivity strip */}
      <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-[#a4b8ad] border-t border-[#384e40]/40 font-medium">
        <div className="flex items-center gap-1.5 text-[#8dc0a4]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#72b490]"></span>
          <span>Singpass & VEP Synced • LTA DataMall Live</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[#b5cbbf]">
            <span className="text-[9px] bg-[#293d31] px-1 rounded text-[#9fc7b1]">WeChat</span> Mini-App
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[#d9c79f]">
            <span className="text-[9px] bg-[#3c3423] px-1 rounded text-[#e0cf9b]">Kakao</span> Sync
          </span>
        </div>
      </div>
    </header>
  );
};

