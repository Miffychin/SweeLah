import React, { useState } from 'react';
import { CarpoolRide, Currency, ActiveBooking } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, Clock, MapPin, Check, QrCode, CreditCard } from 'lucide-react';

interface BookingConfirmModalProps {
  ride: CarpoolRide;
  currency: Currency;
  seats: number;
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (newBooking: ActiveBooking) => void;
  isMuted: boolean;
}

export const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  ride,
  currency,
  seats,
  isOpen,
  onClose,
  onBookingConfirmed,
  isMuted,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'paynow' | 'tng' | 'wechat' | 'card'>('paynow');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const pricePerSeat = currency === 'SGD' ? ride.seatPriceSGD : ride.seatPriceMYR;
  const totalFare = pricePerSeat * seats;
  const currLabel = currency === 'SGD' ? '$' : 'RM ';
  const privateTaxiSGD = 100.0;
  const privateTaxiTotal = (currency === 'SGD' ? privateTaxiSGD : privateTaxiSGD * 3.5) * (seats > 1 ? 1 : 1);
  const savingsPercent = Math.round(((privateTaxiTotal - totalFare) / privateTaxiTotal) * 100);

  const handleConfirm = () => {
    if (!isMuted) sound.playTap();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      if (!isMuted) sound.playSuccess();
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }

      const randomCode = `CWY·${seats}·${Math.floor(100 + Math.random() * 900)}`;
      const randomPoolId = `SW-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBooking: ActiveBooking = {
        bookingId: randomPoolId,
        ride,
        seatsBooked: seats,
        totalFareSGD: ride.seatPriceSGD * seats,
        totalFareMYR: ride.seatPriceMYR * seats,
        bookedAt: 'Just now',
        status: 'confirmed',
        passCode: randomCode,
        mdacVerified: true,
        sgacAutoFilled: true,
        pickupBay: `${ride.pickup.shortName} Pick-up Concourse (Bay 2)`,
        driverEtaMinutes: ride.departsInMinutes || 5,
      };

      onBookingConfirmed(newBooking);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="font-bold text-sm tracking-tight text-white">Confirm Swee Lah Carpool</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Driver & Route Header */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`w-10 h-10 rounded-full ${ride.driver.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                  {ride.driver.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-800">{ride.driver.name}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" /> VEP
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{ride.driver.vehicleModel} • {ride.driver.plateNumber}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-700">★ {ride.driver.rating}</div>
                <div className="text-[10px] text-slate-400">{ride.driver.tripCount} trips</div>
              </div>
            </div>

            {/* Route path */}
            <div className="pt-2 border-t border-slate-200/60 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Pick-up</div>
                  <div className="font-bold text-slate-800">{ride.pickup.name}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Drop-off</div>
                  <div className="font-bold text-slate-800">{ride.dropoff.name}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Departure details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-emerald-50/70 border border-emerald-200/60 p-2.5 rounded-xl">
              <span className="text-[10px] text-emerald-700 uppercase font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" /> Estimated Departure
              </span>
              <div className="text-sm font-black text-emerald-950 mt-0.5">
                {ride.departureTimeStr} <span className="text-[11px] font-normal text-emerald-700">({ride.departsInMinutes}m)</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Seats Reserved</span>
              <div className="text-sm font-black text-slate-800 mt-0.5">
                {seats} {seats > 1 ? 'Passenger Seats' : 'Single Seat'}
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl space-y-2 border border-slate-800">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>Seat Fare ({seats} seat{seats > 1 ? 's' : ''}):</span>
              <span className="font-mono">{currLabel}{totalFare.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span>VEP & Causeway Toll Split:</span>
              <span className="text-emerald-400 font-medium">Included ✓</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Total Payable:</span>
                <span className="text-[10px] text-emerald-400 font-medium">🔥 Saves {savingsPercent}% vs Private Taxi</span>
              </div>
              <div className="text-xl font-black text-white">
                {currLabel}{totalFare.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Payment Rail
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('paynow')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'paynow'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded bg-rose-600 text-[9px] text-white flex items-center justify-center font-black">
                  PN
                </div>
                <div className="text-xs leading-tight">
                  <div>PayNow (SG)</div>
                  <span className="text-[10px] opacity-70 font-normal">Instant 0% fee</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tng')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'tng'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded bg-blue-600 text-[9px] text-white flex items-center justify-center font-black">
                  TNG
                </div>
                <div className="text-xs leading-tight">
                  <div>Touch 'n Go (MY)</div>
                  <span className="text-[10px] opacity-70 font-normal">Auto-convert MYR</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wechat')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'wechat'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-5 h-5 rounded bg-green-600 text-[9px] text-white flex items-center justify-center font-black">
                  微
                </div>
                <div className="text-xs leading-tight">
                  <div>WeChat / Kakao</div>
                  <span className="text-[10px] opacity-70 font-normal">Cross-border QR</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-slate-600" />
                <div className="text-xs leading-tight">
                  <div>Visa / Mastercard</div>
                  <span className="text-[10px] opacity-70 font-normal">Linked •••• 4912</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80">
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-2xl text-sm shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Confirming with Driver...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4" />
                <span>Confirm & Generate Fast-Track Pass</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
