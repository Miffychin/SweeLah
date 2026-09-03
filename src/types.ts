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
