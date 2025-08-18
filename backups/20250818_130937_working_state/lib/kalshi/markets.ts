import KalshiClient from './client';
import { KalshiTransformer, AppPrediction, AppEvent } from './transformer';
import { MarketFilters } from './types';

class MarketsService {
  private client: KalshiClient;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.client = new KalshiClient();
  }

  // Get all open markets
  async getOpenMarkets(limit: number = 50): Promise<AppPrediction[]> {
    try {
      const cacheKey = `open_markets_${limit}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      const response = await this.client.getMarkets({
        status: 'open',
        limit,
      });

      const predictions = KalshiTransformer.transformMarkets(response.data);
      const openPredictions = KalshiTransformer.filterOpenPredictions(predictions);
      const sortedPredictions = KalshiTransformer.sortByClosingTime(openPredictions);

      this.setCached(cacheKey, sortedPredictions);
      return sortedPredictions;
    } catch (error) {
      console.error('Failed to fetch open markets:', error);
      return [];
    }
  }

  // Get markets by category
  async getMarketsByCategory(category: string, limit: number = 20): Promise<AppPrediction[]> {
    try {
      const cacheKey = `category_${category}_${limit}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      const response = await this.client.getMarkets({
        category,
        status: 'open',
        limit,
      });

      const predictions = KalshiTransformer.transformMarkets(response.data);
      const openPredictions = KalshiTransformer.filterOpenPredictions(predictions);
      const sortedPredictions = KalshiTransformer.sortByClosingTime(openPredictions);

      this.setCached(cacheKey, sortedPredictions);
      return sortedPredictions;
    } catch (error) {
      console.error(`Failed to fetch markets for category ${category}:`, error);
      return [];
    }
  }

  // Get trending markets
  async getTrendingMarkets(limit: number = 10): Promise<AppPrediction[]> {
    try {
      const cacheKey = `trending_${limit}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      const response = await this.client.getMarkets({
        status: 'open',
        limit: 100, // Get more to find trending ones
      });

      const predictions = KalshiTransformer.transformMarkets(response.data);
      const openPredictions = KalshiTransformer.filterOpenPredictions(predictions);
      const trendingPredictions = KalshiTransformer.getTrendingPredictions(openPredictions, limit);

      this.setCached(cacheKey, trendingPredictions);
      return trendingPredictions;
    } catch (error) {
      console.error('Failed to fetch trending markets:', error);
      return [];
    }
  }

  // Search markets
  async searchMarkets(query: string, limit: number = 20): Promise<AppPrediction[]> {
    try {
      const cacheKey = `search_${query}_${limit}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      const response = await this.client.searchMarkets(query);
      const predictions = KalshiTransformer.transformMarkets(response.data);
      const openPredictions = KalshiTransformer.filterOpenPredictions(predictions);
      const searchResults = KalshiTransformer.searchPredictions(openPredictions, query);
      const limitedResults = searchResults.slice(0, limit);

      this.setCached(cacheKey, limitedResults);
      return limitedResults;
    } catch (error) {
      console.error(`Failed to search markets for "${query}":`, error);
      return [];
    }
  }

  // Get market details
  async getMarketDetails(marketId: string): Promise<AppPrediction | null> {
    try {
      const cacheKey = `market_${marketId}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      const market = await this.client.getMarket(marketId);
      const prediction = KalshiTransformer.transformMarket(market);

      this.setCached(cacheKey, prediction);
      return prediction;
    } catch (error) {
      console.error(`Failed to fetch market ${marketId}:`, error);
      return null;
    }
  }

  // Get available categories
  async getCategories(): Promise<string[]> {
    try {
      const cacheKey = 'categories';
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      const categories = await this.client.getCategories();
      this.setCached(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  }

  // Get markets closing soon (within 24 hours)
  async getMarketsClosingSoon(hours: number = 24): Promise<AppPrediction[]> {
    try {
      const cacheKey = `closing_soon_${hours}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      const markets = await this.getOpenMarkets(100);
      const now = new Date();
      const closingSoon = markets.filter(market => {
        const closeTime = new Date(market.closesAt);
        const timeDiff = closeTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        return hoursDiff <= hours && hoursDiff > 0;
      });

      this.setCached(cacheKey, closingSoon);
      return closingSoon;
    } catch (error) {
      console.error('Failed to fetch markets closing soon:', error);
      return [];
    }
  }

  // Get high volume markets
  async getHighVolumeMarkets(limit: number = 10): Promise<AppPrediction[]> {
    try {
      const cacheKey = `high_volume_${limit}`;
      const cached = this.getCached(cacheKey);
      if (cached) return cached;

      const markets = await this.getOpenMarkets(100);
      const sortedByVolume = KalshiTransformer.sortByVolume(markets);
      const highVolumeMarkets = sortedByVolume.slice(0, limit);

      this.setCached(cacheKey, highVolumeMarkets);
      return highVolumeMarkets;
    } catch (error) {
      console.error('Failed to fetch high volume markets:', error);
      return [];
    }
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Get cached data if still valid
  private getCached(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  // Set cached data
  private setCached(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

export default MarketsService;
