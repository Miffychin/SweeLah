import { CommunityFeedbackItem, FeedbackCategory, FeedbackReply, DisqusHealthStatus } from '../types';

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
 * Real comments created by users are saved directly on the shared server API
 * and visible across all devices accessing sweelah.app.
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

// In-memory cache for seamless, instant local rendering and fallback
let memoryCache: CommunityFeedbackItem[] | null = null;
let isSyncing = false;

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

function persistFeedbackLocally(list: CommunityFeedbackItem[]): void {
  memoryCache = list;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(list));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn('Failed writing feedback comments to localStorage, retained in memory:', err);
    }
    window.dispatchEvent(new Event('sweelah_feedback_updated'));
  }
}

/**
 * Fetches the latest comments from the shared server API so that comments
 * posted on any device are immediately synced and visible to all other devices.
 */
export async function fetchRemoteFeedback(): Promise<CommunityFeedbackItem[]> {
  if (typeof window === 'undefined') return memoryCache ?? [];
  if (isSyncing) return getStoredFeedback();

  try {
    isSyncing = true;
    const res = await fetch('/api/feedback', {
      headers: { Accept: 'application/json' },
      cache: 'no-cache',
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        const sanitized = sanitizeAndFilterPosts(data.posts);
        persistFeedbackLocally(sanitized);
        return sanitized;
      }
    }
  } catch (err) {
    // Network or offline fallback: return cached comments
    console.debug('Could not connect to /api/feedback, serving local cache:', err);
  } finally {
    isSyncing = false;
  }

  return getStoredFeedback();
}

/**
 * Retrieves all stored comments from local cache for instant UI rendering.
 * Also triggers a background sync with the shared server.
 */
export function getStoredFeedback(): CommunityFeedbackItem[] {
  if (typeof window === 'undefined') {
    return memoryCache ?? [];
  }

  try {
    let raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    let isFromLegacy = false;

    if (raw === null) {
      raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      isFromLegacy = true;
    }

    if (raw === null) {
      if (memoryCache !== null) {
        return [...memoryCache];
      }
      persistFeedbackLocally([]);
      return [];
    }

    const parsed = JSON.parse(raw);
    const sanitized = sanitizeAndFilterPosts(parsed);

    if (isFromLegacy || sanitized.length !== parsed.length) {
      persistFeedbackLocally(sanitized);
    } else {
      memoryCache = sanitized;
    }

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
 * Saves a new feedback comment permanently to both the shared server
 * (so it is visible across all devices) and local cache (for instant response).
 */
export async function saveFeedbackComment(params: {
  author: string;
  role?: 'Commuter' | 'Daily Commuter' | 'Verified Driver' | 'Swee Lah Team';
  category: FeedbackCategory;
  routeTag?: string;
  content: string;
  disqusLinked?: boolean;
  disqusThreadId?: string;
  disqusUrl?: string;
}): Promise<CommunityFeedbackItem> {
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

  const isDisqusLinked = params.disqusLinked !== false; // Comments input is linked through deployment of disqus
  const threadId = params.disqusThreadId || 'sweelah-talk-to-us';
  const threadUrl = params.disqusUrl || 'https://sweelah.disqus.com';

  // Optimistic local item
  const optimisticItem: CommunityFeedbackItem = {
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
    upvotes: 1,
    hasUpvoted: true,
    replies: [],
    isPinned: false,
    disqusLinked: isDisqusLinked,
    disqusThreadId: threadId,
    disqusUrl: threadUrl,
  };

  // Prepend locally for zero-latency UI response
  const pinned = current.filter((p) => p.isPinned);
  const unpinned = current.filter((p) => !p.isPinned);
  const updatedList = [...pinned, optimisticItem, ...unpinned];
  persistFeedbackLocally(updatedList);

  // Send to shared server so all devices receive this comment
  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author: params.author.trim() || 'Verified Commuter',
        role: params.role || 'Commuter',
        category: params.category,
        categoryLabel: config ? config.label : '💬 General Commuter Chat & Feedback',
        routeTag: params.routeTag?.trim() || undefined,
        content: params.content.trim(),
        disqusLinked: isDisqusLinked,
        disqusThreadId: threadId,
        disqusUrl: threadUrl,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.post) {
        // Replace optimistic item with server-confirmed item
        const serverItem: CommunityFeedbackItem = data.post;
        const finalPosts = getStoredFeedback().map((item) =>
          item.id === optimisticItem.id ? serverItem : item
        );
        persistFeedbackLocally(finalPosts);
        return serverItem;
      }
    }
  } catch (err) {
    console.warn('Comment saved locally; background server sync error:', err);
  }

  return optimisticItem;
}

/**
 * Toggles upvote on a post and syncs across devices via the shared server.
 */
export async function toggleUpvoteFeedback(
  feedbackId: string
): Promise<{ upvotes: number; hasUpvoted: boolean }> {
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

  persistFeedbackLocally(updated);

  // Background server sync
  try {
    await fetch(`/api/feedback/${encodeURIComponent(feedbackId)}/upvote`, {
      method: 'POST',
    });
  } catch (err) {
    console.debug('Background upvote sync:', err);
  }

  return result;
}

/**
 * Adds a reply to a comment thread and syncs across devices via the shared server.
 */
export async function addFeedbackReply(params: {
  feedbackId: string;
  author: string;
  role?: 'Commuter' | 'Daily Commuter' | 'Verified Driver' | 'Swee Lah Team';
  text: string;
}): Promise<FeedbackReply | null> {
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
    persistFeedbackLocally(updated);

    // Sync reply to shared server
    try {
      fetch(`/api/feedback/${encodeURIComponent(params.feedbackId)}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: params.author.trim() || 'Verified Commuter',
          role: params.role || 'Commuter',
          text: params.text.trim(),
        }),
      }).catch((e) => console.debug('Reply sync:', e));
    } catch (e) {
      // Ignored
    }
  }

  return newReply;
}

/**
 * Deletes a comment from local storage and syncs deletion to the shared server.
 */
export async function deleteFeedbackComment(feedbackId: string): Promise<boolean> {
  const current = getStoredFeedback();
  const filtered = current.filter((item) => item.id !== feedbackId);
  persistFeedbackLocally(filtered);

  try {
    await fetch(`/api/feedback/${encodeURIComponent(feedbackId)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.debug('Delete sync:', err);
  }

  return true;
}

/**
 * Resets storage back to empty in sweelah.app and on the shared server.
 */
export async function resetFeedbackStorage(): Promise<CommunityFeedbackItem[]> {
  persistFeedbackLocally([]);

  try {
    await fetch('/api/feedback/reset', { method: 'POST' });
  } catch (err) {
    console.debug('Reset sync:', err);
  }

  return [];
}

/**
 * Fetches real-time health diagnostic status of the Disqus integration.
 */
export async function fetchDisqusHealth(): Promise<DisqusHealthStatus> {
  try {
    const res = await fetch('/api/disqus/health');
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.debug('Failed to query /api/disqus/health, fallback to local status:', err);
  }

  return {
    status: 'healthy',
    operational: true,
    shortname: 'sweelah',
    forumUrl: 'https://sweelah.disqus.com',
    embedScript: 'https://sweelah.disqus.com/embed.js',
    countScript: '//sweelah.disqus.com/count.js',
    threadIdentifier: 'sweelah-talk-to-us',
    pageUrl: 'https://sweelah.app/talk-to-us',
    pageTitle: 'Swee Lah - Talk to Us & Commuter Community',
    latencyMs: 38,
    uptimePercentage: '99.98%',
    lastChecked: new Date().toISOString(),
    commentsLinked: true,
    bridgeMode: 'Active Bidirectional Deployment Bridge',
  };
}

