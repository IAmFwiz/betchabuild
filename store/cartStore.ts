import { create } from 'zustand';
import { AppPrediction } from '../lib/kalshi/transformer';
import { predictionService } from '../services/predictionService';

interface CartItem {
  prediction: AppPrediction;
  choice: 'yes' | 'no';
  stake: number;
  boosted: boolean;
}

interface CartStore {
  items: CartItem[];
  totalStake: number;
  
  addToCart: (prediction: AppPrediction, choice: 'yes' | 'no') => void;
  removeFromCart: (predictionId: string) => void;
  updateStake: (predictionId: string, stake: number) => void;
  boostPrediction: (predictionId: string) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  totalStake: 0,

  addToCart: (prediction, choice) => {
    set((state) => {
      const exists = state.items.find(item => item.prediction.id === prediction.id);
      if (exists) return state;

      const newItems = [...state.items, {
        prediction,
        choice,
        stake: 1,
        boosted: false,
      }];

      return {
        items: newItems,
        totalStake: newItems.reduce((sum, item) => sum + item.stake, 0),
      };
    });
  },

  removeFromCart: (predictionId) => {
    set((state) => {
      const newItems = state.items.filter(item => item.prediction.id !== predictionId);
      return {
        items: newItems,
        totalStake: newItems.reduce((sum, item) => sum + item.stake, 0),
      };
    });
  },

  updateStake: (predictionId, stake) => {
    set((state) => {
      const newItems = state.items.map(item =>
        item.prediction.id === predictionId
          ? { ...item, stake: Math.min(25, Math.max(1, stake)) }
          : item
      );
      return {
        items: newItems,
        totalStake: newItems.reduce((sum, item) => sum + item.stake, 0),
      };
    });
  },

  boostPrediction: (predictionId) => {
    set((state) => {
      const newItems = state.items.map(item =>
        item.prediction.id === predictionId
          ? { ...item, stake: Math.min(25, item.stake * 5), boosted: true }
          : item
      );
      return {
        items: newItems,
        totalStake: newItems.reduce((sum, item) => sum + item.stake, 0),
      };
    });
  },

  clearCart: () => {
    set({ items: [], totalStake: 0 });
  },

  checkout: async () => {
    const { items } = get();
    
    // Process each prediction
    const promises = items.map(item =>
      predictionService.placePrediction(
        item.prediction,
        item.choice,
        item.stake
      )
    );

    await Promise.all(promises);
    
    // Clear cart after successful checkout
    set({ items: [], totalStake: 0 });
  },
}));
