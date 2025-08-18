export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  yes_sub_title: string;
  no_sub_title: string;
  open_time: string;
  close_time: string;
  expected_expiration_time: string;
  expiration_time: string;
  status: string;
  volume: number;
  volume_24h: number;
  liquidity: number;
  open_interest: number;
  last_price: number;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  rules_primary: string;
  rules_secondary: string;
  category?: string;
}

export interface KalshiApiResponse {
  markets: KalshiMarket[];
  cursor?: string;
}

const KALSHI_BASE_URL = 'https://api.elections.kalshi.com/trade-api/v2';

export class KalshiApiService {
  static async getMarkets(limit: number = 20, cursor?: string): Promise<KalshiApiResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(cursor && { cursor })
      });

      const response = await fetch(`${KALSHI_BASE_URL}/markets?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: KalshiApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Kalshi markets:', error);
      throw error;
    }
  }

  static async getTrendingMarkets(limit: number = 10): Promise<KalshiMarket[]> {
    try {
      // Get markets and sort by volume and liquidity to find trending ones
      const response = await this.getMarkets(limit * 2); // Get more to filter from
      
      // Sort by volume (descending) and then by liquidity (descending)
      const sortedMarkets = response.markets.sort((a, b) => {
        // First sort by volume
        if (b.volume !== a.volume) {
          return b.volume - a.volume;
        }
        // Then by liquidity
        return b.liquidity - a.liquidity;
      });

      // Return top trending markets
      return sortedMarkets.slice(0, limit);
    } catch (error) {
      console.error('Error fetching trending markets:', error);
      throw error;
    }
  }

  static async getMarketsByCategory(category: string, limit: number = 10): Promise<KalshiMarket[]> {
    try {
      const response = await this.getMarkets(limit * 2);
      
      // Filter by category if specified
      if (category && category !== 'all') {
        return response.markets.filter(market => 
          market.category?.toLowerCase().includes(category.toLowerCase()) ||
          market.title.toLowerCase().includes(category.toLowerCase())
        ).slice(0, limit);
      }
      
      return response.markets.slice(0, limit);
    } catch (error) {
      console.error('Error fetching markets by category:', error);
      throw error;
    }
  }

  // Helper method to categorize markets based on title/content
  static categorizeMarket(market: KalshiMarket): string {
    const title = market.title.toLowerCase();
    
    if (title.includes('soccer') || title.includes('football') || title.includes('game') || title.includes('vs')) {
      return 'sports';
    } else if (title.includes('fast') || title.includes('sanction') || title.includes('referendum') || title.includes('nuclear')) {
      return 'politics';
    } else if (title.includes('election') || title.includes('vote') || title.includes('president')) {
      return 'politics';
    } else if (title.includes('crypto') || title.includes('bitcoin') || title.includes('ethereum')) {
      return 'finance';
    } else if (title.includes('movie') || title.includes('film') || title.includes('oscar')) {
      return 'entertainment';
    } else if (title.includes('album') || title.includes('music') || title.includes('concert')) {
      return 'music';
    } else {
      return 'general';
    }
  }

  // Transform Kalshi market to our app's format
  static transformMarket(market: KalshiMarket) {
    return {
      id: market.ticker,
      title: market.title,
      description: market.rules_primary || market.subtitle || 'No description available',
      category: this.categorizeMarket(market),
      endDate: market.expected_expiration_time,
      totalVolume: market.volume,
      participants: market.open_interest,
      status: market.status === 'active' ? 'open' : market.status === 'closed' ? 'closed' : 'settled',
      yesPrice: market.yes_ask,
      noPrice: market.no_ask,
      liquidity: market.liquidity,
      ticker: market.ticker,
      marketType: market.market_type
    };
  }
}
