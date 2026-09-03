import React, { useState } from 'react';
import { Currency, CarpoolRide } from '../types';
import { sound } from '../utils/audio';
import {
  Car,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface DriverTabProps {
  currency: Currency;
  isMuted: boolean;
  onOpenPostRide: () => void;
  onToast: (msg: string, type?: 'success' | 'alert' | 'info') => void;
  hostedRides: CarpoolRide[];
}

export const DriverTab: React.FC<DriverTabProps> = ({
  currency,
  isMuted,
  onOpenPostRide,
  onToast,
  hostedRides,
}) => {
  const [isDriverModeActive, setIsDriverModeActive] = useState<boolean>(true);
  const [partnerType, setPartnerType] = useState<'GetGo' | 'Tribecar' | 'Private'>('GetGo');
  const [passengerSeatsFilled, setPassengerSeatsFilled] = useState<number>(3);
  const [farePerSeat, setFarePerSeat] = useState<number>(18.0);

  const toggleDriverMode = () => {
    if (!isMuted) sound.playToggle();
    const nextState = !isDriverModeActive;
    setIsDriverModeActive(nextState);
    onToast(nextState ? 'Driver Host Mode Activated 🚗' : 'Switched back to Passenger Mode');
  };

  // Calculation for daily subsidy target
  const currLabel = currency === 'SGD' ? '$' : 'RM ';
  const rateMultiplier = currency === 'SGD' ? 1 : 3.5;
  const calculatedTotalEarnings = passengerSeatsFilled * farePerSeat * rateMultiplier;

  // Typical GetGo cross border costs in SGD
  const getGoSurchargeSGD = 15.0;
  const vepRoadChargeSGD = 6.0;
  const causewayTollsSGD = 4.5;
  const estimatedCostTotalSGD = getGoSurchargeSGD + vepRoadChargeSGD + causewayTollsSGD; // ~25.50 SGD
  const estimatedCostDisplay = estimatedCostTotalSGD * rateMultiplier;
  const netSurplus = calculatedTotalEarnings - estimatedCostDisplay;

  return (
    <div id="tab-driver" className="space-y-4 animate-in fade-in duration-200">
      {/* Driver Mode Activation Card */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-slate-800">Driver & Car-Sharing Host Mode</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                Host Tier 1
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Offset car rental fees, petrol, VEP & tolls by picking up verified commuters
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="driverModeToggle"
              checked={isDriverModeActive}
              onChange={toggleDriverMode}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>
      </div>

      {/* Partner Banner: GetGo / Tribecar / Private Owner Subsidy Engine */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-4 rounded-3xl shadow-xl space-y-3 border border-emerald-500/25">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-lg shadow-sm">
              GetGo
            </span>
            <span className="text-xs font-bold text-emerald-300">+ Cross-Border Host</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Partner
          </span>
        </div>

        {/* Daily Subsidy Target & Calculator */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Daily Subsidy & Trip Earnings
            </span>
            <span className="text-[10px] text-slate-400">Target: Fully Covered</span>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            {currLabel}{calculatedTotalEarnings.toFixed(2)}
            <span className="text-xs font-sans text-emerald-300 font-medium ml-1.5">/ round trip</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Covers GetGo MY Surcharge ($15), Causeway VEP & Tolls completely with {passengerSeatsFilled} passenger seats filled.
          </p>
        </div>

        {/* Interactive Seats & Rate Simulator */}
        <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Riders in your car:</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPassengerSeatsFilled(num)}
                  className={`w-6 h-6 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    passengerSeatsFilled === num
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span>Estimated Cross-Border Fixed Cost:</span>
            <span className="text-slate-400 font-mono">-{currLabel}{estimatedCostDisplay.toFixed(2)}</span>
          </div>

          <div className="border-t border-slate-800 pt-2 flex justify-between items-center text-xs">
            <span className="text-emerald-300 font-semibold">Net Driver Savings / Profit:</span>
            <span className="text-emerald-400 font-bold font-mono">
              +{currLabel}{Math.max(0, netSurplus).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Status Pills */}
        <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>GetGo MY Cross-Border Surcharge:</span>
            <span className="text-emerald-400 font-bold">Covered ✓</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>VEP Radio-Frequency Tag:</span>
            <span className="text-emerald-400 font-bold">Active RFID Tag Detected</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Singpass Driver Verification:</span>
            <span className="text-emerald-400 font-bold">Verified (Class 3)</span>
          </div>
        </div>

        <button
          id="post-ride-trigger-btn"
          onClick={() => {
            if (!isMuted) sound.playTap();
            onOpenPostRide();
          }}
          className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black py-3 rounded-2xl text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Carpool Schedule</span>
        </button>
      </div>

      {/* Hosted Rides & Schedules List */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Your Active Carpool Schedules ({hostedRides.length})
          </h3>
          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
            Live
          </span>
        </div>

        {hostedRides.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            You haven't posted any carpools yet. Click "Post Carpool Schedule" above to list your empty seats!
          </div>
        ) : (
          <div className="space-y-2">
            {hostedRides.map((r) => (
              <div
                key={r.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-extrabold text-slate-800">
                      {r.pickup.shortName} ➔ {r.dropoff.shortName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {r.departureTimeStr} • {r.driver.vehicleModel}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-emerald-800">
                    {currency === 'SGD' ? `$${r.seatPriceSGD.toFixed(2)}` : `RM ${r.seatPriceMYR.toFixed(2)}`} / seat
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {r.seatsAvailable} seat(s) open
                  </span>
                  <span className="text-slate-400">{r.notes || 'Quiet ride'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
