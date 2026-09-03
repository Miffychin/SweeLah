import React, { useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, Sparkles, MessageCircle, ShieldCheck, HeartHandshake } from 'lucide-react';
import { sound } from '../utils/audio';

declare global {
  interface Window {
    DISQUS?: {
      reset: (options: {
        reload: boolean;
        config?: (this: {
          page: {
            url: string;
            identifier: string;
            title?: string;
          };
        }) => void;
      }) => void;
    };
    disqus_config?: (this: {
      page: {
        url: string;
        identifier: string;
        title?: string;
      };
    }) => void;
  }
}

interface TalkToUsTabProps {
  isMuted: boolean;
  onToast: (msg: string, type?: 'success' | 'alert' | 'info') => void;
}

// Real fixed canonical configuration values for the Swee Lah Talk to Us thread
const PAGE_URL = 'https://sweelah.app/talk-to-us';
const PAGE_IDENTIFIER = 'sweelah-talk-to-us';
const PAGE_TITLE = 'Swee Lah - Talk to Us & Commuter Community';

export const TalkToUsTab: React.FC<TalkToUsTabProps> = ({ isMuted, onToast }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadOrResetDisqus = () => {
    // Define the Disqus configuration function with real fixed values
    const configureDisqus = function (this: {
      page: {
        url: string;
        identifier: string;
        title?: string;
      };
    }) {
      this.page.url = PAGE_URL;
      this.page.identifier = PAGE_IDENTIFIER;
      this.page.title = PAGE_TITLE;
    };

    // If DISQUS is already initialized on the page, use reset() to reload cleanly in SPA
    if (typeof window !== 'undefined' && window.DISQUS) {
      try {
        window.DISQUS.reset({
          reload: true,
          config: configureDisqus,
        });
        setIsLoaded(true);
      } catch (err) {
        console.warn('Disqus reset error:', err);
      }
    } else {
      // First-time load: assign global configuration
      window.disqus_config = configureDisqus;

      // Ensure embed script is injected only once
      const existingScript = document.getElementById('disqus-embed-script');
      if (!existingScript) {
        const d = document;
        const s = d.createElement('script');
        s.id = 'disqus-embed-script';
        s.src = 'https://sweelah.disqus.com/embed.js';
        s.setAttribute('data-timestamp', (+new Date()).toString());
        s.async = true;
        s.onload = () => setIsLoaded(true);
        (d.head || d.body).appendChild(s);
      } else {
        existingScript.addEventListener('load', () => {
          if (window.DISQUS) {
            window.DISQUS.reset({
              reload: true,
              config: configureDisqus,
            });
            setIsLoaded(true);
          }
        });
      }
    }

    // Embed the comment count script if not present
    if (!document.getElementById('dsq-count-scr')) {
      const countScript = document.createElement('script');
      countScript.id = 'dsq-count-scr';
      countScript.src = '//sweelah.disqus.com/count.js';
      countScript.async = true;
      (document.head || document.body).appendChild(countScript);
    }
  };

  useEffect(() => {
    // Whenever this tab mounts/switches into view, re-initialize or reload Disqus
    loadOrResetDisqus();

    return () => {
      // Clean up if needed
    };
  }, []);

  const handleManualReload = () => {
    if (!isMuted) sound.playTap();
    setIsRefreshing(true);
    loadOrResetDisqus();
    setTimeout(() => {
      setIsRefreshing(false);
      onToast('Disqus discussion thread reloaded.');
    }, 600);
  };

  const topicPrompts = [
    '🚗 Carpool Route Requests',
    '🛂 Causeway & Tuas Queue Tips',
    '⚡ RTS Link Updates',
    '💡 Feature Suggestions',
  ];

  return (
    <div id="tab-talk-to-us" className="space-y-4 animate-in fade-in duration-200">
      {/* Header Info Card */}
      <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-slate-200 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-800">Talk to Us</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-700" /> Commuter Forum
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Share feedback, request new carpool routes, or ask the team & community anything!
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            id="btn-refresh-disqus"
            type="button"
            onClick={handleManualReload}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all cursor-pointer shrink-0"
            title="Reload Discussion Thread"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
        </div>

        {/* Discussion topic badges */}
        <div className="pt-1 flex flex-wrap gap-1.5">
          {topicPrompts.map((topic, i) => (
            <span
              key={i}
              className="text-[11px] bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-full border border-slate-200/60"
            >
              {topic}
            </span>
          ))}
        </div>

        {/* Forum Trust & Guidelines Banner */}
        <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-2.5 flex items-center justify-between text-[11px] text-emerald-900">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Moderated community channel powered by Disqus for SG ⇄ JB commuters</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
            sweelah.disqus.com
          </span>
        </div>
      </div>

      {/* Embedded Disqus Forum Card */}
      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 min-h-[420px]">
        {/* The Disqus Thread Target Container */}
        <div id="disqus_thread" className="w-full"></div>

        {/* Official Noscript Fallback */}
        <noscript>
          Please enable JavaScript to view the{' '}
          <a href="https://disqus.com/?ref_noscript" className="text-emerald-600 underline">
            comments powered by Disqus.
          </a>
        </noscript>
      </div>

      {/* Footer community note */}
      <div className="text-center text-[11px] text-slate-400 py-1 flex items-center justify-center gap-1.5">
        <HeartHandshake className="w-3.5 h-3.5 text-slate-400" />
        <span>Need urgent ride assistance? Reach us 24/7 on WhatsApp hotline: +65 9123 4567</span>
      </div>
    </div>
  );
};
