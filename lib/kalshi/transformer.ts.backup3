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
  private getImageUrl(category: string, title: string): string {
    // In production, you'd have a mapping to actual images
    // For now, use placeholder images with different seeds
    const seed = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const imageCategories: Record<string, string> = {
      'sports': `https://picsum.photos/400/600?random=${seed}&blur=0`,
      'music': `https://picsum.photos/400/600?random=${seed + 1000}&blur=0`,
      'movies': `https://picsum.photos/400/600?random=${seed + 2000}&blur=0`,
      'viral': `https://picsum.photos/400/600?random=${seed + 3000}&blur=0`,
      'other': `https://picsum.photos/400/600?random=${seed + 4000}&blur=0`,
    };
    
    return imageCategories[category] || imageCategories.other;
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

  transformMarket(market: KalshiMarket): AppPrediction {
    const category = this.mapCategory(market.category);
    
    return {
      id: market.ticker,
      title: market.title,
      category,
      imageUri: this.getImageUrl(category, market.title),
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
    return markets
      .filter(m => m.status === 'open')
      .map(m => this.transformMarket(m))
      .sort((a, b) => b.volume - a.volume);
  }
}

export const kalshiTransformer = new KalshiTransformer();
