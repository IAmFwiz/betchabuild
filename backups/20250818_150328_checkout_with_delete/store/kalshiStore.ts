import { create } from 'zustand';
import { AppPrediction } from '../lib/kalshi/transformer';

interface KalshiStore {
  predictions: AppPrediction[];
  trendingPredictions: AppPrediction[];
  categoryPredictions: Record<string, AppPrediction[]>;
  loading: boolean;
  error: string | null;
  lastFetch: number;
  
  fetchPredictions: () => Promise<void>;
  fetchTrending: () => Promise<void>;
  fetchByCategory: (category: string) => Promise<void>;
  refreshIfNeeded: () => Promise<void>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Mock data for now to prevent crashes
const mockPredictions: AppPrediction[] = [
  {
    id: '1',
    title: 'Will the Lakers win the NBA Championship?',
    category: 'sports',
    imageUri: 'https://picsum.photos/400/600?random=1',
    currentOdds: { yes: 65, no: 35 },
    volume: 15000,
    closesAt: '2 days',
    closesAtTimestamp: Date.now() + 172800000,
    description: 'Market closes in 2 days',
    trending: true,
    kalshiTicker: 'LAKERS-NBA-CHAMP',
    eventTicker: 'NBA-2024',
  },
  {
    id: '2',
    title: 'Will Taylor Swift release a new album this year?',
    category: 'music',
    imageUri: 'https://picsum.photos/400/600?random=2',
    currentOdds: { yes: 45, no: 55 },
    volume: 25000,
    closesAt: '1 week',
    closesAtTimestamp: Date.now() + 604800000,
    description: 'Market closes in 1 week',
    trending: true,
    kalshiTicker: 'TAYLOR-ALBUM-2024',
    eventTicker: 'MUSIC-2024',
  },
  {
    id: '3',
    title: 'Will the new Marvel movie gross over $500M?',
    category: 'movies',
    imageUri: 'https://picsum.photos/400/600?random=3',
    currentOdds: { yes: 70, no: 30 },
    volume: 18000,
    closesAt: '3 days',
    closesAtTimestamp: Date.now() + 259200000,
    description: 'Market closes in 3 days',
    trending: false,
    kalshiTicker: 'MARVEL-500M-2024',
    eventTicker: 'MOVIES-2024',
  },
];

export const useKalshiStore = create<KalshiStore>((set, get) => ({
  predictions: mockPredictions,
  trendingPredictions: mockPredictions,
  categoryPredictions: {},
  loading: false,
  error: null,
  lastFetch: Date.now(),
  
  fetchPredictions: async () => {
    set({ loading: true, error: null });
    try {
      // For now, just use mock data
      set({ 
        predictions: mockPredictions,
        lastFetch: Date.now(),
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch predictions',
        loading: false 
      });
    }
  },
  
  fetchTrending: async () => {
    set({ loading: true, error: null });
    try {
      // For now, just use mock data
      set({ 
        trendingPredictions: mockPredictions,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch trending',
        loading: false 
      });
    }
  },
  
  fetchByCategory: async (category: string) => {
    set({ loading: true, error: null });
    try {
      const filtered = mockPredictions.filter(p => 
        category === 'all' || p.category === category
      );
      set((state) => ({
        categoryPredictions: {
          ...state.categoryPredictions,
          [category]: filtered,
        },
        loading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch category',
        loading: false 
      });
    }
  },
  
  refreshIfNeeded: async () => {
    const { lastFetch, fetchPredictions } = get();
    const now = Date.now();
    
    if (now - lastFetch > CACHE_DURATION) {
      await fetchPredictions();
    }
  },
}));
