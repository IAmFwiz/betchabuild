// services/kalshiService.ts

const KALSHI_API_BASE = 'https://api.kalshi.com/v1';
const KALSHI_API_KEY = process.env.EXPO_PUBLIC_KALSHI_API_KEY || '';
const KALSHI_API_SECRET = process.env.EXPO_PUBLIC_KALSHI_API_SECRET || '';

export interface KalshiMarket {
  id: string;
  ticker: string;
  question: string;
  category: string;
  subcategory?: string;
  yes_price: number;
  no_price: number;
  volume_24h: number;
  close_time: string;
  resolution_source?: string;
  image_url?: string;
}

export interface BetData {
  id: string;
  category: string;
  question: string;
  image: string;
  yesPercentage: number;
  noPercentage: number;
  volume?: number;
  closeTime?: string;
}

class KalshiService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  // For demo purposes, return mock data
  private useMockData = true;

  private mockMarkets: BetData[] = [
    {
      id: '1',
      category: 'SPORTS',
      question: 'Will the Lakers make the NBA playoffs?',
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      yesPercentage: 72,
      noPercentage: 28,
      volume: 45000,
    },
    {
      id: '2',
      category: 'POLITICS',
      question: 'Will the Fed cut rates in Q1 2025?',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
      yesPercentage: 45,
      noPercentage: 55,
      volume: 128000,
    },
    {
      id: '3',
      category: 'ENTERTAINMENT',
      question: 'Will "Dune 3" win Best Picture?',
      image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800',
      yesPercentage: 23,
      noPercentage: 77,
      volume: 8900,
    },
    {
      id: '4',
      category: 'TECHNOLOGY',
      question: 'Will Apple stock hit $250 by March?',
      image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=800',
      yesPercentage: 61,
      noPercentage: 39,
      volume: 67000,
    },
    {
      id: '5',
      category: 'SPORTS',
      question: 'Will the Chiefs win the Super Bowl?',
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
      yesPercentage: 35,
      noPercentage: 65,
      volume: 234000,
    },
  ];

  async authenticate(): Promise<boolean> {
    if (this.useMockData) return true;

    try {
      // Check if token is still valid
      if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return true;
      }

      const response = await fetch(`${KALSHI_API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: KALSHI_API_KEY,
          api_secret: KALSHI_API_SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      this.token = data.token;
      this.tokenExpiry = new Date(Date.now() + 3600000); // 1 hour
      return true;
    } catch (error) {
      console.error('Kalshi authentication error:', error);
      return false;
    }
  }

  async getMarkets(category?: string): Promise<BetData[]> {
    if (this.useMockData) {
      // Return mock data filtered by category if provided
      if (category) {
        return this.mockMarkets.filter(m => m.category === category);
      }
      return this.mockMarkets;
    }

    try {
      await this.authenticate();

      const params = new URLSearchParams({
        limit: '20',
        status: 'open',
        ...(category && { category }),
      });

      const response = await fetch(`${KALSHI_API_BASE}/markets?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch markets');
      }

      const data = await response.json();
      
      // Transform Kalshi data to our format
      return data.markets.map((market: any) => ({
        id: market.id,
        category: market.category.toUpperCase(),
        question: market.title,
        image: `https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800`, // Default
        yesPercentage: Math.round(market.yes_price * 100),
        noPercentage: Math.round(market.no_price * 100),
        volume: market.volume_24h,
        closeTime: market.close_time,
      }));
    } catch (error) {
      console.error('Error fetching markets:', error);
      // Return mock data as fallback
      return this.mockMarkets;
    }
  }

  async placeBet(marketId: string, side: 'yes' | 'no', amount: number): Promise<boolean> {
    if (this.useMockData) {
      console.log(`Mock bet placed: ${side.toUpperCase()} on ${marketId} for $${amount}`);
      return true;
    }

    try {
      await this.authenticate();

      const response = await fetch(`${KALSHI_API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          market_id: marketId,
          side,
          quantity: amount,
          type: 'market',
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error placing bet:', error);
      return false;
    }
  }

  async getUserPositions(): Promise<any[]> {
    if (this.useMockData) {
      return [
        { market: 'Lakers playoffs', side: 'yes', amount: 50, current_value: 58 },
        { market: 'Fed rate cut', side: 'no', amount: 100, current_value: 95 },
      ];
    }

    try {
      await this.authenticate();

      const response = await fetch(`${KALSHI_API_BASE}/positions`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch positions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  }
}

export default new KalshiService();
