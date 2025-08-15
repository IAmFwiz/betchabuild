import axios, { AxiosInstance } from 'axios';
import { 
  KalshiMarket, 
  KalshiEvent, 
  KalshiSeries, 
  KalshiOrderBook,
  KalshiResponse,
  KalshiPaginatedResponse,
  MarketFilters,
  CreateOrderRequest
} from './types';

class KalshiClient {
  private client: AxiosInstance;
  private baseURL = 'https://api.elections.kalshi.com/trade-api/v2';
  
  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getMarkets(filters: MarketFilters = {}): Promise<KalshiPaginatedResponse<KalshiMarket>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.cursor) params.append('cursor', filters.cursor);
      if (filters.category) params.append('category', filters.category);
      
      const response = await this.client.get(`/markets?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching markets:', error);
      throw error;
    }
  }

  async getTrendingMarkets(limit: number = 20): Promise<KalshiMarket[]> {
    try {
      const response = await this.getMarkets({ limit });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching trending markets:', error);
      throw error;
    }
  }

  async getMarketsByCategory(category: string, limit: number = 20): Promise<KalshiMarket[]> {
    try {
      const response = await this.getMarkets({ category, limit });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching markets by category:', error);
      throw error;
    }
  }

  async getMarket(ticker: string): Promise<KalshiMarket> {
    try {
      const response = await this.client.get(`/markets/${ticker}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market:', error);
      throw error;
    }
  }

  // Helper method to calculate implied probability from price
  calculateImpliedProbability(price: number): number {
    return price / 100;
  }

  // Helper method to calculate potential payout
  calculatePotentialPayout(stake: number, yesPrice: number): number {
    const impliedProb = this.calculateImpliedProbability(yesPrice);
    return stake / impliedProb;
  }
}

export const kalshiClient = new KalshiClient();
export default KalshiClient;
