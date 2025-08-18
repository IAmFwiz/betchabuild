export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          display_name: string | null
          avatar_url: string | null
          virtual_balance: number
          xp: number
          level: number
          current_streak: number
          longest_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          virtual_balance?: number
          xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          virtual_balance?: number
          xp?: number
          level?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          kalshi_market_ticker: string
          kalshi_event_ticker: string
          market_title: string
          category: string
          prediction_type: 'yes' | 'no'
          stake: number
          odds_at_time: number
          potential_payout: number
          status: 'pending' | 'won' | 'lost' | 'cancelled'
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          kalshi_market_ticker: string
          kalshi_event_ticker: string
          market_title: string
          category: string
          prediction_type: 'yes' | 'no'
          stake: number
          odds_at_time: number
          potential_payout: number
          status?: 'pending' | 'won' | 'lost' | 'cancelled'
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          kalshi_market_ticker?: string
          kalshi_event_ticker?: string
          market_title?: string
          category?: string
          prediction_type?: 'yes' | 'no'
          stake?: number
          odds_at_time?: number
          potential_payout?: number
          status?: 'pending' | 'won' | 'lost' | 'cancelled'
          resolved_at?: string | null
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          user_id: string
          achievement_type: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_type: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_type?: string
          unlocked_at?: string
        }
      }
    }
    Views: {
      leaderboard: {
        Row: {
          id: string | null
          username: string | null
          display_name: string | null
          avatar_url: string | null
          virtual_balance: number | null
          xp: number | null
          total_predictions: number | null
          wins: number | null
          win_rate: number | null
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
