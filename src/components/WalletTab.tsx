import React, { useState } from 'react';
import { Currency } from '../types';
import { sound } from '../utils/audio';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Plus,
  CheckCircle2,
  CreditCard,
  Building2,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface WalletTabProps {
  currency: Currency;
  isMuted: boolean;
  onToast: (msg: string, type?: 'success' | 'alert' | 'info') => void;
}

export const WalletTab: React.FC<WalletTabProps> = ({
  currency,
  isMuted,
  onToast,
}) => {
  const [balanceSGD, setBalanceSGD] = useState<number>(84.5);
  const conversionRate = 3.5;
  const balanceMYR = balanceSGD * conversionRate;

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(30);

  const handleTopUp = () => {
    if (!isMuted) sound.playSuccess();
    setBalanceSGD((prev) => prev + topUpAmount);
    setShowTopUpModal(false);
    onToast(`Successfully topped up ${currency === 'SGD' ? `$${topUpAmount} SGD` : `RM ${(topUpAmount * conversionRate).toFixed(2)} MYR`} via PayNow!`);
  };

  return (
    <div id="tab-wallet" className="space-y-4 animate-in fade-in duration-200">
      {/* Wallet Balance Hero Card */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-4 border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              Swee Lah Cross-Border Wallet
            </span>
            <div className="text-3xl font-black text-white mt-1 font-mono tracking-tight">
              {currency === 'SGD' ? `$${balanceSGD.toFixed(2)} SGD` : `RM ${balanceMYR.toFixed(2)} MYR`}
            </div>
            <div className="text-xs text-emerald-200/70 font-medium mt-0.5">
              Auto-converts between SGD & MYR (1 SGD = 3.50 MYR)
            </div>
          </div>

          <div className="bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] text-emerald-300 font-bold">
            Live Rate
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              if (!isMuted) sound.playTap();
              setShowTopUpModal(true);
            }}
            className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Top Up PayNow</span>
          </button>

          <button
            onClick={() => {
              if (!isMuted) sound.playTap();
              onToast('Withdrawal request initiated to linked POSB bank account.');
            }}
            className="bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700/80 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Withdraw SGD</span>
          </button>
        </div>
      </div>

      {/* Linked Payment Rails */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
          <span>Connected Cross-Border Rails</span>
          <span className="text-[10px] text-emerald-800 font-bold">Zero FX Surcharge</span>
        </div>

        {/* PayNow */}
        <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              PN
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800">PayNow (Singapore)</div>
              <div className="text-[10px] text-slate-400">Linked to +65 •••• 2188</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            Active Primary
          </span>
        </div>

        {/* Touch 'n Go */}
        <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              TNG
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800">Touch 'n Go eWallet</div>
              <div className="text-[10px] text-slate-400">For JB-side dining, tolls & retail</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
            MY Rail Linked
          </span>
        </div>

        {/* WeChat Pay */}
        <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-7 rounded-lg bg-green-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              微信
            </div>
            <div>
              <div className="font-bold text-xs text-slate-800">WeChat Pay / KakaoPay</div>
              <div className="text-[10px] text-slate-400">Cross-border QR sync enabled</div>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
            Synced
          </span>
        </div>
      </div>

      {/* Itemized Last Trip Receipt */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-700">
            <Receipt className="w-3.5 h-3.5 text-emerald-700" />
            <span>Last Trip Receipt (#SW-9982)</span>
          </span>
          <span className="text-[10px] text-slate-400">Woodlands ➔ JB Sentral</span>
        </div>

        <div className="bg-slate-50 rounded-2xl p-3 space-y-2 text-xs border border-slate-200/80">
          <div className="flex justify-between text-slate-600">
            <span>Base Carpool Seat Fare:</span>
            <span className="font-mono font-medium">{currency === 'SGD' ? '$13.00 SGD' : 'RM 45.50 MYR'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Woodlands Causeway Toll (Split x4):</span>
            <span className="font-mono font-medium">{currency === 'SGD' ? '$2.10 SGD' : 'RM 7.35 MYR'}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>VEP Road Charge Share:</span>
            <span className="font-mono font-medium">{currency === 'SGD' ? '$0.90 SGD' : 'RM 3.15 MYR'}</span>
          </div>
          <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 text-sm">
            <span>Total Paid:</span>
            <span className="text-emerald-800 font-mono font-black">
              {currency === 'SGD' ? '$16.00 SGD' : 'RM 56.00 MYR'}
            </span>
          </div>
        </div>

        {/* Monthly savings callout */}
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <div className="font-bold text-emerald-950">Monthly Causeway Savings</div>
              <div className="text-[10px] text-emerald-700">Compared to private transfers / Grab car</div>
            </div>
          </div>
          <div className="text-right font-black text-emerald-800 font-mono text-sm">
            {currency === 'SGD' ? '$480.00' : 'RM 1,680.00'}
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-4 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-slate-800">Top Up Swee Lah Wallet</h4>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500">Select Amount</label>
              <div className="grid grid-cols-3 gap-2">
                {[20, 30, 50].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      topUpAmount === amt
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    ${amt} SGD
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Method:</span>
                <span className="font-bold text-slate-700">PayNow Instant</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Equivalent MYR:</span>
                <span className="font-mono text-emerald-700 font-bold">RM {(topUpAmount * 3.5).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleTopUp}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Confirm PayNow Top-Up
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
