import { supabase } from '../lib/supabase/client';
import { AppPrediction } from '../lib/kalshi/transformer';

interface UserPreferences {
  categories: Record<string, { yes: number; no: number; skip: number }>;
  keywords: Record<string, { yes: number; no: number; skip: number }>;
  lastUpdated: Date;
}

interface InteractionAction {
  userId: string;
  predictionId: string;
  action: 'yes' | 'no' | 'skip';
  category: string;
  keywords: string[];
  timestamp: Date;
}

class UserPreferenceService {
  private userInteractions = new Map<string, UserPreferences>();

  /**
   * Track user interaction with a prediction
   */
  async trackInteraction(
    userId: string, 
    prediction: AppPrediction, 
    action: 'yes' | 'no' | 'skip'
  ): Promise<void> {
    try {
      // Update local cache
      if (!this.userInteractions.has(userId)) {
        this.userInteractions.set(userId, {
          categories: {},
          keywords: {},
          lastUpdated: new Date(),
        });
      }

      const prefs = this.userInteractions.get(userId)!;
      
      // Track category preference
      if (!prefs.categories[prediction.category]) {
        prefs.categories[prediction.category] = { yes: 0, no: 0, skip: 0 };
      }
      prefs.categories[prediction.category][action]++;

      // Track keyword preferences
      const keywords = this.extractKeywords(prediction.title);
      keywords.forEach(keyword => {
        if (!prefs.keywords[keyword]) {
          prefs.keywords[keyword] = { yes: 0, no: 0, skip: 0 };
        }
        prefs.keywords[keyword][action]++;
      });

      prefs.lastUpdated = new Date();

      // Save to database
      await this.savePreferences(userId, prefs);
      
      // Save interaction log
      await this.saveInteraction({
        userId,
        predictionId: prediction.id,
        action,
        category: prediction.category,
        keywords,
        timestamp: new Date(),
      });

    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  }

  /**
   * Get personalized feed based on user preferences
   */
  async getPersonalizedFeed(userId: string, allPredictions: AppPrediction[]): Promise<AppPrediction[]> {
    try {
      // Load preferences if not in cache
      if (!this.userInteractions.has(userId)) {
        await this.loadPreferences(userId);
      }

      const prefs = this.userInteractions.get(userId);
      if (!prefs) return allPredictions;

      // Sort predictions by personalization score
      return allPredictions.sort((a, b) => {
        const scoreA = this.calculateScore(a, prefs);
        const scoreB = this.calculateScore(b, prefs);
        return scoreB - scoreA;
      });

    } catch (error) {
      console.error('Error getting personalized feed:', error);
      return allPredictions;
    }
  }

  /**
   * Get user's top categories
   */
  async getTopCategories(userId: string): Promise<string[]> {
    try {
      if (!this.userInteractions.has(userId)) {
        await this.loadPreferences(userId);
      }

      const prefs = this.userInteractions.get(userId);
      if (!prefs) return [];

      return Object.entries(prefs.categories)
        .map(([category, stats]) => ({
          category,
          total: stats.yes + stats.no + stats.skip,
          engagement: (stats.yes * 2) + stats.no - stats.skip,
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .map(item => item.category);

    } catch (error) {
      console.error('Error getting top categories:', error);
      return [];
    }
  }

  /**
   * Get user's top keywords
   */
  async getTopKeywords(userId: string): Promise<string[]> {
    try {
      if (!this.userInteractions.has(userId)) {
        await this.loadPreferences(userId);
      }

      const prefs = this.userInteractions.get(userId);
      if (!prefs) return [];

      return Object.entries(prefs.keywords)
        .map(([keyword, stats]) => ({
          keyword,
          total: stats.yes + stats.no + stats.skip,
          engagement: (stats.yes * 1.5) + stats.no - (stats.skip * 0.5),
        }))
        .sort((a, b) => b.engagement - a.engagement)
        .map(item => item.keyword)
        .slice(0, 10); // Top 10 keywords

    } catch (error) {
      console.error('Error getting top keywords:', error);
      return [];
    }
  }

  /**
   * Calculate personalization score for a prediction
   */
  private calculateScore(prediction: AppPrediction, prefs: UserPreferences): number {
    let score = 0;
    
    // Category score (higher weight for categories user engages with)
    const catPref = prefs.categories[prediction.category];
    if (catPref) {
      const total = catPref.yes + catPref.no + catPref.skip;
      if (total > 0) {
        score += (catPref.yes * 2) - catPref.skip - (catPref.no * 0.5);
        score += total * 0.1; // Bonus for categories with more interactions
      }
    }

    // Keyword score
    const keywords = this.extractKeywords(prediction.title);
    keywords.forEach(keyword => {
      const keyPref = prefs.keywords[keyword];
      if (keyPref) {
        const total = keyPref.yes + keyPref.no + keyPref.skip;
        if (total > 0) {
          score += (keyPref.yes * 1.5) - (keyPref.skip * 0.5) - keyPref.no;
          score += total * 0.05; // Small bonus for keywords with more interactions
        }
      }
    });

    return score;
  }

  /**
   * Extract relevant keywords from prediction title
   */
  private extractKeywords(title: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'will', 'be', 'is', 'are', 'was', 'were']);
    
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 5); // Limit to top 5 keywords
  }

  /**
   * Save preferences to database
   */
  private async savePreferences(userId: string, prefs: UserPreferences): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferences: prefs,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Save interaction log to database
   */
  private async saveInteraction(interaction: InteractionAction): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          user_id: interaction.userId,
          prediction_id: interaction.predictionId,
          action: interaction.action,
          category: interaction.category,
          keywords: interaction.keywords,
          timestamp: interaction.timestamp.toISOString(),
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error saving interaction:', error);
    }
  }

  /**
   * Load preferences from database
   */
  private async loadPreferences(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      if (data?.preferences) {
        this.userInteractions.set(userId, {
          ...data.preferences,
          lastUpdated: new Date(data.preferences.lastUpdated),
        });
      }

    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }

  /**
   * Clear user preferences (for testing or privacy)
   */
  async clearPreferences(userId: string): Promise<void> {
    try {
      this.userInteractions.delete(userId);
      
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  }
}

export const userPreferenceService = new UserPreferenceService();
