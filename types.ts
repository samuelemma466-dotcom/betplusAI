
export interface Team {
  name: string;
  logo: string;
}

export type MarketType = '1x2' | 'OverUnder' | 'DoubleChance' | 'Moneyline' | 'Handicap' | 'Total' | 'Winner';

export interface Odd {
  id: string;
  label: string;
  value: number;
  marketType: MarketType;
  prevValue?: number;
  isBoosted?: boolean;
  originalValue?: number;
}

export interface StatItem {
  label: string;
  home: number;
  away: number;
  type: 'percent' | 'count';
}

export type SportCategory = 'Soccer' | 'Basketball' | 'Tennis' | 'Esports' | 'Cricket';

export interface Match {
  id: string;
  sport: SportCategory;
  league: string;
  startTime: Date;
  isLive: boolean;
  hasStream?: boolean;
  streamUrl?: string;
  minute?: number;
  period?: string;
  homeTeam: Team;
  awayTeam: Team;
  scores?: {
    home: number;
    away: number;
    detail?: string;
  };
  odds: {
    main: Odd[];
    secondary: Odd[];
  };
  stats?: StatItem[];
}

export interface BetSelection {
  matchId: string;
  selectionId: string;
  matchTitle: string;
  selectionLabel: string;
  oddValue: number;
  marketType: string;
}

export interface JackpotMatch {
  id: string;
  league: string;
  startTime: Date;
  homeTeam: Team;
  awayTeam: Team;
}

export interface PlacedBet {
  id: string;
  selections: BetSelection[];
  stake: number;
  totalOdds: number;
  potentialReturn: number;
  status: 'open' | 'won' | 'lost' | 'cashed_out';
  placedAt: string;
  cashOutOffer?: number;
}

export type AppView = 
  | 'sports' 
  | 'casino'
  | 'jackpot' 
  | 'my-bets' 
  | 'deposit' 
  | 'withdraw' 
  | 'profile' 
  | 'transactions' 
  | 'notifications' 
  | 'settings' 
  | 'security'
  | 'verification' 
  | 'bonuses'
  | 'help' 
  | 'responsible-gaming';

export type OddsFormat = 'decimal' | 'fractional' | 'american';

// --- LOCALIZATION TYPES ---
export type Language = 'en-US' | 'en-UK' | 'fr' | 'es' | 'de';
export type Country = 'US' | 'UK' | 'NG' | 'KE' | 'ZA' | 'CA' | 'EU';
export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'NGN' | 'KES' | 'CAD';

export interface AppSettings {
  theme: 'light' | 'dark';
  oddsFormat: OddsFormat;
  defaultStake: number;
  autoAcceptOdds: boolean;
  privacyMode: boolean; // Expert feature: Balance Masking
  language: Language;
  country: Country;
  currency: CurrencyCode;
  notifications: {
    marketing: boolean;
    matchEvents: boolean;
    betSettled: boolean;
  };
}

// --- SECURITY & ACCOUNT TYPES ---
export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  id: string;
  level: 1 | 2 | 3;
  joinDate: string;
}

export interface LoginSession {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityState {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  kycLevel: 1 | 2 | 3;
  lastPasswordChange: string;
}

export interface Bonus {
  id: string;
  title: string;
  amount: number;
  type: 'deposit_match' | 'free_bet' | 'cashback';
  status: 'active' | 'pending' | 'completed';
  expiry: string;
  wagerReq: number; // Total amount needed to wager
  wagerProgress: number; // Current amount wagered
}

// --- NEW FINANCIAL TYPES ---
export type TransactionStatus = 'Success' | 'Pending' | 'Failed' | 'Processing';
export type TransactionType = 'Deposit' | 'Withdrawal' | 'Bet Placement' | 'Bet Win' | 'Bonus';

export interface Transaction {
  id: string;
  type: TransactionType;
  method: string; // e.g. "Visa **** 4242", "Bitcoin"
  amount: number;
  date: string;
  status: TransactionStatus;
  reference?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'crypto' | 'wallet' | 'bank';
  icon: any; // Lucide icon
  detail?: string; // "Instant", "1-3 Days"
  fee?: string; // "Free", "1%"
  minLimit: number;
  maxLimit: number;
}
