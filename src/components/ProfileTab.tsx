import React, { useState } from 'react';
import { Currency } from '../types';
import { sound } from '../utils/audio';
import {
  User,
  ShieldCheck,
  ChevronRight,
  Heart,
  History,
  Gift,
  HelpCircle,
  MapPin,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';

interface ProfileTabProps {
  currency: Currency;
  isMuted: boolean;
  onToast: (msg: string, type?: 'success' | 'alert' | 'info') => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currency,
  isMuted,
  onToast,
}) => {
  const [prefLangMatch, setPrefLangMatch] = useState(true);
  const [prefFemaleOnly, setPrefFemaleOnly] = useState(false);
  const [prefCustomsRemind, setPrefCustomsRemind] = useState(true);
  const [prefAutoTolls, setPrefAutoTolls] = useState(true);

  const toggleSwitch = (setter: React.Dispatch<React.SetStateAction<boolean>>, name: string) => {
    if (!isMuted) sound.playToggle();
    setter((prev) => {
      const next = !prev;
      onToast(`${name} ${next ? 'enabled' : 'disabled'}`);
      return next;
    });
  };

  return (
    <div id="tab-profile" className="space-y-4 animate-in fade-in duration-200">
      {/* Profile Header */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-emerald-400/40">
            SL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-extrabold text-slate-800">Sarah Lim</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-700" /> Singpass
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Cross-border commuter • Since Mar 2025
            </p>
            <div className="text-[10px] text-emerald-700 font-bold mt-1">
              ★ 4.98 Commuter Rating • 84 Completed Pools
            </div>
          </div>
        </div>

        {/* Passport & Identity Status Pill */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="font-bold text-slate-800">Biometric Passport (E-Passport)</div>
              <div className="text-[10px] text-slate-400">Valid till Nov 2030 • Auto-gate cleared</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
      </div>

      {/* Commute Preferences Toggles */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Cross-Border Ride Preferences
        </div>

        {/* Preferred Language matching */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
          <div>
            <div className="font-bold text-slate-800">Preferred Language Matching</div>
            <div className="text-[10px] text-slate-400">Match drivers speaking English / Mandarin / Malay</div>
          </div>
          <button
            type="button"
            onClick={() => toggleSwitch(setPrefLangMatch, 'Language Matching')}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              prefLangMatch ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                prefLangMatch ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Female-only pools */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
          <div>
            <div className="font-bold text-slate-800">Default to Female-Only Pools</div>
            <div className="text-[10px] text-slate-400">Show verified female drivers and female riders only</div>
          </div>
          <button
            type="button"
            onClick={() => toggleSwitch(setPrefFemaleOnly, 'Female-only preference')}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              prefFemaleOnly ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                prefFemaleOnly ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* MDAC / SGAC Reminders */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
          <div>
            <div className="font-bold text-slate-800">MDAC & SGAC Customs Reminders</div>
            <div className="text-[10px] text-slate-400">Prompt arrival card submissions 2 hours before trip</div>
          </div>
          <button
            type="button"
            onClick={() => toggleSwitch(setPrefCustomsRemind, 'Arrival card reminders')}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              prefCustomsRemind ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                prefCustomsRemind ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Auto toll split consent */}
        <div className="flex items-center justify-between py-2 text-xs">
          <div>
            <div className="font-bold text-slate-800">Auto-Split VEP & Causeway Tolls</div>
            <div className="text-[10px] text-slate-400">Include Singapore ERP & MY VEP in final seat price</div>
          </div>
          <button
            type="button"
            onClick={() => toggleSwitch(setPrefAutoTolls, 'Auto Toll split')}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              prefAutoTolls ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform absolute top-0.5 ${
                prefAutoTolls ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Account & Community Links */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-1 text-xs font-semibold text-slate-700">
        <button
          onClick={() => {
            if (!isMuted) sound.playTap();
            onToast('Saved routes: Woodlands North MRT ⇄ Bukit Chagar RTS (Default)');
          }}
          className="w-full flex justify-between items-center py-2.5 px-1 hover:text-emerald-800 transition-colors border-b border-slate-100 cursor-pointer text-left"
        >
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>Saved Frequent Routes (Woodlands ⇄ JB)</span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => {
            if (!isMuted) sound.playTap();
            onToast('Favourite verified drivers: Mei Zhen (Toyota Wish), Jia Ling (GetGo)');
          }}
          className="w-full flex justify-between items-center py-2.5 px-1 hover:text-emerald-800 transition-colors border-b border-slate-100 cursor-pointer text-left"
        >
          <span className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Favourite Pool Drivers (3 Verified)</span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => {
            if (!isMuted) sound.playTap();
            onToast('Showing full 84 trips cross-border archive.');
          }}
          className="w-full flex justify-between items-center py-2.5 px-1 hover:text-emerald-800 transition-colors border-b border-slate-100 cursor-pointer text-left"
        >
          <span className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <span>Carpool Ride History & E-Receipts</span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => {
            if (!isMuted) sound.playTap();
            onToast('Referral link: "SWEELAH-SARAH" copied! $10 SGD carpool credit for friend.');
          }}
          className="w-full flex justify-between items-center py-2.5 px-1 hover:text-emerald-800 transition-colors border-b border-slate-100 cursor-pointer text-left"
        >
          <span className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-500" />
            <span>Refer a Commuter (Earn $10 SGD)</span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => {
            if (!isMuted) sound.playTap();
            onToast('Connecting to 24/7 Swee Lah Causeway Hotline...');
          }}
          className="w-full flex justify-between items-center py-2.5 px-1 hover:text-emerald-800 transition-colors cursor-pointer text-left"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Cross-Border Support & FAQ</span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* App Version Info */}
      <div className="text-center text-[10px] text-slate-400 py-2">
        Swee Lah Commute Engine v2.4.0 • Built for SG ⇄ JB Daily Commuters
      </div>
    </div>
  );
};
