import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartItem {
  predictionId: string;
  prediction: {
    id: string;
    title: string;
    category: string;
    image_url?: string;
    market_id?: string;
    yes_price: number;
    no_price: number;
    end_date: string;
  };
  position: 'yes' | 'no';
  amount: number;
}

interface CartStore {
  cartItems: CartItem[];
  totalAmount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (predictionId: string) => void;
  updateAmount: (predictionId: string, amount: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      totalAmount: 0,

      addToCart: (item: CartItem) => {
        set((state) => {
          // Check if item already exists
          const existingItem = state.cartItems.find(
            (cartItem) => cartItem.predictionId === item.predictionId
          );

          if (existingItem) {
            // Update existing item
            return {
              cartItems: state.cartItems.map((cartItem) =>
                cartItem.predictionId === item.predictionId
                  ? { ...cartItem, position: item.position, amount: item.amount }
                  : cartItem
              ),
              totalAmount: state.cartItems.reduce(
                (sum, cartItem) =>
                  cartItem.predictionId === item.predictionId
                    ? sum + item.amount
                    : sum + cartItem.amount,
                0
              ),
            };
          }

          // Add new item
          const newCartItems = [...state.cartItems, item];
          return {
            cartItems: newCartItems,
            totalAmount: newCartItems.reduce((sum, cartItem) => sum + cartItem.amount, 0),
          };
        });
      },

      removeFromCart: (predictionId: string) => {
        set((state) => {
          const newCartItems = state.cartItems.filter(
            (item) => item.predictionId !== predictionId
          );
          return {
            cartItems: newCartItems,
            totalAmount: newCartItems.reduce((sum, item) => sum + item.amount, 0),
            };
          });
        },

        updateAmount: (predictionId: string, amount: number) => {
          set((state) => {
            const newCartItems = state.cartItems.map((item) =>
              item.predictionId === predictionId ? { ...item, amount } : item
            );
            return {
              cartItems: newCartItems,
              totalAmount: newCartItems.reduce((sum, item) => sum + item.amount, 0),
            };
          });
        },

        clearCart: () => {
          set({ cartItems: [], totalAmount: 0 });
        },

        getCartCount: () => {
          const state = get();
          return state.cartItems?.length || 0;
        },
      }),
      {
        name: 'betcha-cart-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          cartItems: state.cartItems || [],
          totalAmount: state.totalAmount || 0,
        }),
      }
    )
  );
