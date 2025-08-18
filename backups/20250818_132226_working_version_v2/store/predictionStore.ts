import { create } from 'zustand';

interface Prediction {
  id: string;
  title: string;
  category: string;
  image_url?: string;
  market_id?: string;
  yes_price: number;
  no_price: number;
  end_date: string;
  volume?: number;
  liquidity?: number;
}

interface PredictionStore {
  predictions: Prediction[];
  currentIndex: number;
  isLoading: boolean;
  error: string | null;
  setPredictions: (predictions: Prediction[]) => void;
  setCurrentIndex: (index: number) => void;
  incrementIndex: () => void;
  fetchPredictions: () => Promise<void>;
  getCurrentPrediction: () => Prediction | null;
  getNextPredictions: (count: number) => Prediction[];
}

export const usePredictionStore = create<PredictionStore>((set, get) => ({
  predictions: [],
  currentIndex: 0,
  isLoading: false,
  error: null,

  setPredictions: (predictions: Prediction[]) => {
    set({ predictions, error: null });
  },

  setCurrentIndex: (index: number) => void {
    set({ currentIndex: index });
  },

  incrementIndex: () => {
    set((state) => ({
      currentIndex: (state.currentIndex + 1) % state.predictions.length,
    }));
  },

  fetchPredictions: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // In production, this would fetch from your API
      // For now, using mock data
      const mockPredictions: Prediction[] = [
        {
          id: '1',
          title: 'Will the Fed cut interest rates by 0.5% at the next meeting?',
          category: 'Economics',
          market_id: 'FED-23DEC-T0.5',
          yes_price: 65,
          no_price: 35,
          end_date: '2024-12-23',
        },
        {
          id: '2',
          title: 'Will Tesla stock reach $300 by end of month?',
          category: 'Markets',
          market_id: 'TSLA-300-EOM',
          yes_price: 42,
          no_price: 58,
          end_date: '2024-12-31',
        },
        {
          id: '3',
          title: 'Will Bitcoin hit $100,000 before 2025?',
          category: 'Crypto',
          market_id: 'BTC-100K-2025',
          yes_price: 78,
          no_price: 22,
          end_date: '2024-12-31',
        },
        // Generate more predictions
        ...Array.from({ length: 17 }, (_, i) => ({
          id: `${i + 4}`,
          title: `Prediction ${i + 4}: Will this event happen before the deadline?`,
          category: ['Economics', 'Markets', 'Politics', 'Tech', 'Sports', 'Crypto'][i % 6],
          market_id: `MARKET-${i + 4}`,
          yes_price: Math.floor(Math.random() * 60) + 20,
          no_price: 100 - Math.floor(Math.random() * 60) - 20,
          end_date: '2024-12-31',
        })),
      ];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      set({ 
        predictions: mockPredictions, 
        isLoading: false,
        error: null 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch predictions' 
      });
    }
  },

  getCurrentPrediction: () => {
    const state = get();
    if (state.predictions.length === 0) return null;
    return state.predictions[state.currentIndex];
  },

  getNextPredictions: (count: number) => {
    const state = get();
    const { predictions, currentIndex } = state;
    
    if (predictions.length === 0) return [];
    
    const result: Prediction[] = [];
    for (let i = 0; i < count; i++) {
      const index = (currentIndex + i) % predictions.length;
      result.push(predictions[index]);
    }
    return result;
  },
}));
