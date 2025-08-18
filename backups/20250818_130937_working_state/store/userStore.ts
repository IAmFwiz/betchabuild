import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  credits: number;
  xp: number;
  streak: number;
  level: number;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  updateCredits: (credits: number) => void;
  updateXP: (xp: number) => void;
  updateStreak: (streak: number) => void;
  logout: () => void;
  getUserStats: () => { streak: number; xp: number; credits: number };
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user: User) => {
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      updateCredits: (credits: number) => {
        set((state) => ({
          user: state.user ? { ...state.user, credits } : null,
        }));
      },

      updateXP: (xp: number) => {
        set((state) => ({
          user: state.user ? { ...state.user, xp } : null,
        }));
      },

      updateStreak: (streak: number) => {
        set((state) => ({
          user: state.user ? { ...state.user, streak } : null,
        }));
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      getUserStats: () => {
        const state = get();
        if (state.user) {
          return {
            streak: state.user.streak,
            xp: state.user.xp,
            credits: state.user.credits,
          };
          }
        // Return default values if no user
        return {
          streak: 0,
          xp: 0,
          credits: 10000, // Default starting credits
        };
      },
    }),
    {
      name: 'betcha-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
