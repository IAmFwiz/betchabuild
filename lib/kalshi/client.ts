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
  private baseURL = 'https://api.kalshi.com/trade-api/v2';
  private apiKey = process.env.EXPO_PUBLIC_KALSHI_API_KEY;

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      },
      timeout: 10000, // 10 second timeout
    });
  }

  /**
   * Get markets with optional filtering
   */
  async getMarkets(params?: {
    limit?: number;
    status?: string;
    category?: string;
    cursor?: string;
  }): Promise<KalshiPaginatedResponse<KalshiMarket>> {
    try {
      const response = await this.client.get('/markets', { params });
      return response.data;
    } catch (error) {
      console.error('Kalshi API error:', error);
      throw new Error(`Failed to fetch markets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get trending markets (high volume)
   */
  async getTrendingMarkets(limit: number = 20): Promise<KalshiMarket[]> {
    try {
      const response = await this.getMarkets({ 
        limit: limit * 2, // Get more to filter from
        status: 'open'
      });
      
      // Sort by volume (descending) and return top results
      const sortedMarkets = response.data.sort((a, b) => {
        // First sort by volume
        if (b.volume !== a.volume) {
          return b.volume - a.volume;
        }
        // Then by liquidity
        return (b.yes_bid || 0) - (a.yes_bid || 0);
      });
      
      return sortedMarkets.slice(0, limit);
    } catch (error) {
      console.error('Error fetching trending markets:', error);
      throw error;
    }
  }

  /**
   * Get markets by category
   */
  async getMarketsByCategory(category: string, limit: number = 20): Promise<KalshiMarket[]> {
    try {
      const response = await this.getMarkets({ 
        category, 
        limit: limit * 2,
        status: 'open'
      });
      
      // Filter by category if specified
      if (category && category !== 'all') {
        return response.data
          .filter(market => 
            market.category?.toLowerCase().includes(category.toLowerCase()) ||
            market.title.toLowerCase().includes(category.toLowerCase())
          )
          .slice(0, limit);
      }
      
      return response.data.slice(0, limit);
    } catch (error) {
      console.error('Error fetching markets by category:', error);
      throw error;
    }
  }

  /**
   * Get specific market by ticker
   */
  async getMarket(ticker: string): Promise<KalshiMarket> {
    try {
      const response = await this.client.get(`/markets/${ticker}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching market ${ticker}:`, error);
      throw new Error(`Failed to fetch market ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get market order book
   */
  async getMarketOrderBook(ticker: string): Promise<KalshiOrderBook> {
    try {
      const response = await this.client.get(`/markets/${ticker}/order-book`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order book for ${ticker}:`, error);
      throw new Error(`Failed to fetch order book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get market history
   */
  async getMarketHistory(ticker: string, limit: number = 100): Promise<any[]> {
    try {
      const response = await this.client.get(`/markets/${ticker}/history`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching history for ${ticker}:`, error);
      throw new Error(`Failed to fetch market history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate implied probability from price
   */
  calculateImpliedProbability(price: number): number {
    if (price <= 0 || price > 100) return 0;
    return (price / 100) * 100;
  }

  /**
   * Calculate potential payout
   */
  calculatePotentialPayout(stake: number, yesPrice: number): number {
    if (yesPrice <= 0 || yesPrice > 100) return 0;
    return (stake * 100) / yesPrice;
  }

  /**
   * Get API status
   */
  async getStatus(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.client.get('/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching API status:', error);
      throw new Error(`Failed to fetch API status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const kalshiClient = new KalshiClient();
