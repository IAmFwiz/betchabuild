export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  virtual_balance: number;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  kalshi_market_ticker: string;
  kalshi_event_ticker: string;
  market_title: string;
  category: string;
  prediction_type: 'yes' | 'no';
  stake: number;
  odds_at_time: number;
  potential_payout: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  resolved_at?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  unlocked_at: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  virtual_balance: number;
  xp: number;
  total_predictions: number;
  wins: number;
  win_rate: number;
}

// Database enums
export type PredictionType = 'yes' | 'no';
export type PredictionStatus = 'pending' | 'won' | 'lost' | 'cancelled';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// User stats
export interface UserStats {
  totalPredictions: number;
  wins: number;
  losses: number;
  winRate: number;
  totalStake: number;
  totalPayout: number;
  profit: number;
  currentStreak: number;
  longestStreak: number;
}

// Achievement types
export const ACHIEVEMENT_TYPES = {
  FIRST_WIN: 'first_win',
  STREAK_5: 'streak_5',
  STREAK_10: 'streak_10',
  STREAK_25: 'streak_25',
  PROFIT_100: 'profit_100',
  PROFIT_500: 'profit_500',
  PROFIT_1000: 'profit_1000',
  PREDICTIONS_10: 'predictions_10',
  PREDICTIONS_50: 'predictions_50',
  PREDICTIONS_100: 'predictions_100',
  WIN_RATE_60: 'win_rate_60',
  WIN_RATE_70: 'win_rate_70',
  WIN_RATE_80: 'win_rate_80',
} as const;

export type AchievementType = typeof ACHIEVEMENT_TYPES[keyof typeof ACHIEVEMENT_TYPES];
