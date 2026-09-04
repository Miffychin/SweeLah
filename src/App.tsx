import React, { useState, useEffect } from 'react';
import {
  Currency,
  CarpoolRide,
  ActiveBooking,
  CheckpointStatus,
  ViewMode,
  EyeComfortMode,
} from './types';
import { INITIAL_RIDES, INITIAL_ACTIVE_BOOKING, INITIAL_CHECKPOINTS } from './data/mockData';
import { sound } from './utils/audio';
import { Header } from './components/Header';
import { BookTab } from './components/BookTab';
import { PassTab } from './components/PassTab';
import { LiveGridTab } from './components/LiveGridTab';
import { DriverTab } from './components/DriverTab';
import { WalletTab } from './components/WalletTab';
import { ProfileTab } from './components/ProfileTab';
import { TalkToUsTab } from './components/TalkToUsTab';
import { BookingConfirmModal } from './components/BookingConfirmModal';
import { PostRideModal } from './components/PostRideModal';
import { Toast, ToastData } from './components/Toast';
import {
  Car,
  QrCode,
  Activity,
  IdCard,
  Wallet as WalletIcon,
  User,
  MessageSquare,
  Smartphone,
  Monitor,
  Wifi,
  Battery,
  Signal,
} from 'lucide-react';

export default function App() {
  const [currency, setCurrency] = useState<Currency>('SGD');
  const [activeTab, setActiveTab] = useState<'book' | 'pass' | 'live' | 'driver' | 'wallet' | 'profile' | 'talk'>('book');
  const [rides, setRides] = useState<CarpoolRide[]>(INITIAL_RIDES);
  const [hostedRides, setHostedRides] = useState<CarpoolRide[]>([INITIAL_RIDES[1]]);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking>(INITIAL_ACTIVE_BOOKING);
  const [checkpoints, setCheckpoints] = useState<CheckpointStatus[]>(INITIAL_CHECKPOINTS);

  // App vs Web view switching
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('sweelah_view_mode');
      if (saved === 'app' || saved === 'web') return saved;
    } catch {
      // ignore
    }
    return 'app';
  });

  // Eye Comfort Mode: 'sage' (Default Sage & Linen Paper), 'sepia' (Warm Book Sepia), or 'night' (Matte Olive Dark)
  const [eyeComfortMode, setEyeComfortMode] = useState<EyeComfortMode>(() => {
    try {
      const saved = localStorage.getItem('sweelah_eye_comfort_mode');
      if (saved === 'sage' || saved === 'sepia' || saved === 'night') return saved;
    } catch {
      // ignore
    }
    return 'sage'; // Default to Sage & Linen Paper: scientifically engineered for eye comfort
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isRefreshingTraffic, setIsRefreshingTraffic] = useState<boolean>(false);
  const [deviceTime, setDeviceTime] = useState<string>('9:41 AM');

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRideForBooking, setSelectedRideForBooking] = useState<CarpoolRide | null>(null);
  const [bookingSeatCount, setBookingSeatCount] = useState(1);
  const [isPostRideModalOpen, setIsPostRideModalOpen] = useState(false);

  // Simulated mobile status bar clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDeviceTime(
        now.toLocaleTimeString('en-SG', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      message,
      type,
    });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const handleToggleCurrency = () => {
    const next = currency === 'SGD' ? 'MYR' : 'SGD';
    setCurrency(next);
    showToast(`Currency switched to ${next} (${next === 'SGD' ? '$' : 'RM'})`);
  };

  const handleToggleViewMode = (targetMode?: ViewMode) => {
    const nextMode: ViewMode = targetMode || (viewMode === 'app' ? 'web' : 'app');
    if (!isMuted) sound.playToggle();
    setViewMode(nextMode);
    try {
      localStorage.setItem('sweelah_view_mode', nextMode);
    } catch {
      // ignore
    }
    showToast(
      nextMode === 'web'
        ? '💻 Switched to Web Portal Version (Expanded Desktop Canvas)'
        : '📱 Switched to Mobile App Version (Native Phone Frame)',
      'info'
    );
  };

  const handleCycleEyeComfort = () => {
    const modes: EyeComfortMode[] = ['sage', 'sepia', 'night'];
    const nextIdx = (modes.indexOf(eyeComfortMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    if (!isMuted) sound.playToggle();
    setEyeComfortMode(nextMode);
    try {
      localStorage.setItem('sweelah_eye_comfort_mode', nextMode);
    } catch {
      // ignore
    }
    const modeLabels: Record<EyeComfortMode, string> = {
      sage: 'Sage Paper (Anti-Glare Natural Tone)',
      sepia: 'Warm Sepia (Evening Book Comfort)',
      night: 'Soft Night (Matte Dark Olive)',
    };
    showToast(`Eye comfort: ${modeLabels[nextMode]}`, 'info');
  };

  const handleSetEyeComfort = (mode: EyeComfortMode) => {
    if (!isMuted) sound.playToggle();
    setEyeComfortMode(mode);
    try {
      localStorage.setItem('sweelah_eye_comfort_mode', mode);
    } catch {
      // ignore
    }
    const modeLabels: Record<EyeComfortMode, string> = {
      sage: 'Sage Paper (Anti-Glare Natural Tone)',
      sepia: 'Warm Sepia (Evening Book Comfort)',
      night: 'Soft Night (Matte Dark Olive)',
    };
    showToast(`Eye comfort: ${modeLabels[mode]}`, 'info');
  };

  // Sync eye-comfort attribute to html root for universal theme cascading
  useEffect(() => {
    document.documentElement.setAttribute('data-eye-comfort', eyeComfortMode);
  }, [eyeComfortMode]);

  const handleRefreshTraffic = () => {
    setIsRefreshingTraffic(true);
    setTimeout(() => {
      setIsRefreshingTraffic(false);
      // slightly fluctuate queue times to simulate live traffic sensor
      setCheckpoints((prev) =>
        prev.map((c) => {
          if (c.id === 'woodlands') {
            const fluctuation = Math.floor(Math.random() * 5) - 2;
            const newTime = Math.max(15, Math.min(65, c.sgToMyTimeMin + fluctuation));
            return {
              ...c,
              sgToMyTimeMin: newTime,
              status: newTime > 45 ? 'heavy' : newTime > 25 ? 'moderate' : 'clear',
              lastUpdated: 'Just now',
            };
          }
          if (c.id === 'tuas') {
            const fluctuation = Math.floor(Math.random() * 3) - 1;
            const newTime = Math.max(8, Math.min(40, c.sgToMyTimeMin + fluctuation));
            return {
              ...c,
              sgToMyTimeMin: newTime,
              lastUpdated: 'Just now',
            };
          }
          return c;
        })
      );
      if (!isMuted) sound.playSuccess();
      showToast('Live causeway wait times refreshed', 'info');
    }, 800);
  };

  const handleSelectRideToBook = (ride: CarpoolRide) => {
    setSelectedRideForBooking(ride);
    setBookingSeatCount(1);
    setIsBookingModalOpen(true);
  };

  const handleQuickBookFirstAvailable = () => {
    const available = rides.find((r) => r.seatsAvailable > 0);
    if (available) {
      handleSelectRideToBook(available);
    } else {
      showToast('No seats currently available for Instant Match', 'alert');
    }
  };

  const handleBookingConfirmed = (ride: CarpoolRide, seats: number) => {
    setRides((prev) =>
      prev.map((r) => (r.id === ride.id ? { ...r, seatsAvailable: Math.max(0, r.seatsAvailable - seats) } : r))
    );

    setActiveBooking({
      bookingId: `BK-${Date.now().toString().slice(-4)}`,
      ride,
      seatsBooked: seats,
      totalFareSGD: ride.seatPriceSGD * seats,
      totalFareMYR: ride.seatPriceMYR * seats,
      bookedAt: 'Just now',
      status: 'confirmed',
      passCode: `SL-${Math.floor(1000 + Math.random() * 9000)}`,
      mdacVerified: true,
      sgacAutoFilled: true,
      pickupBay: 'Pick-up Bay B2 (Opposite Taxi Stand)',
      driverEtaMinutes: 8,
    });

    setIsBookingModalOpen(false);
    setActiveTab('pass');
    showToast(`Booking confirmed for ${seats} seat(s)! Customs Pass ready.`);
  };

  const handleRideCreated = (newRide: CarpoolRide) => {
    setRides((prev) => [newRide, ...prev]);
    setHostedRides((prev) => [newRide, ...prev]);
    setIsPostRideModalOpen(false);
    showToast(`Ride published! SG ⇄ JB route listed.`);
  };

  const handleAutoFillSGAC = () => {
    showToast('SG Arrival Card (SGAC) profile auto-populated via Singpass!', 'success');
  };

  const handleAutoFillMDAC = () => {
    showToast('Malaysia Digital Arrival Card (MDAC) pre-cleared for biometric e-Gate!', 'success');
  };

  const handleReserveRtsFeeder = () => {
    setActiveTab('book');
    showToast('RTS Link connection filter applied. Showing rides with RTS synergy.', 'info');
  };

  const navItems = [
    { id: 'book' as const, label: 'Match', icon: <Car className="w-5 h-5 mb-0.5" /> },
    { id: 'pass' as const, label: 'QR Pass', icon: <QrCode className="w-5 h-5 mb-0.5" /> },
    { id: 'live' as const, label: 'Live Grid', icon: <Activity className="w-5 h-5 mb-0.5" /> },
    { id: 'driver' as const, label: 'Host Mode', icon: <IdCard className="w-5 h-5 mb-0.5" /> },
    { id: 'wallet' as const, label: 'Wallet', icon: <WalletIcon className="w-5 h-5 mb-0.5" /> },
    { id: 'profile' as const, label: 'Profile', icon: <User className="w-5 h-5 mb-0.5" /> },
    { id: 'talk' as const, label: 'Talk to Us', icon: <MessageSquare className="w-5 h-5 mb-0.5" /> },
  ];

  // Eye comfort theme palette classes
  const outerBgClass =
    eyeComfortMode === 'sepia'
      ? 'bg-[#201813]'
      : eyeComfortMode === 'night'
      ? 'bg-[#101512]'
      : 'bg-[#18211c]';

  const shellThemeClass =
    eyeComfortMode === 'sepia'
      ? 'bg-[#f2ebd9] text-[#2c221a] md:border-[#382b20] md:ring-[#523e2d]/60'
      : eyeComfortMode === 'night'
      ? 'bg-[#1b231e] text-[#e2e8e4] md:border-[#222c26] md:ring-[#2f3d35]/60'
      : 'bg-[#f4f2eb] text-[#222c26] md:border-[#2b3a30] md:ring-[#3d5144]/60';

  const statusBarBgClass =
    eyeComfortMode === 'sepia'
      ? 'bg-[#35251a] text-[#f2e5d5]'
      : eyeComfortMode === 'night'
      ? 'bg-[#141b16] text-[#c9d6ce]'
      : 'bg-[#223329] text-[#e2ede5]';

  const bottomNavClass =
    eyeComfortMode === 'sepia'
      ? 'bg-[#f7f1e6]/95 border-t border-[#e5dcce]'
      : eyeComfortMode === 'night'
      ? 'bg-[#17201a]/95 border-t border-[#26332a]'
      : 'bg-[#faf8f3]/95 border-t border-[#e3dcd0]';

  return (
    <div
      className={`min-h-screen ${outerBgClass} flex flex-col items-center justify-center p-0 md:p-4 lg:p-6 font-sans antialiased relative transition-colors duration-300`}
    >
      {/* Background ambient lighting tailored to eye comfort */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background:
            eyeComfortMode === 'sepia'
              ? 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(160, 110, 60, 0.16), transparent)'
              : eyeComfortMode === 'night'
              ? 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(45, 75, 55, 0.20), transparent)'
              : 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(75, 115, 92, 0.18), transparent)',
        }}
      ></div>
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background:
            eyeComfortMode === 'sepia'
              ? 'radial-gradient(ellipse 60% 40% at 50% 120%, rgba(130, 95, 60, 0.10), transparent)'
              : eyeComfortMode === 'night'
              ? 'radial-gradient(ellipse 60% 40% at 50% 120%, rgba(30, 48, 38, 0.15), transparent)'
              : 'radial-gradient(ellipse 60% 40% at 50% 120%, rgba(145, 135, 100, 0.10), transparent)',
        }}
      ></div>

      {/* Main Container: Mobile App Phone Shell vs Wide Web Portal */}
      <div
        data-eye-comfort={eyeComfortMode}
        className={`w-full ${
          viewMode === 'app'
            ? 'max-w-md h-screen md:h-[890px] md:rounded-[50px] md:border-[10px] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] md:ring-1'
            : 'max-w-6xl xl:max-w-7xl min-h-[92vh] md:rounded-3xl md:border md:shadow-2xl'
        } ${shellThemeClass} flex flex-col overflow-hidden relative transition-all duration-300 z-10`}
      >
        {/* Mobile Smartphone Status Bar (Visible in App mode on Desktop) */}
        {viewMode === 'app' && (
          <div
            className={`hidden md:flex items-center justify-between px-7 pt-2.5 pb-1 ${statusBarBgClass} text-[11px] font-semibold select-none shrink-0 z-30 transition-colors duration-200`}
          >
            <span className="font-mono tracking-tight">{deviceTime}</span>

            {/* Dynamic Island Speaker Pill */}
            <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-4 py-1 rounded-full shadow-inner">
              <span className="w-2.5 h-2.5 rounded-full bg-black/70 border border-white/10"></span>
              <span className="w-10 h-1.5 rounded-full bg-white/20"></span>
            </div>

            <div className="flex items-center gap-1.5 opacity-90 font-mono text-[10px]">
              <Signal className="w-3 h-3" />
              <span>5G</span>
              <Wifi className="w-3 h-3 ml-0.5" />
              <Battery className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        )}

        {/* Global Application Header */}
        <Header
          currency={currency}
          onToggleCurrency={handleToggleCurrency}
          checkpoints={checkpoints}
          viewMode={viewMode}
          onToggleViewMode={handleToggleViewMode}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onRefreshTraffic={handleRefreshTraffic}
          isRefreshingTraffic={isRefreshingTraffic}
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          eyeComfortMode={eyeComfortMode}
          onCycleEyeComfort={handleCycleEyeComfort}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-4 lg:p-6 space-y-4 scroll-smooth">
          {activeTab === 'book' && (
            <BookTab
              currency={currency}
              rides={rides}
              onSelectRideToBook={handleSelectRideToBook}
              onQuickBookFirstAvailable={handleQuickBookFirstAvailable}
              isMuted={isMuted}
              onToast={showToast}
            />
          )}

          {activeTab === 'pass' && (
            <PassTab
              booking={activeBooking}
              currency={currency}
              isMuted={isMuted}
              onToast={showToast}
              onAutoFillSGAC={handleAutoFillSGAC}
              onAutoFillMDAC={handleAutoFillMDAC}
            />
          )}

          {activeTab === 'live' && (
            <LiveGridTab
              checkpoints={checkpoints}
              isMuted={isMuted}
              onToast={showToast}
              onReserveRtsFeeder={handleReserveRtsFeeder}
              viewMode={viewMode}
            />
          )}

          {activeTab === 'driver' && (
            <DriverTab
              currency={currency}
              isMuted={isMuted}
              onOpenPostRide={() => setIsPostRideModalOpen(true)}
              onToast={showToast}
              hostedRides={hostedRides}
            />
          )}

          {activeTab === 'wallet' && (
            <WalletTab
              currency={currency}
              isMuted={isMuted}
              onToast={showToast}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              currency={currency}
              isMuted={isMuted}
              onToast={showToast}
              eyeComfortMode={eyeComfortMode}
              onSetEyeComfort={handleSetEyeComfort}
            />
          )}

          {activeTab === 'talk' && (
            <TalkToUsTab
              isMuted={isMuted}
              onToast={showToast}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav
          id="app-bottom-nav"
          className={`${bottomNavClass} backdrop-blur-md px-1 py-2 shrink-0 z-30 shadow-lg transition-colors duration-200`}
        >
          <div className="grid grid-cols-7 gap-0.5 text-center max-w-2xl mx-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const activeTextColor =
                eyeComfortMode === 'sepia'
                  ? 'text-[#874e1d] font-extrabold scale-105'
                  : eyeComfortMode === 'night'
                  ? 'text-[#56ab80] font-extrabold scale-105'
                  : 'text-[#264b36] font-extrabold scale-105';

              const inactiveTextColor =
                eyeComfortMode === 'sepia'
                  ? 'text-[#857467] hover:text-[#874e1d] font-medium'
                  : eyeComfortMode === 'night'
                  ? 'text-[#7e8e84] hover:text-[#56ab80] font-medium'
                  : 'text-[#708075] hover:text-[#264b36] font-medium';

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    if (!isMuted && !isActive) sound.playTap();
                    setActiveTab(item.id);
                  }}
                  className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
                    isActive ? activeTextColor : inactiveTextColor
                  }`}
                >
                  <div className={`transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </div>
                  <span className="text-[8px] sm:text-[9px] tracking-tight whitespace-nowrap leading-tight mt-0.5">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Simulated Home Indicator Bar for Mobile App Shell */}
          {viewMode === 'app' && (
            <div
              className={`hidden md:block w-32 h-1 rounded-full mx-auto mt-2 transition-colors ${
                eyeComfortMode === 'night' ? 'bg-[#314035]' : 'bg-[#d5cfc2]'
              }`}
            ></div>
          )}
        </nav>

        {/* Floating Toast Notification */}
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Booking Confirmation Modal */}
        {selectedRideForBooking && (
          <BookingConfirmModal
            ride={selectedRideForBooking}
            currency={currency}
            seats={bookingSeatCount}
            isOpen={isBookingModalOpen}
            onClose={() => setIsBookingModalOpen(false)}
            onBookingConfirmed={handleBookingConfirmed}
            isMuted={isMuted}
          />
        )}

        {/* Driver Post Ride Modal */}
        <PostRideModal
          isOpen={isPostRideModalOpen}
          onClose={() => setIsPostRideModalOpen(false)}
          currency={currency}
          onRideCreated={handleRideCreated}
          isMuted={isMuted}
        />
      </div>

      {/* Floating Quick View Switcher Pill (Always accessible on screen) */}
      <div className="fixed bottom-4 right-4 z-40 hidden sm:flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 text-white p-1.5 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md transition-all active:scale-95">
        <button
          onClick={() => handleToggleViewMode()}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white cursor-pointer"
          title={viewMode === 'app' ? 'Click to expand to Web Portal Version' : 'Click to switch to Mobile App Shell'}
        >
          {viewMode === 'app' ? (
            <>
              <Monitor className="w-4 h-4 text-emerald-400" />
              <span>Switch to Web Portal</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Switch to App View</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
