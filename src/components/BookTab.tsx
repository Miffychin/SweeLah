import React, { useState } from 'react';
import { RouteStop, CarpoolRide, Currency, RideType, RidePreferences, LanguagePool } from '../types';
import { SG_STOPS, JB_STOPS } from '../data/mockData';
import { sound } from '../utils/audio';
import {
  ArrowUpDown,
  Zap,
  Calendar,
  Luggage,
  Sparkles,
  Search,
  CheckCircle2,
  Shield,
  Star,
  Users,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface BookTabProps {
  currency: Currency;
  rides: CarpoolRide[];
  onSelectRideToBook: (ride: CarpoolRide, seats: number) => void;
  onQuickBookFirstAvailable: (pickup: RouteStop, dropoff: RouteStop, seats: number) => void;
  isMuted: boolean;
  onToast: (msg: string, type?: 'success' | 'alert' | 'info') => void;
}

export const BookTab: React.FC<BookTabProps> = ({
  currency,
  rides,
  onSelectRideToBook,
  onQuickBookFirstAvailable,
  isMuted,
  onToast,
}) => {
  // Direction: 'SG_TO_MY' or 'MY_TO_SG'
  const [direction, setDirection] = useState<'SG_TO_MY' | 'MY_TO_SG'>('SG_TO_MY');
  const [pickupStop, setPickupStop] = useState<RouteStop>(SG_STOPS[0]);
  const [dropoffStop, setDropoffStop] = useState<RouteStop>(JB_STOPS[0]);

  const [rideType, setRideType] = useState<RideType>('instant');
  const [scheduledDay, setScheduledDay] = useState<string>('Tomorrow, 8:00 AM');
  const [seatsRequested, setSeatsRequested] = useState<number>(1);

  // Preferences
  const [preferences, setPreferences] = useState<RidePreferences>({
    quietMode: true,
    femaleOnly: false,
    luggageCount: 1,
    languagePool: 'English / Chinese',
    rtsFeederSync: true,
  });

  const [filterCommunity, setFilterCommunity] = useState<string>('all');
  const [selectedRideId, setSelectedRideId] = useState<string | null>(rides[0]?.id || null);

  // Conversion rates
  const conversionRate = 3.5;
  const baseFareSGD = 16.0;
  const taxiBaselineSGD = 100.0;

  const currentFarePerSeat = currency === 'SGD' ? baseFareSGD : baseFareSGD * conversionRate;
  const currSymbol = currency === 'SGD' ? '$' : 'RM ';
  const baselineFare = currency === 'SGD' ? taxiBaselineSGD : taxiBaselineSGD * conversionRate;
  const savingsPct = Math.round(((baselineFare - currentFarePerSeat) / baselineFare) * 100);

  const swapLocations = () => {
    if (!isMuted) sound.playToggle();
    const newDir = direction === 'SG_TO_MY' ? 'MY_TO_SG' : 'SG_TO_MY';
    setDirection(newDir);
    const prevPickup = pickupStop;
    const prevDropoff = dropoffStop;
    setPickupStop(prevDropoff);
    setDropoffStop(prevPickup);
    onToast(newDir === 'SG_TO_MY' ? 'Direction: Singapore ➔ Johor Bahru' : 'Direction: Johor Bahru ➔ Singapore');
  };

  const handleSeatSelect = (count: number) => {
    if (!isMuted) sound.playTap();
    setSeatsRequested(count);
  };

  const toggleQuiet = () => {
    if (!isMuted) sound.playToggle();
    setPreferences((prev) => ({ ...prev, quietMode: !prev.quietMode }));
  };

  const toggleFemale = () => {
    if (!isMuted) sound.playToggle();
    setPreferences((prev) => ({ ...prev, femaleOnly: !prev.femaleOnly }));
  };

  const updateBags = (delta: number) => {
    if (!isMuted) sound.playTap();
    setPreferences((prev) => ({
      ...prev,
      luggageCount: Math.max(0, Math.min(4, prev.luggageCount + delta)),
    }));
  };

  // Filter rides based on preferences
  const filteredRides = rides.filter((ride) => {
    if (preferences.femaleOnly && !ride.isFemaleOnly) return false;
    if (preferences.quietMode && !ride.isQuiet) return false;
    if (filterCommunity !== 'all' && !ride.tags.some((t) => t.toLowerCase().includes(filterCommunity.toLowerCase()))) {
      return false;
    }
    return true;
  });

  const currentPickupOptions = direction === 'SG_TO_MY' ? SG_STOPS : JB_STOPS;
  const currentDropoffOptions = direction === 'SG_TO_MY' ? JB_STOPS : SG_STOPS;

  return (
    <div id="tab-book" className="space-y-4 animate-in fade-in duration-200">
      {/* Route Selection Card */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
          <span className="flex items-center gap-1.5 text-slate-600 font-extrabold">
            <span>Route Selection</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
              {direction === 'SG_TO_MY' ? 'SG ➔ JB' : 'JB ➔ SG'}
            </span>
          </span>
          <button
            id="swap-route-btn"
            onClick={swapLocations}
            className="text-emerald-800 hover:text-emerald-600 p-1.5 rounded-full hover:bg-emerald-50 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="text-[11px]">Swap</span>
          </button>
        </div>

        {/* Origin Pickup */}
        <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 hover:border-emerald-500/50 transition-colors">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {direction === 'SG_TO_MY' ? 'Pick-up Point (Singapore)' : 'Pick-up Point (Johor Bahru)'}
            </label>
            <select
              id="pickup-select"
              value={pickupStop.id}
              onChange={(e) => {
                const found = currentPickupOptions.find((s) => s.id === e.target.value);
                if (found) setPickupStop(found);
              }}
              className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
            >
              {currentPickupOptions.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Destination Dropoff */}
        <div className="flex items-center space-x-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 hover:border-rose-500/50 transition-colors">
          <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {direction === 'SG_TO_MY' ? 'Drop-off Point (Johor Bahru)' : 'Drop-off Point (Singapore)'}
            </label>
            <select
              id="dropoff-select"
              value={dropoffStop.id}
              onChange={(e) => {
                const found = currentDropoffOptions.find((s) => s.id === e.target.value);
                if (found) setDropoffStop(found);
              }}
              className="w-full bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer truncate"
            >
              {currentDropoffOptions.map((stop) => (
                <option key={stop.id} value={stop.id}>
                  {stop.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ride Timing Mode: Instant vs Scheduled */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="btn-instant"
            type="button"
            onClick={() => {
              if (!isMuted) sound.playTap();
              setRideType('instant');
            }}
            className={`py-2 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rideType === 'instant'
                ? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${rideType === 'instant' ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
            <span>Instant Pool (10-25m)</span>
          </button>

          <button
            id="btn-scheduled"
            type="button"
            onClick={() => {
              if (!isMuted) sound.playTap();
              setRideType('scheduled');
            }}
            className={`py-2 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              rideType === 'scheduled'
                ? 'border-2 border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm'
                : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${rideType === 'scheduled' ? 'text-emerald-700' : 'text-slate-400'}`} />
            <span>Schedule (7 Days)</span>
          </button>
        </div>

        {/* Scheduled date selector when scheduled mode is on */}
        {rideType === 'scheduled' && (
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs animate-in fade-in">
            <span className="text-slate-500 font-semibold">Planned Departure:</span>
            <select
              value={scheduledDay}
              onChange={(e) => setScheduledDay(e.target.value)}
              className="bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-2 py-1 focus:outline-none"
            >
              <option value="Tomorrow, 7:00 AM">Tomorrow, 7:00 AM (Morning Peak)</option>
              <option value="Tomorrow, 8:00 AM">Tomorrow, 8:00 AM</option>
              <option value="Tomorrow, 6:00 PM">Tomorrow, 6:00 PM (After Work)</option>
              <option value="Saturday, 9:00 AM">Saturday, 9:00 AM (Weekend Chill)</option>
              <option value="Sunday, 5:30 PM">Sunday, 5:30 PM (Return Trip)</option>
            </select>
          </div>
        )}

        {/* Seat Count Pill Row */}
        <div className="pt-1">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
            Seats Needed
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleSeatSelect(count)}
                className={`py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  seatsRequested === count
                    ? 'border-emerald-600 bg-emerald-800 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {count} {count === 1 ? 'Seat' : 'Seats'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ride Preferences */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-600 font-extrabold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Ride Preferences & Community</span>
          </span>
          <span className="text-[10px] text-emerald-700 font-bold">Auto-Matched</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Quiet Ride toggle */}
          <button
            id="toggle-quiet-btn"
            type="button"
            onClick={toggleQuiet}
            className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
              preferences.quietMode
                ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-xl">🤫</span>
            <span className="text-[10px] font-bold">Quiet Ride</span>
            <span className={`text-[9px] font-medium ${preferences.quietMode ? 'text-emerald-700' : 'text-slate-400'}`}>
              {preferences.quietMode ? 'Active' : 'Off'}
            </span>
          </button>

          {/* Female-Only toggle */}
          <button
            id="toggle-female-btn"
            type="button"
            onClick={toggleFemale}
            className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
              preferences.femaleOnly
                ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-xl">👩</span>
            <span className="text-[10px] font-bold">Female-Only</span>
            <span className={`text-[9px] font-medium ${preferences.femaleOnly ? 'text-emerald-700' : 'text-slate-400'}`}>
              {preferences.femaleOnly ? 'Active' : 'Off'}
            </span>
          </button>

          {/* Luggage Counter */}
          <div className="p-2.5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-between text-center">
            <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
              <Luggage className="w-3 h-3 text-slate-400" /> Bags
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <button
                type="button"
                onClick={() => updateBags(-1)}
                className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-300 transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="text-xs font-black text-slate-800">{preferences.luggageCount}</span>
              <button
                type="button"
                onClick={() => updateBags(1)}
                className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs hover:bg-slate-300 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Preferred Driver Community Pool */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" /> Driver Community
          </label>
          <select
            value={filterCommunity}
            onChange={(e) => setFilterCommunity(e.target.value)}
            className="bg-slate-100 text-xs font-bold text-slate-700 rounded-xl px-2.5 py-1.5 border border-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Pools (Recommended)</option>
            <option value="English">English / Chinese</option>
            <option value="Malay">Malay / English</option>
            <option value="Korean">Korean Pool 🇰🇷</option>
            <option value="GetGo">GetGo Hosts</option>
          </select>
        </div>
      </div>

      {/* Calculated Seat Fare Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white p-4 rounded-3xl shadow-xl space-y-3 relative overflow-hidden border border-emerald-700/40">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-emerald-300 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Calculated Seat Fare
            </span>
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span className="text-3xl font-black text-white tracking-tight">
                {currSymbol}{(currentFarePerSeat * seatsRequested).toFixed(2)}
              </span>
              <span className="text-xs text-emerald-200/80 font-medium">
                {currency} ({seatsRequested} {seatsRequested > 1 ? 'seats' : 'seat'})
              </span>
            </div>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 rounded-full backdrop-blur-sm">
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wide">
              🔥 {savingsPct}% Savings
            </span>
          </div>
        </div>

        {/* Cost split details */}
        <div className="bg-slate-900/80 rounded-2xl p-2.5 text-[11px] space-y-1.5 border border-slate-700/50">
          <div className="flex justify-between text-slate-300">
            <span>Private Taxi Baseline (SG ⇄ JB):</span>
            <span className="line-through text-slate-400 font-mono">
              {currSymbol}{(baselineFare * (seatsRequested > 1 ? 1 : 1)).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Causeway Tolls + VEP Split (x4 riders):</span>
            <span className="text-emerald-400 font-semibold">Included in fare (~{currSymbol}3.50)</span>
          </div>
        </div>

        <button
          id="instant-match-btn"
          onClick={() => {
            if (!isMuted) sound.playTap();
            onQuickBookFirstAvailable(pickupStop, dropoffStop, seatsRequested);
          }}
          className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black py-3 rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="w-4 h-4" />
          <span>Find Matching Carpools ({filteredRides.length} Available)</span>
        </button>
      </div>

      {/* Available Carpool Pools List */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Available Verified Pools ({filteredRides.length})
          </h3>
          <span className="text-[11px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
            Departs &lt; 45m
          </span>
        </div>

        {filteredRides.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-500">No pools match all strict filters right now.</p>
            <button
              onClick={() => {
                setPreferences({
                  quietMode: false,
                  femaleOnly: false,
                  luggageCount: 1,
                  languagePool: 'English / Chinese',
                  rtsFeederSync: true,
                });
                setFilterCommunity('all');
              }}
              className="text-xs font-bold text-emerald-700 underline cursor-pointer"
            >
              Reset filters to see all pools
            </button>
          </div>
        ) : (
          filteredRides.map((ride) => {
            const isSelected = selectedRideId === ride.id;
            const price = currency === 'SGD' ? ride.seatPriceSGD : ride.seatPriceMYR;

            return (
              <div
                key={ride.id}
                onClick={() => setSelectedRideId(ride.id)}
                className={`bg-white p-3.5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200/90 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-2xl ${ride.driver.avatarBg} text-white flex items-center justify-center font-black text-sm shadow-sm`}>
                      {ride.driver.initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-800">{ride.driver.name}</span>
                        {ride.driver.hostProvider === 'GetGo' && (
                          <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                            GetGo
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-700 flex items-center">
                          <Shield className="w-2.5 h-2.5 mr-0.5 fill-emerald-600 text-emerald-600" />
                          VEP
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {ride.driver.vehicleModel} • {ride.departsInMinutes}m away
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-base text-emerald-900 font-mono">
                      {currSymbol}{price.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">per seat</span>
                  </div>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {ride.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        tag.includes('Quiet')
                          ? 'bg-amber-100 text-amber-800'
                          : tag.includes('Female')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200/40'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="text-[9px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                    {ride.seatsAvailable} of {ride.seatsTotal} seats open
                  </span>
                </div>

                {/* Rating & Action Button */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs">
                  <div className="flex items-center space-x-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{ride.driver.rating}</span>
                    <span className="text-slate-400 font-normal text-[11px]">({ride.driver.tripCount} rides)</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isMuted) sound.playTap();
                      onSelectRideToBook(ride, seatsRequested);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Book Pool</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
