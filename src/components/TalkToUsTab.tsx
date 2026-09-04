import React, { useEffect, useState, useMemo } from 'react';
import {
  MessageSquare,
  RefreshCw,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  HeartHandshake,
  ThumbsUp,
  Send,
  CornerDownRight,
  Filter,
  Search,
  CheckCircle2,
  Trash2,
  Share2,
  MapPin,
  ExternalLink,
  Info,
  Pin,
  Car,
  Activity,
  Zap,
  Tag,
  User,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { CommunityFeedbackItem, FeedbackCategory, FeedbackReply } from '../types';
import {
  getStoredFeedback,
  saveFeedbackComment,
  toggleUpvoteFeedback,
  addFeedbackReply,
  deleteFeedbackComment,
  CATEGORY_CONFIG,
} from '../services/feedbackStorageService';

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

const PAGE_URL = 'https://sweelah.app/talk-to-us';
const PAGE_IDENTIFIER = 'sweelah-talk-to-us';
const PAGE_TITLE = 'Swee Lah - Talk to Us & Commuter Community';

export const TalkToUsTab: React.FC<TalkToUsTabProps> = ({ isMuted, onToast }) => {
  // Mode selection: In-App Permanent Board (default) vs Disqus Web Embed
  const [activeMode, setActiveMode] = useState<'in_app' | 'disqus'>('in_app');

  // Persistent Feedback State
  const [feedbackList, setFeedbackList] = useState<CommunityFeedbackItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'upvoted'>('newest');

  // New Feedback Form State
  const [authorName, setAuthorName] = useState<string>('');
  const [authorRole, setAuthorRole] = useState<'Commuter' | 'Daily Commuter' | 'Verified Driver'>('Daily Commuter');
  const [category, setCategory] = useState<FeedbackCategory>('carpool_route');
  const [routeTag, setRouteTag] = useState<string>('');
  const [commentContent, setCommentContent] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [justSubmittedId, setJustSubmittedId] = useState<string | null>(null);

  // Active Reply Thread State
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [replyAuthor, setReplyAuthor] = useState<string>('');

  // Disqus State
  const [isRefreshingDisqus, setIsRefreshingDisqus] = useState(false);
  const [disqusFailed, setDisqusFailed] = useState(false);

  // Load stored feedback on mount
  useEffect(() => {
    const data = getStoredFeedback();
    setFeedbackList(data);

    // Sync listener for cross-window / tab changes
    const handleSync = () => {
      setFeedbackList(getStoredFeedback());
    };
    window.addEventListener('sweelah_feedback_updated', handleSync);
    return () => {
      window.removeEventListener('sweelah_feedback_updated', handleSync);
    };
  }, []);

  // Initialize Disqus when switching to Disqus mode or when mode changes
  useEffect(() => {
    if (activeMode === 'disqus') {
      // Allow slight tick for #disqus_thread to mount in DOM
      const timer = setTimeout(() => {
        loadOrResetDisqus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeMode]);

  const loadOrResetDisqus = () => {
    setDisqusFailed(false);
    const configureDisqus = function (this: any) {
      try {
        this.page = this.page || {};
        this.page.url = PAGE_URL;
        this.page.identifier = PAGE_IDENTIFIER;
        this.page.title = PAGE_TITLE;
      } catch (err) {
        console.warn('Disqus config setup warning:', err);
      }
    };

    // Ensure global disqus_config is bound
    window.disqus_config = configureDisqus;

    if (typeof window !== 'undefined' && window.DISQUS && typeof window.DISQUS.reset === 'function') {
      try {
        window.DISQUS.reset({
          reload: true,
          config: configureDisqus,
        });
      } catch (err) {
        console.warn('Disqus reset error:', err);
      }
    } else {
      let existingScript = document.getElementById('disqus-embed-script') as HTMLScriptElement | null;
      if (!existingScript) {
        const d = document;
        const s = d.createElement('script');
        s.id = 'disqus-embed-script';
        s.src = 'https://sweelah.disqus.com/embed.js';
        s.setAttribute('data-timestamp', (+new Date()).toString());
        s.async = true;
        s.onerror = () => {
          console.warn('Disqus embed script load failed (may be blocked by browser tracking protection).');
          setDisqusFailed(true);
        };
        s.onload = () => {
          if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
            try {
              window.DISQUS.reset({
                reload: true,
                config: configureDisqus,
              });
            } catch (e) {
              console.warn('Disqus reset after script load warning:', e);
            }
          }
        };
        (d.head || d.body).appendChild(s);
      } else {
        // Script is already in DOM; trigger reset once ready
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (window.DISQUS && typeof window.DISQUS.reset === 'function') {
            clearInterval(interval);
            try {
              window.DISQUS.reset({
                reload: true,
                config: configureDisqus,
              });
            } catch (err) {
              console.warn('Disqus reset attempt warning:', err);
            }
          } else if (attempts > 20) {
            clearInterval(interval);
          }
        }, 100);
      }
    }
  };

  const handleManualReloadDisqus = () => {
    if (!isMuted) sound.playTap();
    setIsRefreshingDisqus(true);
    loadOrResetDisqus();
    setTimeout(() => {
      setIsRefreshingDisqus(false);
      onToast('Disqus discussion thread refreshed.', 'info');
    }, 600);
  };

  // Submit New Comment
  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      onToast('Please enter your comment or feedback before posting.', 'alert');
      return;
    }

    if (commentContent.trim().length < 5) {
      onToast('Feedback must be at least 5 characters long.', 'alert');
      return;
    }

    setIsSubmitting(true);
    try {
      const savedItem = saveFeedbackComment({
        author: authorName.trim() || 'Verified Commuter',
        role: authorRole,
        category,
        routeTag: routeTag.trim() || undefined,
        content: commentContent.trim(),
      });

      // Update state
      setFeedbackList(getStoredFeedback());
      setCommentContent('');
      setJustSubmittedId(savedItem.id);

      if (!isMuted) sound.playSuccess();
      onToast('Comment saved in sweelah.app and published to the board!', 'success');

      // Remove "just submitted" highlight after 5 seconds
      setTimeout(() => {
        setJustSubmittedId(null);
      }, 5000);
    } catch (err) {
      console.error('Error saving feedback:', err);
      onToast('Failed saving feedback. Please try again.', 'alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upvote Handler
  const handleToggleUpvote = (id: string) => {
    if (!isMuted) sound.playTap();
    toggleUpvoteFeedback(id);
    setFeedbackList(getStoredFeedback());
  };

  // Reply Handler
  const handleAddReply = (feedbackId: string) => {
    if (!replyText.trim()) return;

    if (!isMuted) sound.playTap();
    addFeedbackReply({
      feedbackId,
      author: replyAuthor.trim() || authorName.trim() || 'Verified Commuter',
      role: authorRole,
      text: replyText.trim(),
    });

    setFeedbackList(getStoredFeedback());
    setReplyText('');
    setReplyingToId(null);
    onToast('Reply posted and stored permanently in thread.', 'success');
  };

  // Delete Handler
  const handleDeleteComment = (id: string) => {
    if (confirm('Are you sure you want to remove this comment from the permanent feed?')) {
      if (!isMuted) sound.playTap();
      deleteFeedbackComment(id);
      setFeedbackList(getStoredFeedback());
      onToast('Comment removed from feed.', 'info');
    }
  };

  // Filter & Search Logic
  const filteredAndSortedList = useMemo(() => {
    let result = [...feedbackList];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.author.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.categoryLabel.toLowerCase().includes(q) ||
          (item.routeTag && item.routeTag.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'upvoted') {
        return b.upvotes - a.upvotes;
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return result;
  }, [feedbackList, selectedCategory, searchQuery, sortBy]);

  const quickRoutes = [
    'Woodlands ⇄ Austin Heights',
    'Jurong East ⇄ Bukit Indah',
    'Woodlands North ⇄ Changi T3',
    'Tuas ⇄ Gelang Patah',
  ];

  return (
    <div id="tab-talk-to-us" className="space-y-4 animate-in fade-in duration-200">
      {/* =========================================================================
          HEADER CARD & MODE SELECTOR
          ========================================================================= */}
      <div className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-slate-200 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-800 tracking-tight">Talk to Us</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-700" /> sweelah.app
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Share feedback, request carpool routes, or ask queue tips. All comments are saved in sweelah.app!
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              id="tab-mode-in-app"
              onClick={() => {
                if (!isMuted) sound.playTap();
                setActiveMode('in_app');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'in_app'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>sweelah.app Comments ({feedbackList.length})</span>
            </button>
            <button
              type="button"
              id="tab-mode-disqus"
              onClick={() => {
                if (!isMuted) sound.playTap();
                setActiveMode('disqus');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'disqus'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Disqus Thread</span>
            </button>
          </div>
        </div>

        {/* Persistence Assurance Banner */}
        <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-900">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium">
              Permanent Storage Active: Comments stay permanently saved in sweelah.app across sessions.
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md shadow-2xs">
            {feedbackList.length} Comments Stored
          </span>
        </div>
      </div>

      {/* =========================================================================
          MODE 1: IN-APP PERMANENT COMMUNITY FEEDBACK BOARD
          ========================================================================= */}
      {activeMode === 'in_app' && (
        <div className="space-y-4">
          {/* -----------------------------------------------------------------
              FEEDBACK INPUT CARD
              ----------------------------------------------------------------- */}
          <div
            id="feedback-input-card"
            className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Post Your Feedback or Route Request
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">No account required</span>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              {/* Row 1: Name and Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="input-feedback-author" className="block text-[11px] font-bold text-slate-700 mb-1">
                    Your Name / Commuter Handle
                  </label>
                  <input
                    id="input-feedback-author"
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Derrick Lim (Bishan) or Anonymous"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="select-feedback-role" className="block text-[11px] font-bold text-slate-700 mb-1">
                    Commuter Role
                  </label>
                  <select
                    id="select-feedback-role"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="Daily Commuter">Daily Commuter (SG ⇄ JB)</option>
                    <option value="Commuter">Weekend / Casual Commuter</option>
                    <option value="Verified Driver">Pool Driver / Car Owner</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Category Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  Select Topic Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(Object.keys(CATEGORY_CONFIG) as FeedbackCategory[]).map((catKey) => {
                    const cfg = CATEGORY_CONFIG[catKey];
                    const isSelected = category === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => {
                          if (!isMuted) sound.playTap();
                          setCategory(catKey);
                        }}
                        className={`text-left text-[11px] p-2 rounded-xl border transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-400 font-bold'
                            : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        <span className="truncate">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Route Tag */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="input-route-tag" className="block text-[11px] font-bold text-slate-700">
                    Specific Route or Landmark (Optional)
                  </label>
                  <div className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400">
                    <span>Quick picks:</span>
                    {quickRoutes.slice(0, 2).map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRouteTag(r)}
                        className="text-emerald-700 hover:underline cursor-pointer"
                      >
                        {r.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="input-route-tag"
                    type="text"
                    value={routeTag}
                    onChange={(e) => setRouteTag(e.target.value)}
                    placeholder="e.g. Woodlands Crossing, Austin Heights, Jurong East MRT..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Feedback Comment Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="textarea-feedback-content" className="block text-[11px] font-bold text-slate-700">
                    Your Comment or Feedback
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {commentContent.length}/600 chars
                  </span>
                </div>
                <textarea
                  id="textarea-feedback-content"
                  rows={3}
                  value={commentContent}
                  maxLength={600}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Type your feedback, carpool route request, customs queue tip, or app feature idea here... All comments are stored and visible permanently!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Submit Action Button */}
              <div className="pt-1 flex items-center justify-between">
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Press <strong>Post Comment</strong> to save permanently in sweelah.app.
                </p>
                <button
                  type="submit"
                  id="btn-submit-feedback"
                  disabled={isSubmitting || !commentContent.trim()}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-700/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving to sweelah.app...' : 'Post Comment to sweelah.app'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* -----------------------------------------------------------------
              COMMUNITY FEED CONTROLS: FILTER & SEARCH
              ----------------------------------------------------------------- */}
          <div className="bg-slate-100/90 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="input-search-feedback"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search feedback, route requests, tips..."
                className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="select-sort-feedback" className="text-[11px] font-bold text-slate-600">
                Sort:
              </label>
              <select
                id="select-sort-feedback"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="upvoted">Most Upvoted</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Topics ({feedbackList.length})
            </button>
            {(Object.keys(CATEGORY_CONFIG) as FeedbackCategory[]).map((catKey) => {
              const cfg = CATEGORY_CONFIG[catKey];
              const count = feedbackList.filter((item) => item.category === catKey).length;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === catKey
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cfg.label.split(' ')[0]} {cfg.label.split(' ')[1]} ({count})
                </button>
              );
            })}
          </div>

          {/* -----------------------------------------------------------------
              STORED FEEDBACK COMMENTS LIST
              ----------------------------------------------------------------- */}
          <div className="space-y-3">
            {filteredAndSortedList.length === 0 ? (
              feedbackList.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">No comments posted yet on sweelah.app</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Be the first to share a carpool route request, Causeway & Tuas queue tip, or app suggestion above! All comments are saved directly in sweelah.app.
                  </p>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No feedback matching your filter</p>
                  <p className="text-[11px] text-slate-400">
                    Try clearing your search query or category filter!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-emerald-700 font-bold hover:underline mt-2 cursor-pointer"
                  >
                    Reset filters
                  </button>
                </div>
              )
            ) : (
              filteredAndSortedList.map((item) => {
                const config = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.general_feedback;
                const isJustSubmitted = justSubmittedId === item.id;
                const isReplying = replyingToId === item.id;

                return (
                  <div
                    key={item.id}
                    id={`feedback-card-${item.id}`}
                    className={`bg-white rounded-2xl border p-4 transition-all duration-300 shadow-xs space-y-3 ${
                      item.isPinned
                        ? 'border-emerald-300 bg-gradient-to-br from-emerald-50/40 via-white to-white ring-1 ring-emerald-200'
                        : isJustSubmitted
                        ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-400'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header: Author, Role, Timestamp, Pinned tag */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-9 h-9 rounded-full ${
                            item.avatarColor || 'bg-emerald-600'
                          } text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0`}
                        >
                          {item.author
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase() || 'SG'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-xs text-slate-900">{item.author}</span>
                            {item.role && (
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                                  item.role === 'Swee Lah Team'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.role === 'Verified Driver'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {item.role}
                              </span>
                            )}
                            {item.isPinned && (
                              <span className="text-[9px] bg-emerald-600 text-white font-black px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                                <Pin className="w-2.5 h-2.5" /> Pinned
                              </span>
                            )}
                            {isJustSubmitted && (
                              <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-md animate-pulse">
                                ✨ Saved & Stored
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">{item.timestamp}</span>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${config.badgeClass}`}
                      >
                        {config.label.split(' ')[0]} {config.label.split(' ').slice(1, 3).join(' ')}
                      </span>
                    </div>

                    {/* Route Tag if specified */}
                    {item.routeTag && (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 px-2 py-0.5 rounded-lg w-fit">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{item.routeTag}</span>
                      </div>
                    )}

                    {/* Main Content */}
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                      {item.content}
                    </p>

                    {/* Footer Actions: Upvote, Reply, Delete */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {/* Upvote Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleUpvote(item.id)}
                          className={`flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                            item.hasUpvoted
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                          title="Upvote / Helpful"
                        >
                          <ThumbsUp className={`w-3 h-3 ${item.hasUpvoted ? 'text-emerald-700 fill-emerald-700' : ''}`} />
                          <span>{item.upvotes}</span>
                        </button>

                        {/* Reply Button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (!isMuted) sound.playTap();
                            setReplyingToId(isReplying ? null : item.id);
                            setReplyText('');
                          }}
                          className="flex items-center gap-1 font-bold text-slate-500 hover:text-emerald-700 text-xs transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>
                            {item.replies && item.replies.length > 0
                              ? `${item.replies.length} ${item.replies.length === 1 ? 'Reply' : 'Replies'}`
                              : 'Reply'}
                          </span>
                        </button>
                      </div>

                      {/* Delete option for non-pinned comments */}
                      {!item.isPinned && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(item.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors cursor-pointer p-1"
                          title="Delete this comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Thread Replies List */}
                    {item.replies && item.replies.length > 0 && (
                      <div className="pl-3 sm:pl-4 border-l-2 border-emerald-200 space-y-2 pt-1">
                        {item.replies.map((rep) => (
                          <div key={rep.id} className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-extrabold text-slate-800 flex items-center gap-1">
                                <CornerDownRight className="w-3 h-3 text-emerald-600" />
                                {rep.author}
                                {rep.role && (
                                  <span className="text-[9px] font-bold text-slate-400 bg-slate-200/70 px-1.5 py-0.2 rounded">
                                    {rep.role}
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-slate-400">{rep.timestamp}</span>
                            </div>
                            <p className="text-slate-600 pl-4 leading-relaxed">{rep.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Inline Reply Form */}
                    {isReplying && (
                      <div className="pl-3 sm:pl-4 border-l-2 border-emerald-400 space-y-2 pt-2 animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={replyAuthor}
                            onChange={(e) => setReplyAuthor(e.target.value)}
                            placeholder="Your name (optional)"
                            className="w-1/3 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddReply(item.id);
                              }
                            }}
                            placeholder={`Reply to ${item.author}...`}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleAddReply(item.id)}
                            disabled={!replyText.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0"
                          >
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => setReplyingToId(null)}
                            className="text-slate-400 hover:text-slate-600 text-xs px-1 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODE 2: DISQUS FORUM EMBED (OPTIONAL EXTERNAL THREAD)
          ========================================================================= */}
      {activeMode === 'disqus' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold">Official Disqus Web Thread</span>
                <p className="text-[11px] text-emerald-800">
                  External discussion board powered by Disqus. If third-party cookies are blocked by your browser, switch back to the In-App Board.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                id="btn-refresh-disqus"
                onClick={handleManualReloadDisqus}
                disabled={isRefreshingDisqus}
                className="p-1.5 rounded-xl text-emerald-700 hover:bg-emerald-100 active:scale-95 transition-all cursor-pointer bg-white border border-emerald-200"
                title="Reload Disqus Thread"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingDisqus ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('in_app')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Back to In-App Board
              </button>
            </div>
          </div>

          {/* Embedded Disqus Forum Card */}
          <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 min-h-[420px]">
            {disqusFailed && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-2 mb-4">
                <p className="text-xs text-amber-800 font-medium">
                  Disqus script was blocked by browser third-party cookie or tracking protections.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveMode('in_app')}
                  className="text-xs bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  Use In-App Permanent Board (Works 100%)
                </button>
              </div>
            )}
            <div id="disqus_thread" className="w-full"></div>
            <noscript>
              Please enable JavaScript to view the comments powered by Disqus.
            </noscript>
          </div>
        </div>
      )}

      {/* Footer Support Hotline */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Need direct carpool or app assistance? We are here to help!</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/6591234567?text=Hello%20Swee%20Lah%20support"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            WhatsApp Hotline: +65 9123 4567
          </a>
        </div>
      </div>
    </div>
  );
};
