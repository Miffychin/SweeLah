export type Currency = 'SGD' | 'MYR';

export type RideType = 'instant' | 'scheduled';

export type LanguagePool = 'English / Chinese' | 'Malay / English' | 'Korean Pool 🇰🇷' | 'Japanese Pool 🇯🇵' | 'All Languages';

export interface RouteStop {
  id: string;
  name: string;
  shortName: string;
  area: string;
  type: 'mrt' | 'ciq' | 'mall' | 'airport' | 'hub';
  country: 'SG' | 'MY';
}

export interface RidePreferences {
  quietMode: boolean;
  femaleOnly: boolean;
  luggageCount: number;
  languagePool: LanguagePool;
  rtsFeederSync: boolean;
}

export interface PoolDriver {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  rating: number;
  tripCount: number;
  vehicleModel: string;
  plateNumber: string;
  isHostPartner?: boolean;
  hostProvider?: 'GetGo' | 'Tribecar' | 'Private Owner' | 'BlueSG';
  verifiedSingpass: boolean;
  verifiedVEP: boolean;
}

export interface CarpoolRide {
  id: string;
  driver: PoolDriver;
  pickup: RouteStop;
  dropoff: RouteStop;
  departsInMinutes: number; // For instant
  departureTimeStr: string;
  departureDateStr: string;
  seatsTotal: number;
  seatsAvailable: number;
  seatPriceSGD: number;
  seatPriceMYR: number;
  tags: string[];
  isFemaleOnly: boolean;
  isQuiet: boolean;
  notes?: string;
}

export interface ActiveBooking {
  bookingId: string;
  ride: CarpoolRide;
  seatsBooked: number;
  totalFareSGD: number;
  totalFareMYR: number;
  bookedAt: string;
  status: 'confirmed' | 'driver_en_route' | 'clearing_customs' | 'completed';
  passCode: string;
  mdacVerified: boolean;
  sgacAutoFilled: boolean;
  pickupBay: string;
  driverEtaMinutes: number;
}

export interface CheckpointStatus {
  id: string;
  name: string;
  subtitle: string;
  sgToMyTimeMin: number;
  myToSgTimeMin: number;
  status: 'clear' | 'moderate' | 'heavy';
  lastUpdated: string;
  cameraName: string;
  imageUrl?: string;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export type FeedbackCategory =
  | 'carpool_route'
  | 'checkpoint_tips'
  | 'rts_updates'
  | 'app_feature'
  | 'general_feedback';

export interface FeedbackReply {
  id: string;
  author: string;
  role?: 'Commuter' | 'Daily Commuter' | 'Verified Driver' | 'Swee Lah Team';
  text: string;
  timestamp: string;
  createdAt: number;
}

export type ViewMode = 'app' | 'web';

export type EyeComfortMode = 'sage' | 'sepia' | 'night';

export interface OneMotoringCamera {
  id: string; // '2701' | '2702' | '2704' | '4703' | '4712' | '4713'
  checkpoint: 'woodlands' | 'tuas';
  name: string; // Official OneMotoring title e.g. "View from Woodlands Causeway (Towards Johor)"
  direction: string; // e.g. "SG ➔ JB (Causeway)"
  locationDescription: string;
  imageUrl: string;
  timestamp: string;
  formattedTime?: string;
  latitude: number;
  longitude: number;
  sourceUrl: string;
  isOnline: boolean;
}

export interface CommunityFeedbackItem {
  id: string;
  author: string;
  role?: 'Commuter' | 'Daily Commuter' | 'Verified Driver' | 'Swee Lah Team';
  avatarColor?: string;
  category: FeedbackCategory;
  categoryLabel: string;
  routeTag?: string;
  content: string;
  timestamp: string;
  createdAt: number;
  upvotes: number;
  hasUpvoted?: boolean;
  replies: FeedbackReply[];
  isPinned?: boolean;
  disqusLinked?: boolean;
  disqusThreadId?: string;
  disqusUrl?: string;
}

export interface DisqusHealthStatus {
  status: 'healthy' | 'degraded' | 'offline';
  operational: boolean;
  shortname: string;
  forumUrl: string;
  embedScript: string;
  countScript: string;
  threadIdentifier: string;
  pageUrl: string;
  pageTitle: string;
  latencyMs: number;
  uptimePercentage: string;
  lastChecked: string;
  commentsLinked: boolean;
  bridgeMode: string;
}

// =========================================================================
// DISQUS JAVASCRIPT & TYPESCRIPT COMPATIBILITY TYPES
// =========================================================================

export interface DisqusConfigPage {
  identifier?: string;
  url?: string;
  title?: string;
  category_id?: string;
}

export interface DisqusCommentEvent {
  id: string;
  text?: string;
  parent?: string;
  author?: {
    name?: string;
    username?: string;
    avatar?: { small?: { permalink?: string } };
  };
}

export interface DisqusCallbacks {
  onNewComment?: Array<(comment: DisqusCommentEvent) => void>;
  onReady?: Array<() => void>;
  onPaginate?: Array<() => void>;
  onIdentify?: Array<(user: any) => void>;
}

export interface DisqusConfigContext {
  page: DisqusConfigPage;
  callbacks?: DisqusCallbacks;
  language?: string;
}

export interface DisqusResetOptions {
  reload: boolean;
  config?: (this: DisqusConfigContext) => void;
}

export interface DisqusWindowGlobal {
  reset: (options: DisqusResetOptions) => void;
  host?: {
    _loadEmbed?: () => void;
  };
}

export interface DisqusWidgetsGlobal {
  displayCount?: (data: any) => void;
  getCount?: (options?: { reset?: boolean }) => void;
}

declare global {
  interface Window {
    DISQUS?: DisqusWindowGlobal;
    DISQUSWIDGETS?: DisqusWidgetsGlobal;
    disqus_config?: (this: DisqusConfigContext) => void;
    disqus_shortname?: string;
    disqus_identifier?: string;
    disqus_url?: string;
    disqus_title?: string;
  }
}


