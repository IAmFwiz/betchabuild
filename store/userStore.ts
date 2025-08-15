import { create } from 'zustand';
import { supabase } from '../lib/supabase/client';

export interface User {
  id: string;
  email: string;
  username?: string;
  virtualBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
  refreshUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile from database
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        set({
          user: {
            id: profile.id,
            email: profile.email,
            username: profile.username,
            virtualBalance: profile.virtual_balance || 10000, // Default $10,000
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at),
          },
          loading: false,
        });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign in failed',
        loading: false,
      });
    }
  },

  signUp: async (email: string, password: string, username?: string) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            username,
            virtual_balance: 10000, // Start with $10,000 virtual balance
          });

        if (profileError) throw profileError;

        // Sign in the user after successful signup
        await get().signIn(email, password);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Sign up failed',
        loading: false,
      });
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  updateBalance: (newBalance: number) => {
    const { user } = get();
    if (user) {
      set({
        user: {
          ...user,
          virtualBalance: newBalance,
          updatedAt: new Date(),
        },
      });
    }
  },

  refreshUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error && profile) {
        set({
          user: {
            id: profile.id,
            email: profile.email,
            username: profile.username,
            virtualBalance: profile.virtual_balance || 10000,
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at),
          },
        });
      }
    }
  },
}));
