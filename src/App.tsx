import React, { useState } from 'react';
import { Currency, CarpoolRide, RouteStop, ActiveBooking, CheckpointStatus } from './types';
import { INITIAL_RIDES, INITIAL_CHECKPOINTS, INITIAL_ACTIVE_BOOKING, SG_STOPS, JB_STOPS } from './data/mockData';
import { Header } from './components/Header';
import { BookTab } from './components/BookTab';
import { PassTab } from './components/PassTab';
import { LiveGridTab } from './components/LiveGridTab';
import { DriverTab } from './components/DriverTab';
import { WalletTab } from './components/WalletTab';
import { ProfileTab } from './components/ProfileTab';
import { BookingConfirmModal } from './components/BookingConfirmModal';
import { PostRideModal } from './components/PostRideModal';
import { Toast, ToastData } from './components/Toast';
import { sound } from './utils/audio';
import {
  Car,
  QrCode,
  Activity,
  IdCard,
  Wallet as WalletIcon,
  User,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function App() {
  const [currency, setCurrency] = useState<Currency>('SGD');
  const [activeTab, setActiveTab] = useState<'book' | 'pass' | 'live' | 'driver' | 'wallet' | 'profile'>('book');
  const [rides, setRides] = useState<CarpoolRide[]>(INITIAL_RIDES);
  const [hostedRides, setHostedRides] = useState<CarpoolRide[]>([INITIAL_RIDES[1]]);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking>(INITIAL_ACTIVE_BOOKING);
  const [checkpoints, setCheckpoints] = useState<CheckpointStatus[]>(INITIAL_CHECKPOINTS);

  // UI state
  const [isPhoneMock, setIsPhoneMock] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isRefreshingTraffic, setIsRefreshingTraffic] = useState<boolean>(false);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRideForBooking, setSelectedRideForBooking] = useState<CarpoolRide | null>(null);
  const [bookingSeatCount, setBookingSeatCount] = useState(1);
  const [isPostRideModalOpen, setIsPostRideModalOpen] = useState(false);

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

  const handleRefreshTraffic = () => {
    setIsRefreshingTraffic(true);
    setTimeout(() => {
      setIsRefreshingTraffic(false);
      // slightly fluctuate queue times to simulate live traffic sensor
      setCheckpoints((prev) =>
        prev.map((c) => {
          if (c.id === 'woodlands') {
            const newTime = Math.max(18, Math.min(45, c.sgToMyTimeMin + (Math.random() > 0.5 ? 2 : -2)));
            return { ...c, sgToMyTimeMin: newTime, lastUpdated: 'Just now' };
          }
          if (c.id === 'tuas') {
            const newTime = Math.max(10, Math.min(25, c.sgToMyTimeMin + (Math.random() > 0.5 ? 1 : -1)));
            return { ...c, sgToMyTimeMin: newTime, lastUpdated: 'Just now' };
          }
          return c;
        })
      );
      showToast('Causeway queue wait times refreshed from checkpoint sensors.');
    }, 600);
  };

  const handleSelectRideToBook = (ride: CarpoolRide, seats: number) => {
    setSelectedRideForBooking(ride);
    setBookingSeatCount(seats);
    setIsBookingModalOpen(true);
  };

  const handleQuickBookFirstAvailable = (pickup: RouteStop, dropoff: RouteStop, seats: number) => {
    const targetRide = rides[0];
    if (targetRide) {
      setSelectedRideForBooking(targetRide);
      setBookingSeatCount(seats);
      setIsBookingModalOpen(true);
    }
  };

  const handleBookingConfirmed = (newBooking: ActiveBooking) => {
    setActiveBooking(newBooking);
    setActiveTab('pass');
    showToast(`Carpool Booked! Express Auto-Gate Pass #${newBooking.bookingId} generated.`);
  };

  const handleRideCreated = (newRide: CarpoolRide) => {
    setRides((prev) => [newRide, ...prev]);
    setHostedRides((prev) => [newRide, ...prev]);
    showToast(`Your carpool schedule (${newRide.pickup.shortName} ➔ ${newRide.dropoff.shortName}) is now live!`);
  };

  const handleReserveRtsFeeder = () => {
    showToast('RTS Feeder Van reserved at Bukit Chagar RTS Concourse Bay 4.');
  };

  const handleAutoFillSGAC = () => {
    setActiveBooking((prev) => ({ ...prev, sgacAutoFilled: true }));
  };

  const handleAutoFillMDAC = () => {
    setActiveBooking((prev) => ({ ...prev, mdacVerified: true }));
  };

  const navItems = [
    { id: 'book' as const, label: 'Match', icon: <Car className="w-5 h-5 mb-0.5" /> },
    { id: 'pass' as const, label: 'QR Pass', icon: <QrCode className="w-5 h-5 mb-0.5" /> },
    { id: 'live' as const, label: 'Live Grid', icon: <Activity className="w-5 h-5 mb-0.5" /> },
    { id: 'driver' as const, label: 'Host Mode', icon: <IdCard className="w-5 h-5 mb-0.5" /> },
    { id: 'wallet' as const, label: 'Wallet', icon: <WalletIcon className="w-5 h-5 mb-0.5" /> },
    { id: 'profile' as const, label: 'Profile', icon: <User className="w-5 h-5 mb-0.5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-0 md:p-6 font-sans antialiased text-slate-800">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.15),transparent)]"></div>

      {/* Main Container: Mobile Frame vs Wide Canvas */}
      <div
        className={`w-full ${
          isPhoneMock
            ? 'max-w-md h-screen md:h-[890px] md:rounded-[44px] md:border-[8px] md:border-slate-800 md:ring-1 md:ring-slate-700/50'
            : 'max-w-4xl min-h-[90vh] md:rounded-3xl md:border border-slate-800'
        } bg-slate-100 shadow-2xl flex flex-col overflow-hidden relative transition-all duration-300 z-10`}
      >
        {/* Header */}
        <Header
          currency={currency}
          onToggleCurrency={handleToggleCurrency}
          checkpoints={checkpoints}
          isPhoneMock={isPhoneMock}
          onTogglePhoneMock={() => setIsPhoneMock(!isPhoneMock)}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onRefreshTraffic={handleRefreshTraffic}
          isRefreshingTraffic={isRefreshingTraffic}
        />

        {/* Scrollable Main Body */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
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
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <nav
          id="app-bottom-nav"
          className="bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 py-2 shrink-0 z-30 shadow-lg"
        >
          <div className="grid grid-cols-6 gap-1 text-center">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    if (!isMuted && !isActive) sound.playTap();
                    setActiveTab(item.id);
                  }}
                  className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'text-emerald-800 font-extrabold scale-105'
                      : 'text-slate-400 hover:text-slate-600 font-medium'
                  }`}
                >
                  <div className={`transition-transform ${isActive ? 'scale-110 text-emerald-700' : ''}`}>
                    {item.icon}
                  </div>
                  <span className="text-[9px] tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>
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
    </div>
  );
}
