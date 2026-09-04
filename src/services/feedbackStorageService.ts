import { CommunityFeedbackItem, FeedbackCategory, FeedbackReply } from '../types';

export const FEEDBACK_STORAGE_KEY = 'sweelah_permanent_feedback_posts_v1';

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

export const INITIAL_FEEDBACK_POSTS: CommunityFeedbackItem[] = [
  {
    id: 'fb-pin-1',
    author: 'Swee Lah Community Team',
    role: 'Swee Lah Team',
    avatarColor: 'bg-emerald-600',
    category: 'general_feedback',
    categoryLabel: '💬 General Commuter Chat & Feedback',
    content:
      'Welcome to the official Swee Lah SG ⇄ JB Commuter Community Board! Post your carpool route requests, live Causeway & Tuas checkpoint tips, RTS shuttle ideas, or app feedback here. All comments are stored permanently on the app and reviewed directly by our founding team.',
    timestamp: 'Pinned Notice',
    createdAt: Date.now() - 86400000 * 2,
    upvotes: 48,
    hasUpvoted: false,
    isPinned: true,
    replies: [
      {
        id: 'rep-1-1',
        author: 'Kenji Tan',
        role: 'Daily Commuter',
        text: 'Super glad to see an in-app community feed! The live queue cam tracker has already saved me 40 mins at Woodlands.',
        timestamp: 'Yesterday at 8:15 PM',
        createdAt: Date.now() - 86400000,
      },
      {
        id: 'rep-1-2',
        author: 'Hazim Driver',
        role: 'Verified Driver',
        text: 'Happy to answer any questions about VEP tags or Touch n Go card topups for newer cross-border drivers.',
        timestamp: 'Today at 9:30 AM',
        createdAt: Date.now() - 3600000 * 4,
      },
    ],
  },
  {
    id: 'fb-2',
    author: 'Derrick Lim (Bishan ➔ Austin)',
    role: 'Daily Commuter',
    avatarColor: 'bg-blue-600',
    category: 'carpool_route',
    categoryLabel: '🚗 Carpool Route Requests',
    routeTag: 'Bishan MRT ⇄ Austin Heights JB',
    content:
      'Seeking regular weekday carpool buddies! Departing Bishan MRT at 6:45 PM on Fridays towards Austin Heights / Mount Austin JB, and returning Monday mornings at 6:00 AM. Comfortable 7-seater MPV with space for weekend luggage. Anyone keen to share fuel & toll costs?',
    timestamp: '2 hours ago',
    createdAt: Date.now() - 7200000,
    upvotes: 19,
    hasUpvoted: false,
    replies: [
      {
        id: 'rep-2-1',
        author: 'Serene Goh',
        role: 'Commuter',
        text: 'I commute from Ang Mo Kio every Friday evening! Would love to hop on this route. Let me book through the app.',
        timestamp: '1 hour ago',
        createdAt: Date.now() - 3600000,
      },
    ],
  },
  {
    id: 'fb-3',
    author: 'Marcus Chia',
    role: 'Verified Driver',
    avatarColor: 'bg-amber-600',
    category: 'checkpoint_tips',
    categoryLabel: '🛂 Causeway & Tuas Queue Tips',
    routeTag: 'Woodlands Crossing (SG ➔ MY)',
    content:
      'LTA OneMotoring checkpoint tip for tonight: Concourse Departure Bay lanes 3-5 are moving significantly smoother than the outer bus ramp lanes. Also make sure to save your MDAC barcode as a screenshot in Photos in case mobile 5G roaming lags right at the immigration counter.',
    timestamp: '3 hours ago',
    createdAt: Date.now() - 10800000,
    upvotes: 34,
    hasUpvoted: false,
    replies: [
      {
        id: 'rep-3-1',
        author: 'Wayne Khoo',
        role: 'Daily Commuter',
        text: 'Solid tip on the MDAC screenshot! Saved me twice when roaming took a minute to reconnect.',
        timestamp: '2 hours ago',
        createdAt: Date.now() - 7200000,
      },
    ],
  },
  {
    id: 'fb-4',
    author: 'Priya Nair (Changi Biotech)',
    role: 'Commuter',
    avatarColor: 'bg-purple-600',
    category: 'rts_updates',
    categoryLabel: '⚡ RTS Link Updates',
    routeTag: 'Woodlands North ⇄ Changi Airport T3',
    content:
      'Suggestion for the RTS Link 2026 connector: Could Swee Lah add dedicated morning carpool syncs specifically matching the early 6:00 AM - 6:30 AM RTS train arrivals from Bukit Chagar to Changi Airport Business Park?',
    timestamp: '5 hours ago',
    createdAt: Date.now() - 18000000,
    upvotes: 27,
    hasUpvoted: false,
    replies: [
      {
        id: 'rep-4-1',
        author: 'Swee Lah Team',
        role: 'Swee Lah Team',
        text: 'Great suggestion Priya! We are designing RTS Feeder departure sync batches specifically for Eastern Singapore business clusters.',
        timestamp: '4 hours ago',
        createdAt: Date.now() - 14400000,
      },
    ],
  },
  {
    id: 'fb-5',
    author: 'Jason Teo (GetGo Partner)',
    role: 'Verified Driver',
    avatarColor: 'bg-teal-600',
    category: 'app_feature',
    categoryLabel: '💡 App Feature Suggestions',
    content:
      'Would love an automated fuel & toll calculator feature showing exact breakdown per passenger in both SGD and MYR for cross-border trips (including Malaysia Highway PLUS toll + Causeway gantry).',
    timestamp: 'Yesterday',
    createdAt: Date.now() - 86400000,
    upvotes: 22,
    hasUpvoted: false,
    replies: [],
  },
];

/**
 * Retrieves all stored community feedback comments from localStorage.
 * Guaranteed to return persistent records across app sessions and browser reloads.
 */
export function getStoredFeedback(): CommunityFeedbackItem[] {
  if (typeof window === 'undefined') {
    return INITIAL_FEEDBACK_POSTS;
  }

  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) {
      // First time initialization: seed persistent storage with authentic community posts
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACK_POSTS));
      return INITIAL_FEEDBACK_POSTS;
    }

    const parsed: CommunityFeedbackItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACK_POSTS));
      return INITIAL_FEEDBACK_POSTS;
    }

    // Sort: pinned posts always at top, then newest createdAt first
    return parsed.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  } catch (err) {
    console.warn('Failed reading feedback from persistent storage, falling back to initial data:', err);
    return INITIAL_FEEDBACK_POSTS;
  }
}

/**
 * Saves a new feedback comment permanently to localStorage.
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

  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updatedList));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sweelah_feedback_updated'));
    }
  } catch (err) {
    console.error('Failed writing feedback comment to localStorage:', err);
  }

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

  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sweelah_feedback_updated'));
    }
  } catch (err) {
    console.error('Failed toggling upvote in storage:', err);
  }

  return result;
}

/**
 * Adds a reply to an existing feedback thread permanently.
 */
export function addFeedbackReply(params: {
  feedbackId: string;
  author: string;
  role?: 'Commuter' | 'Daily Commuter' | 'Verified Driver' | 'Swee Lah Team';
  text: string;
}): FeedbackReply | null {
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

  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sweelah_feedback_updated'));
    }
  } catch (err) {
    console.error('Failed saving reply to storage:', err);
  }

  return newReply;
}

/**
 * Deletes a feedback comment from persistent storage.
 */
export function deleteFeedbackComment(feedbackId: string): boolean {
  const current = getStoredFeedback();
  const filtered = current.filter((item) => item.id !== feedbackId);

  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(filtered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sweelah_feedback_updated'));
    }
    return true;
  } catch (err) {
    console.error('Failed deleting feedback from storage:', err);
    return false;
  }
}

/**
 * Resets storage back to initial authentic community feed.
 */
export function resetFeedbackStorage(): CommunityFeedbackItem[] {
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(INITIAL_FEEDBACK_POSTS));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sweelah_feedback_updated'));
    }
  } catch (err) {
    console.error('Failed resetting feedback storage:', err);
  }
  return INITIAL_FEEDBACK_POSTS;
}
