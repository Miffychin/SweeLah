import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface FeedbackReply {
  id: string;
  author: string;
  role?: string;
  text: string;
  timestamp: string;
  createdAt: number;
}

interface StoredFeedback {
  id: string;
  author: string;
  role?: string;
  avatarColor?: string;
  category: string;
  categoryLabel: string;
  routeTag?: string;
  content: string;
  timestamp: string;
  createdAt: number;
  upvotes: number;
  hasUpvoted?: boolean;
  replies: FeedbackReply[];
  isPinned?: boolean;
}

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'feedback_posts.json');

let feedbackStore: StoredFeedback[] = [];

// Known dummy IDs to filter out permanently from server records
const DUMMY_IDS = new Set(['fb-pin-1', 'fb-2', 'fb-3', 'fb-4', 'fb-5']);
const DUMMY_AUTHORS = new Set([
  'Swee Lah Community Team',
  'Derrick Lim (Bishan ➔ Austin)',
  'Marcus Chia',
  'Priya Nair (Changi Biotech)',
  'Jason Teo (GetGo Partner)',
]);

function sanitizePosts(posts: any[]): StoredFeedback[] {
  if (!Array.isArray(posts)) return [];
  return posts.filter(
    (p) =>
      p &&
      typeof p === 'object' &&
      p.id &&
      !DUMMY_IDS.has(p.id) &&
      (!p.author || !DUMMY_AUTHORS.has(p.author))
  );
}

function loadFeedbackFromFile(): StoredFeedback[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      feedbackStore = sanitizePosts(parsed);
      return feedbackStore;
    }
  } catch (err) {
    console.warn('Could not read feedback file, starting with empty store:', err);
  }
  feedbackStore = [];
  return feedbackStore;
}

function saveFeedbackToFile(posts: StoredFeedback[]): void {
  feedbackStore = posts;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save feedback posts to file:', err);
  }
}

async function startServer() {
  const app = express();

  // Parse JSON payloads
  app.use(express.json());

  // Load stored feedback into memory
  loadFeedbackFromFile();

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // -------------------------------------------------------------------------
  // CROSS-DEVICE FEEDBACK COMMENTS API
  // -------------------------------------------------------------------------

  // 1. GET ALL COMMENTS (Visible across any devices accessing the app)
  app.get('/api/feedback', (req, res) => {
    // Return sorted list: pinned first, then newest createdAt first
    const sorted = [...feedbackStore].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    res.json({ success: true, count: sorted.length, posts: sorted });
  });

  // 2. CREATE NEW COMMENT
  app.post('/api/feedback', (req, res) => {
    try {
      const { author, role, category, categoryLabel, routeTag, content } = req.body;

      if (!content || typeof content !== 'string' || !content.trim()) {
        res.status(400).json({ success: false, error: 'Comment content is required' });
        return;
      }

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

      const newPost: StoredFeedback = {
        id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        author: (author && typeof author === 'string' && author.trim()) || 'Verified Commuter',
        role: role || 'Commuter',
        avatarColor: randomColor,
        category: category || 'general_feedback',
        categoryLabel: categoryLabel || '💬 General Commuter Chat & Feedback',
        routeTag: routeTag?.trim() || undefined,
        content: content.trim(),
        timestamp: `Today at ${timeStr} (${dateStr})`,
        createdAt: Date.now(),
        upvotes: 1,
        hasUpvoted: true,
        replies: [],
        isPinned: false,
      };

      const pinned = feedbackStore.filter((p) => p.isPinned);
      const unpinned = feedbackStore.filter((p) => !p.isPinned);
      const updated = [...pinned, newPost, ...unpinned];

      saveFeedbackToFile(updated);

      console.log(`[API] New comment saved from "${newPost.author}" across all devices. Total: ${updated.length}`);
      res.status(201).json({ success: true, post: newPost });
    } catch (err: any) {
      console.error('Error creating feedback:', err);
      res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
  });

  // 3. UPVOTE COMMENT
  app.post('/api/feedback/:id/upvote', (req, res) => {
    const { id } = req.params;
    let found = false;
    let upvotes = 0;

    const updated = feedbackStore.map((item) => {
      if (item.id === id) {
        found = true;
        const currentUpvotes = item.upvotes || 0;
        upvotes = currentUpvotes + 1;
        return {
          ...item,
          upvotes,
        };
      }
      return item;
    });

    if (!found) {
      res.status(404).json({ success: false, error: 'Comment not found' });
      return;
    }

    saveFeedbackToFile(updated);
    res.json({ success: true, id, upvotes });
  });

  // 4. ADD REPLY TO COMMENT
  app.post('/api/feedback/:id/reply', (req, res) => {
    const { id } = req.params;
    const { author, role, text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ success: false, error: 'Reply text is required' });
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-SG', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    let newReply: FeedbackReply | null = null;
    let found = false;

    const updated = feedbackStore.map((item) => {
      if (item.id === id) {
        found = true;
        newReply = {
          id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          author: (author && typeof author === 'string' && author.trim()) || 'Verified Commuter',
          role: role || 'Commuter',
          text: text.trim(),
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

    if (!found || !newReply) {
      res.status(404).json({ success: false, error: 'Comment not found' });
      return;
    }

    saveFeedbackToFile(updated);
    res.status(201).json({ success: true, reply: newReply });
  });

  // 5. DELETE COMMENT
  app.delete('/api/feedback/:id', (req, res) => {
    const { id } = req.params;
    const updated = feedbackStore.filter((item) => item.id !== id);
    saveFeedbackToFile(updated);
    res.json({ success: true, count: updated.length });
  });

  // 6. CLEAR/RESET COMMENTS
  app.post('/api/feedback/reset', (req, res) => {
    saveFeedbackToFile([]);
    res.json({ success: true, count: 0 });
  });

  // -------------------------------------------------------------------------
  // VITE DEVELOPMENT MIDDLEWARE & PRODUCTION STATIC SERVING
  // -------------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SweeLah Server] Running on http://0.0.0.0:${PORT} with Cross-Device Feedback API enabled`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
