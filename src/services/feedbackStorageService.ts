import { CommunityFeedbackItem, FeedbackCategory, FeedbackReply } from '../types';

export const FEEDBACK_STORAGE_KEY = 'sweelah_app_comments_v1';
export const LEGACY_STORAGE_KEY = 'sweelah_permanent_feedback_posts_v1';

export const CATEGORY_CONFIG: Record<
  FeedbackCategory,
  { label: string; iconName: string; badgeClass: string; borderClass: string }
> = {
  carpool_route: {
    label: '🚗 Carpool Route Requests',
    iconName: 'Car',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    borderClass: 'border-l-emerald-500',
  },
  checkpoint_tips: {
    label: '🛂 Causeway & Tuas Queue Tips',
    iconName: 'Activity',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    borderClass: 'border-l-amber-500',
  },
  rts_updates: {
    label: '⚡ RTS Link Updates',
    iconName: 'Zap',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    borderClass: 'border-l-cyan-500',
  },
  app_feature: {
    label: '💡 App Feature Suggestions',
    iconName: 'Sparkles',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    borderClass: 'border-l-purple-500',
  },
  general_feedback: {
    label: '💬 General Commuter Chat & Feedback',
    iconName: 'MessageSquare',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    borderClass: 'border-l-slate-400',
  },
};

/**
 * All dummy comments have been removed.
 * Real comments created by users are saved directly in sweelah.app storage.
 */
export const INITIAL_FEEDBACK_POSTS: CommunityFeedbackItem[] = [];

// Known dummy comment IDs to purge from legacy browser storage
const DUMMY_COMMENT_IDS = new Set(['fb-pin-1', 'fb-2', 'fb-3', 'fb-4', 'fb-5']);
const DUMMY_AUTHORS = new Set([
  'Swee Lah Community Team',
  'Derrick Lim (Bishan ➔ Austin)',
  'Marcus Chia',
  'Priya Nair (Changi Biotech)',
  'Jason Teo (GetGo Partner)',
]);

// In-memory cache for seamless recovery if localStorage is disabled or restricted
let memoryCache: CommunityFeedbackItem[] | null = null;

function sanitizeAndFilterPosts(items: any[]): CommunityFeedbackItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => {
    if (!item || typeof item !== 'object') return false;
    if (!item.id || typeof item.id !== 'string') return false;
    // Strip known dummy comments
    if (DUMMY_COMMENT_IDS.has(item.id)) return false;
    if (item.author && DUMMY_AUTHORS.has(item.author)) return false;
    return true;
  });
}

function persistFeedback(list: CommunityFeedbackItem[]): void {
  memoryCache = list;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
      // Keep legacy storage key in sync without dummy comments
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn('Failed writing feedback comments to localStorage, retained in memory:', err);
    }
    window.dispatchEvent(new Event('sweelah_feedback_updated'));
  }
}

/**
 * Retrieves all stored comments from sweelah.app persistent storage.
 * Strips any legacy dummy comments and returns persistent user-submitted posts.
 */
export function getStoredFeedback(): CommunityFeedbackItem[] {
  if (typeof window === 'undefined') {
    return memoryCache ?? [];
  }

  try {
    // 1. Try primary storage key
    let raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    let isFromLegacy = false;

    // 2. Fallback to legacy key if primary is not initialized
    if (raw === null) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      isFromLegacy = true;
    }

    // 3. If storage is completely empty
    if (raw === null) {
      if (memoryCache !== null) {
        return [...memoryCache];
      }
      persistFeedback([]);
      return [];
    }

    const parsed = JSON.parse(raw);
    const sanitized = sanitizeAndFilterPosts(parsed);

    // If migrating from legacy or dummy comments were stripped, persist cleaned list
    if (isFromLegacy || sanitized.length !== parsed.length) {
      persistFeedback(sanitized);
    } else {
      memoryCache = sanitized;
    }

    // Sort: pinned posts always at top, then newest createdAt first
    return [...sanitized].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  } catch (err) {
    console.warn('Failed reading feedback from storage, falling back to memory cache:', err);
    return memoryCache ?? [];
  }
}

/**
 * Saves a new feedback comment permanently to sweelah.app storage.
 */
export function saveFeedbackComment(params: {
  author: string;
  role?: 'Commuter' | 'Daily Commuter' | 'Verified Driver' | 'Swee Lah Team';
  category: FeedbackCategory;
  routeTag?: string;
  content: string;
}): CommunityFeedbackItem {
  const current = getStoredFeedback();
  const config = CATEGORY_CONFIG[params.category];

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-SG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = now.toLocaleDateString('en-SG', {
    month: 'short',
    day: 'numeric',
  });

  const avatarColors = [
    'bg-emerald-600',
    'bg-blue-600',
    'bg-indigo-600',
    'bg-teal-600',
    'bg-amber-600',
    'bg-purple-600',
    'bg-rose-600',
  ];
  const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

  const newItem: CommunityFeedbackItem = {
    id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    author: params.author.trim() || 'Verified Commuter',
    role: params.role || 'Commuter',
    avatarColor: randomColor,
    category: params.category,
    categoryLabel: config ? config.label : '💬 General Commuter Chat & Feedback',
    routeTag: params.routeTag?.trim() || undefined,
    content: params.content.trim(),
    timestamp: `Today at ${timeStr} (${dateStr})`,
    createdAt: Date.now(),
    upvotes: 1, // Author's initial self-upvote
    hasUpvoted: true,
    replies: [],
    isPinned: false,
  };

  // Prepend new item (after pinned items)
  const pinned = current.filter((p) => p.isPinned);
  const unpinned = current.filter((p) => !p.isPinned);
  const updatedList = [...pinned, newItem, ...unpinned];

  persistFeedback(updatedList);
  return newItem;
}

/**
 * Toggles upvote on an existing feedback post.
 */
export function toggleUpvoteFeedback(feedbackId: string): { upvotes: number; hasUpvoted: boolean } {
  const current = getStoredFeedback();
  let result = { upvotes: 0, hasUpvoted: false };

  const updated = current.map((item) => {
    if (item.id === feedbackId) {
      const alreadyUpvoted = Boolean(item.hasUpvoted);
      const newUpvotes = alreadyUpvoted ? Math.max(0, item.upvotes - 1) : item.upvotes + 1;
      result = { upvotes: newUpvotes, hasUpvoted: !alreadyUpvoted };
      return {
        ...item,
        upvotes: newUpvotes,
        hasUpvoted: !alreadyUpvoted,
      };
    }
    return item;
  });

  persistFeedback(updated);
  return result;
}

/**
 * Adds a reply to an existing feedback thread permanently in sweelah.app.
 */
export function addFeedbackReply(params: {
  feedbackId: string;
  author: string;
  role?: 'Commuter' | 'Daily Commuter' | 'Verified Driver' | 'Swee Lah Team';
  text: string;
}): FeedbackReply | null {
  if (!params.text.trim()) return null;

  const current = getStoredFeedback();
  let newReply: FeedbackReply | null = null;

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-SG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const updated = current.map((item) => {
    if (item.id === params.feedbackId) {
      newReply = {
        id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        author: params.author.trim() || 'Verified Commuter',
        role: params.role || 'Commuter',
        text: params.text.trim(),
        timestamp: `Just now (${timeStr})`,
        createdAt: Date.now(),
      };
      return {
        ...item,
        replies: [...(item.replies || []), newReply],
      };
    }
    return item;
  });

  if (newReply) {
    persistFeedback(updated);
  }
  return newReply;
}

/**
 * Deletes a feedback comment from sweelah.app persistent storage.
 */
export function deleteFeedbackComment(feedbackId: string): boolean {
  const current = getStoredFeedback();
  const filtered = current.filter((item) => item.id !== feedbackId);
  persistFeedback(filtered);
  return true;
}

/**
 * Resets storage back to empty in sweelah.app.
 */
export function resetFeedbackStorage(): CommunityFeedbackItem[] {
  persistFeedback([]);
  return [];
}
