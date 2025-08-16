// services/supabaseService.ts

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  balance: number;
  total_bets: number;
  total_wins: number;
  win_streak: number;
  created_at: string;
}

// Bet history interface
export interface BetHistory {
  id: string;
  user_id: string;
  market_id: string;
  market_question: string;
  side: 'yes' | 'no';
  amount: number;
  odds: number;
  status: 'pending' | 'won' | 'lost';
  created_at: string;
  resolved_at?: string;
  payout?: number;
}

class SupabaseService {
  // Sign up new user
  async signUp(email: string, password: string, username?: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, email, username);
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { user: null, error: error.message };
    }
  }

  // Sign in existing user
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { user: data.user, session: data.session, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { user: null, session: null, error: error.message };
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Create user profile in database
  private async createUserProfile(userId: string, email: string, username?: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          username,
          balance: 1000, // Starting balance
          total_bets: 0,
          total_wins: 0,
          win_streak: 0,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Create profile error:', error);
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  // Update user balance
  async updateBalance(userId: string, amount: number) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { error } = await supabase
        .from('profiles')
        .update({ balance: profile.balance + amount })
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Update balance error:', error);
      return { success: false };
    }
  }

  // Record a bet
  async recordBet(bet: {
    userId: string;
    marketId: string;
    marketQuestion: string;
    side: 'yes' | 'no';
    amount: number;
    odds: number;
  }) {
    try {
      const { data, error } = await supabase
        .from('bet_history')
        .insert({
          user_id: bet.userId,
          market_id: bet.marketId,
          market_question: bet.marketQuestion,
          side: bet.side,
          amount: bet.amount,
          odds: bet.odds,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Update user stats
      await supabase
        .from('profiles')
        .update({ 
          total_bets: supabase.sql`total_bets + 1`,
          balance: supabase.sql`balance - ${bet.amount}`
        })
        .eq('id', bet.userId);

      return { bet: data, error: null };
    } catch (error: any) {
      console.error('Record bet error:', error);
      return { bet: null, error: error.message };
    }
  }

  // Get user's bet history
  async getBetHistory(userId: string, limit = 50): Promise<BetHistory[]> {
    try {
      const { data, error } = await supabase
        .from('bet_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get bet history error:', error);
      return [];
    }
  }

  // Update bet result
  async updateBetResult(betId: string, won: boolean, payout?: number) {
    try {
      const { error } = await supabase
        .from('bet_history')
        .update({
          status: won ? 'won' : 'lost',
          resolved_at: new Date().toISOString(),
          payout: payout || 0,
        })
        .eq('id', betId);

      if (error) throw error;

      // If won, update user balance and stats
      if (won && payout) {
        const { data: bet } = await supabase
          .from('bet_history')
          .select('user_id')
          .eq('id', betId)
          .single();

        if (bet) {
          await supabase
            .from('profiles')
            .update({
              balance: supabase.sql`balance + ${payout}`,
              total_wins: supabase.sql`total_wins + 1`,
              win_streak: supabase.sql`win_streak + 1`,
            })
            .eq('id', bet.user_id);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Update bet result error:', error);
      return { success: false };
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true, error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new SupabaseService();
