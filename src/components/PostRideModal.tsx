import React, { useState } from 'react';
import { RouteStop, CarpoolRide, Currency, PoolDriver } from '../types';
import { SG_STOPS, JB_STOPS } from '../data/mockData';
import { sound } from '../utils/audio';
import { X, Car, PlusCircle, Check, ArrowRightLeft } from 'lucide-react';

interface PostRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onRideCreated: (newRide: CarpoolRide) => void;
  isMuted: boolean;
}

export const PostRideModal: React.FC<PostRideModalProps> = ({
  isOpen,
  onClose,
  currency,
  onRideCreated,
  isMuted,
}) => {
  const [direction, setDirection] = useState<'SG_TO_JB' | 'JB_TO_SG'>('SG_TO_JB');
  const [pickupId, setPickupId] = useState<string>(SG_STOPS[0].id);
  const [dropoffId, setDropoffId] = useState<string>(JB_STOPS[0].id);
  const [driverName, setDriverName] = useState('Alex Teo');
  const [vehicleModel, setVehicleModel] = useState('GetGo Toyota Sienta (7-Seater)');
  const [plateNumber, setPlateNumber] = useState('SLU 7731 R');
  const [hostProvider, setHostProvider] = useState<'GetGo' | 'Tribecar' | 'Private Owner' | 'BlueSG'>('GetGo');
  const [seatsAvailable, setSeatsAvailable] = useState<number>(3);
  const [priceInput, setPriceInput] = useState<number>(16.0);
  const [departsInMinutes, setDepartsInMinutes] = useState<number>(20);
  const [isQuiet, setIsQuiet] = useState<boolean>(true);
  const [isFemaleOnly, setIsFemaleOnly] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('GetGo MY cross-border surcharge covered. Clean & quiet ride.');

  if (!isOpen) return null;

  const currentPickupList = direction === 'SG_TO_JB' ? SG_STOPS : JB_STOPS;
  const currentDropoffList = direction === 'SG_TO_JB' ? JB_STOPS : SG_STOPS;

  const handleSwapDirection = () => {
    if (!isMuted) sound.playToggle();
    const newDir = direction === 'SG_TO_JB' ? 'JB_TO_SG' : 'SG_TO_JB';
    setDirection(newDir);
    // swap ids
    if (newDir === 'JB_TO_SG') {
      setPickupId(JB_STOPS[0].id);
      setDropoffId(SG_STOPS[0].id);
    } else {
      setPickupId(SG_STOPS[0].id);
      setDropoffId(JB_STOPS[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMuted) sound.playSuccess();

    const selectedPickup = currentPickupList.find((s) => s.id === pickupId) || currentPickupList[0];
    const selectedDropoff = currentDropoffList.find((s) => s.id === dropoffId) || currentDropoffList[0];

    const seatPriceSGD = currency === 'SGD' ? priceInput : Number((priceInput / 3.5).toFixed(2));
    const seatPriceMYR = currency === 'MYR' ? priceInput : Number((priceInput * 3.5).toFixed(2));

    const driverObj: PoolDriver = {
      id: `driver-${Date.now()}`,
      name: driverName || 'Host Driver',
      initials: driverName.slice(0, 2).toUpperCase() || 'HD',
      avatarBg: 'bg-emerald-700',
      rating: 5.0,
      tripCount: 14,
      vehicleModel,
      plateNumber,
      isHostPartner: true,
      hostProvider,
      verifiedSingpass: true,
      verifiedVEP: true,
    };

    const tags = ['Verified Host', 'VEP Tagged'];
    if (hostProvider === 'GetGo') tags.push('GetGo Cross-Border');
    if (isQuiet) tags.push('Quiet Mode');
    if (isFemaleOnly) tags.push('Female-Only');

    const newRide: CarpoolRide = {
      id: `ride-${Date.now()}`,
      driver: driverObj,
      pickup: selectedPickup,
      dropoff: selectedDropoff,
      departsInMinutes,
      departureTimeStr: `In ${departsInMinutes}m`,
      departureDateStr: 'Today',
      seatsTotal: seatsAvailable,
      seatsAvailable,
      seatPriceSGD,
      seatPriceMYR,
      tags,
      isFemaleOnly,
      isQuiet,
      notes,
    };

    onRideCreated(newRide);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm tracking-tight text-white">Post Carpool Schedule (Host)</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs">
          {/* Direction toggle */}
          <div className="flex items-center justify-between bg-slate-100 p-2 rounded-xl">
            <span className="font-bold text-slate-700">
              {direction === 'SG_TO_JB' ? '🇸🇬 Singapore ➔ 🇲🇾 Johor Bahru' : '🇲🇾 Johor Bahru ➔ 🇸🇬 Singapore'}
            </span>
            <button
              type="button"
              onClick={handleSwapDirection}
              className="bg-white hover:bg-slate-200 px-2 py-1 rounded-lg text-[10px] font-extrabold text-emerald-800 border border-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <ArrowRightLeft className="w-3 h-3" /> Reverse
            </button>
          </div>

          {/* Pick-up & Drop-off */}
          <div className="space-y-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pick-up Location</label>
              <select
                value={pickupId}
                onChange={(e) => setPickupId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {currentPickupList.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Drop-off Destination</label>
              <select
                value={dropoffId}
                onChange={(e) => setDropoffId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {currentDropoffList.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle & Carsharing Host Provider */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Host Affiliation</label>
              <select
                value={hostProvider}
                onChange={(e) => setHostProvider(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-none"
              >
                <option value="GetGo">GetGo Carshare</option>
                <option value="Tribecar">Tribecar Rental</option>
                <option value="Private Owner">Private Car Owner</option>
                <option value="BlueSG">BlueSG EV</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Car Model</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-none"
                placeholder="e.g. Toyota Sienta"
              />
            </div>
          </div>

          {/* Driver & License Plate */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Your Name / Handle</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">License Plate</label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-none uppercase"
                placeholder="SGX 1234 A"
              />
            </div>
          </div>

          {/* Seats & Fare per seat */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Available Seats</label>
              <input
                type="number"
                min="1"
                max="6"
                value={seatsAvailable}
                onChange={(e) => setSeatsAvailable(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Seat Fare ({currency})
              </label>
              <input
                type="number"
                step="0.5"
                min="5"
                value={priceInput}
                onChange={(e) => setPriceInput(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Departure In</label>
              <select
                value={departsInMinutes}
                onChange={(e) => setDepartsInMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-800 focus:outline-none"
              >
                <option value={10}>10 mins</option>
                <option value={20}>20 mins</option>
                <option value={35}>35 mins</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
          </div>

          {/* Preference Toggles */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700">Quiet Ride (focus / study)</span>
              <input
                type="checkbox"
                checked={isQuiet}
                onChange={(e) => setIsQuiet(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-700">Female-Only Passengers</span>
              <input
                type="checkbox"
                checked={isFemaleOnly}
                onChange={(e) => setIsFemaleOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ride Notes / Luggage Info</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-700 focus:outline-none"
              placeholder="e.g. Boot fits 2 cabin bags. Taking Tuas link."
            />
          </div>

          {/* Target subsidy feedback */}
          <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center justify-between">
            <span>Estimated Host Offset (x{seatsAvailable} seats):</span>
            <strong className="text-emerald-700 font-extrabold">
              {currency === 'SGD' ? `$${(priceInput * seatsAvailable).toFixed(2)} SGD` : `RM ${(priceInput * seatsAvailable).toFixed(2)} MYR`}
            </strong>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publish Carpool to Swee Lah Pool</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
