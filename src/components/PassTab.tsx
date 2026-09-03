import React, { useState } from 'react';
import { ActiveBooking, Currency } from '../types';
import { sound } from '../utils/audio';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Car,
  AlertTriangle,
  PhoneCall,
  Share2,
  Sparkles,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

interface PassTabProps {
  booking: ActiveBooking;
  currency: Currency;
  isMuted: boolean;
  onToast: (msg: string, type?: 'success' | 'alert' | 'info') => void;
  onAutoFillSGAC: () => void;
  onAutoFillMDAC: () => void;
}

export const PassTab: React.FC<PassTabProps> = ({
  booking,
  currency,
  isMuted,
  onToast,
  onAutoFillSGAC,
  onAutoFillMDAC,
}) => {
  const [isQrZoomed, setIsQrZoomed] = useState(false);
  const [isVerifyingSGAC, setIsVerifyingSGAC] = useState(false);
  const [isVerifyingMDAC, setIsVerifyingMDAC] = useState(false);
  const [showDriverChat, setShowDriverChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'driver'; text: string; time: string }>>([
    { sender: 'driver', text: "Hi! I'm reaching Woodlands North Exit B Taxi bay in ~4 mins. See you there!", time: '5:48 PM' },
  ]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    if (!isMuted) sound.playTap();
    const newMsg = { sender: 'user' as const, text: chatInput, time: 'Just now' };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      if (!isMuted) sound.playSuccess();
      setChatMessages((prev) => [
        ...prev,
        { sender: 'driver' as const, text: 'Noted! Silver Toyota Wish with hazard lights on.', time: 'Just now' },
      ]);
    }, 1000);
  };

  const handleScanPass = () => {
    if (!isMuted) sound.playSuccess();
    onToast('Pass verified for Auto-Gate Biometrics lane clearance!');
  };

  const handleSGACClick = () => {
    if (!isMuted) sound.playTap();
    setIsVerifyingSGAC(true);
    setTimeout(() => {
      setIsVerifyingSGAC(false);
      onAutoFillSGAC();
      if (!isMuted) sound.playSuccess();
      onToast('SG Arrival Card auto-synced with Singpass!');
    }, 800);
  };

  const handleMDACClick = () => {
    if (!isMuted) sound.playTap();
    setIsVerifyingMDAC(true);
    setTimeout(() => {
      setIsVerifyingMDAC(false);
      onAutoFillMDAC();
      if (!isMuted) sound.playSuccess();
      onToast('MDAC Malaysia Digital Card pre-cleared for pool!');
    }, 800);
  };

  return (
    <div id="tab-pass" className="space-y-4 animate-in fade-in duration-200">
      {/* Alert Strip for Border Requirements */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 text-[11px] leading-relaxed">
          <strong className="font-bold text-amber-950">Border Pre-Check: </strong>
          Ensure passport is valid (&gt;6 months). MDAC is required for non-Malaysian passports entering Johor Bahru.
        </div>
      </div>

      {/* Main Express Auto-Gate Pass Card */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
        <div className="flex justify-between items-center">
          <span className="bg-emerald-100 text-emerald-900 font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3 text-emerald-700" />
            Express Auto-Gate Pass
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Pool ID: <strong className="text-slate-800 font-mono font-bold">#{booking.bookingId}</strong>
          </span>
        </div>

        {/* QR Code Container */}
        <div
          onClick={() => {
            if (!isMuted) sound.playTap();
            setIsQrZoomed(true);
          }}
          className="p-5 bg-gradient-to-b from-slate-900 to-emerald-950 rounded-3xl inline-block shadow-xl relative group border-2 border-emerald-500/30 cursor-pointer transition-transform hover:scale-[1.02]"
          title="Click to zoom Auto-Gate QR pass"
        >
          <div className="w-48 h-48 bg-white rounded-2xl p-3 flex flex-col justify-between items-center relative shadow-inner overflow-hidden">
            {/* Simulated Scanning Laser */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse"></div>

            {/* Pattern Grid imitating Biometric QR */}
            <div className="w-full h-full bg-[radial-gradient(#0f172a_2.5px,transparent_2.5px)] [background-size:12px_12px] flex items-center justify-center relative">
              {/* Corner Targets */}
              <div className="absolute top-1 left-1 w-6 h-6 border-4 border-slate-900 rounded-sm"></div>
              <div className="absolute top-1 right-1 w-6 h-6 border-4 border-slate-900 rounded-sm"></div>
              <div className="absolute bottom-1 left-1 w-6 h-6 border-4 border-slate-900 rounded-sm"></div>

              {/* Center Logo */}
              <div className="w-12 h-12 bg-emerald-900 rounded-xl flex flex-col items-center justify-center text-emerald-400 font-black text-xs shadow-md border border-emerald-500">
                <span className="text-[10px] tracking-widest leading-none">SWEE</span>
                <span className="text-[7px] text-emerald-300 font-medium">LAH</span>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <div className="text-sm font-black font-mono text-emerald-400 tracking-widest">
              {booking.passCode}
            </div>
            <p className="text-[10px] text-emerald-300/80 font-medium flex items-center justify-center gap-1">
              <QrCode className="w-3 h-3 text-emerald-400" /> Consolidates {booking.seatsBooked} Pooled Pass(es)
            </p>
          </div>

          <div className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <p className="text-xs text-slate-500 px-3 leading-relaxed">
          Scan at Woodlands / Tuas automated biometrics lanes. Pooled group pass speeds up customs clearance by{' '}
          <strong className="text-emerald-800 font-bold">4x</strong>.
        </p>

        <div className="flex justify-center gap-2">
          <button
            onClick={handleScanPass}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Test Scan Pass
          </button>
          <button
            onClick={() => {
              if (!isMuted) sound.playTap();
              onToast('Share link copied to clipboard!');
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Pass
          </button>
        </div>

        {/* Customs Status Sync Checklist */}
        <div className="border-t border-slate-100 pt-3 space-y-2.5 text-left">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
            <span>Customs Status Sync</span>
            <span className="text-[10px] text-emerald-700 font-bold">2 of 2 Ready</span>
          </div>

          {/* MDAC */}
          <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 rounded-2xl border border-emerald-200">
            <div className="flex items-center space-x-2.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800">MDAC (Malaysia Digital Arrival)</div>
                <div className="text-[10px] text-slate-500">Auto-filled via passport biometrics</div>
              </div>
            </div>
            {booking.mdacVerified ? (
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                VERIFIED
              </span>
            ) : (
              <button
                onClick={handleMDACClick}
                disabled={isVerifyingMDAC}
                className="text-[10px] font-bold text-white bg-emerald-700 hover:bg-emerald-600 px-2.5 py-1 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                {isVerifyingMDAC ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Pre-Fill'}
              </button>
            )}
          </div>

          {/* SGAC */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center space-x-2.5 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-800">SG Arrival Card (SGAC)</div>
                <div className="text-[10px] text-slate-500">Auto-synced with Singpass identity</div>
              </div>
            </div>
            {booking.sgacAutoFilled ? (
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                SYNCED
              </span>
            ) : (
              <button
                onClick={handleSGACClick}
                disabled={isVerifyingSGAC}
                className="text-[10px] font-bold text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                {isVerifyingSGAC ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Auto-Fill'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trip Timeline Card */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Live Trip Progress
          </h3>
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
            Driver Approaching
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {/* Driver ETA */}
          <div className="flex items-start space-x-3 text-xs">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <Car className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-800">
                {booking.ride.driver.name} is {booking.driverEtaMinutes} min away
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {booking.ride.driver.vehicleModel} • {booking.ride.driver.plateNumber}
              </div>
            </div>
            <button
              onClick={() => setShowDriverChat(!showDriverChat)}
              className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
            >
              Chat
            </button>
          </div>

          {/* Driver chat box if toggled */}
          {showDriverChat && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs animate-in fade-in">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Direct Driver Message</div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {chatMessages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl text-xs ${
                      m.sender === 'user'
                        ? 'bg-emerald-700 text-white ml-6 text-right'
                        : 'bg-white text-slate-800 mr-6 border border-slate-200'
                    }`}
                  >
                    <div>{m.text}</div>
                    <span className="text-[9px] opacity-70 mt-0.5 block">{m.time}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendChat} className="flex gap-1.5 pt-1">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Message driver..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Pickup */}
          <div className="flex items-start space-x-3 text-xs">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div>
              <div className="font-bold text-slate-800">Boarding Point</div>
              <div className="text-[11px] text-slate-500">{booking.pickupBay}</div>
            </div>
          </div>

          {/* Checkpoint Clearance */}
          <div className="flex items-start space-x-3 text-xs">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-slate-800">Checkpoint Fast-Track</div>
              <div className="text-[11px] text-slate-500">Grouped 4-in-1 QR scan • est. 45 sec booth stop</div>
            </div>
          </div>

          {/* Drop-off */}
          <div className="flex items-start space-x-3 text-xs">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div>
              <div className="font-bold text-slate-800">Drop-off Destination</div>
              <div className="text-[11px] text-slate-500">{booking.ride.dropoff.name} (ETA ~6:20 PM)</div>
            </div>
          </div>
        </div>

        {/* Action button row */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              if (!isMuted) sound.playAlert();
              onToast('Emergency SOS dispatch alerted to Swee Lah 24/7 Security.');
            }}
            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>24/7 Safety SOS</span>
          </button>
          <span className="text-[11px] text-slate-400">
            Total Paid: <strong className="text-slate-700">{currency === 'SGD' ? `$${booking.totalFareSGD.toFixed(2)} SGD` : `RM ${booking.totalFareMYR.toFixed(2)} MYR`}</strong>
          </span>
        </div>
      </div>

      {/* QR Zoom Modal */}
      {isQrZoomed && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 text-white p-6 rounded-3xl max-w-xs w-full text-center space-y-4 animate-in zoom-in-90">
            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              FAST-TRACK CLEARANCE PASS
            </div>
            <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl">
              <div className="w-56 h-56 bg-[radial-gradient(#0f172a_3px,transparent_3px)] [background-size:14px_14px] flex items-center justify-center relative">
                <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex flex-col items-center justify-center text-emerald-400 font-black text-sm shadow-lg border-2 border-emerald-500">
                  SWEE
                </div>
              </div>
            </div>
            <div className="font-mono text-xl font-extrabold text-emerald-300">
              {booking.passCode}
            </div>
            <p className="text-xs text-slate-300">
              Hold device facing the customs camera scanner at Woodlands / Tuas auto-gate.
            </p>
            <button
              onClick={() => setIsQrZoomed(false)}
              className="w-full bg-emerald-500 text-slate-950 font-black py-2.5 rounded-xl cursor-pointer hover:bg-emerald-400 transition-colors text-xs"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
