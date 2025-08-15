import { KalshiMarket } from './types';
import { format, formatDistanceToNow } from 'date-fns';

export interface AppPrediction {
  id: string;
  title: string;
  category: 'music' | 'sports' | 'movies' | 'viral' | 'other';
  imageUri: string;
  currentOdds: { // Odds are in percentage format (0-100)
    yes: number;
    no: number;
  };
  volume: number;
  closesAt: string;
  closesAtTimestamp: number;
  description?: string;
  trending: boolean;
  kalshiTicker: string;
  eventTicker: string;
}

export class KalshiTransformer {
  // Map Kalshi categories to our app categories
  private categoryMap: Record<string, string> = {
    'NFL': 'sports',
    'NBA': 'sports',
    'MLB': 'sports',
    'NHL': 'sports',
    'SOCCER': 'sports',
    'SPORTS': 'sports',
    'GRAMMYS': 'music',
    'BILLBOARD': 'music',
    'MUSIC': 'music',
    'OSCARS': 'movies',
    'BOXOFFICE': 'movies',
    'MOVIES': 'movies',
    'ENTERTAINMENT': 'movies',
    'SOCIAL': 'viral',
    'TECH': 'viral',
    'VIRAL': 'viral',
    'POLITICS': 'other',
    'ECONOMICS': 'other',
    'FINANCE': 'other',
  };

  // Generate appropriate image based on category and title
  private async getImageUrl(category: string, title: string): Promise<string> {
    // Extract keywords from title
    const keywords = this.extractKeywords(title);
    
    // Use Unsplash API or similar
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&client_id=${process.env.EXPO_PUBLIC_UNSPLASH_API_KEY}`
      );
      const data = await response.json();
      return data.results[0]?.urls?.regular || this.getFallbackImage(category);
    } catch {
      return this.getFallbackImage(category);
    }
  }
  
  private extractKeywords(title: string): string {
    // Extract celebrity names, events, etc.
    const patterns = {
      celebrity: /Taylor Swift|Drake|Beyonce|Kanye West|Ariana Grande|Billie Eilish|The Weeknd|Post Malone|Travis Scott|Doja Cat/gi,
      sports: /NFL|NBA|MLB|NHL|Super Bowl|World Cup|Championship|Playoffs|Finals/gi,
      movies: /Oscar|Academy Award|Marvel|Disney|Netflix|HBO|Streaming|Box Office/gi,
      politics: /Election|President|Congress|Senate|Democrat|Republican|Biden|Trump/gi,
      tech: /Apple|Google|Microsoft|Tesla|SpaceX|Meta|Amazon|Netflix/gi,
    };
    
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = title.match(pattern);
      if (match) return match[0];
    }
    
    return title.split(" ").slice(0, 3).join(" ");
  }
  
  private getFallbackImage(category: string): string {
    // Fallback to category-based images if API fails
    const fallbackImages = {
      sports: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
      music: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
      movies: "https://images.unsplash.com/photo-1489599835382-957593cb7c43?w=800&h=600&fit=crop",
      viral: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop",
      other: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop",
    };
    
    return fallbackImages[category] || fallbackImages.other;
  }

  private mapCategory(kalshiCategory?: string): AppPrediction['category'] {
    if (!kalshiCategory) return 'other';
    
    const upperCategory = kalshiCategory.toUpperCase();
    for (const [key, value] of Object.entries(this.categoryMap)) {
      if (upperCategory.includes(key)) {
        return value as AppPrediction['category'];
      }
    }
    
    return 'other';
  }

  private formatCloseTime(closeTime: string): string {
    if (!closeTime) return 'Soon';
    
    try {
      const closeDate = new Date(closeTime);
      const now = new Date();
      const diffHours = (closeDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 24) {
        return formatDistanceToNow(closeDate, { addSuffix: false });
      } else if (diffHours < 48) {
        return 'Tomorrow';
      } else if (diffHours < 168) { // Less than a week
        return format(closeDate, 'EEEE'); // Day name
      } else {
        return format(closeDate, 'MMM d');
      }
    } catch (error) {
      return 'Soon';
    }
  }

  transformMarket(market: KalshiMarket): Promise<AppPrediction> {
    const category = this.mapCategory(market.category);
    
    return {
      id: market.ticker,
      title: market.title,
      category,
      imageUri: await this.getImageUrl(category, market.title),
      currentOdds: { // Odds are in percentage format (0-100)
        yes: market.yes_bid || 50,
        no: market.no_bid || 50,
      },
      volume: market.volume || 0,
      closesAt: this.formatCloseTime(market.close_time),
      closesAtTimestamp: new Date(market.close_time).getTime(),
      description: `Market closes ${this.formatCloseTime(market.close_time)}`,
      trending: (market.volume || 0) > 10000,
      kalshiTicker: market.ticker,
      eventTicker: market.event_ticker,
    };
  }

  transformMarkets(markets: KalshiMarket[]): AppPrediction[] {
    const transformedMarkets = await Promise.all(markets
      .filter(m => m.status === "open")
      .map(async m => await this.transformMarket(m))
    );
    
    return transformedMarkets.sort((a, b) => b.volume - a.volume);
  }
}

export const kalshiTransformer = new KalshiTransformer();
