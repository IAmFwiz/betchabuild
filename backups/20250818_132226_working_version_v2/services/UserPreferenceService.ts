import { supabase } from '../lib/supabase/client';

interface Prediction {
  id: string;
  title: string;
  category: string;
  imageUri?: string;
  currentOdds: {
    yes: number;
    no: number;
  };
  volume: number;
  closesAt: string;
}

interface UserInteraction {
  user_id: string;
  prediction_id: string;
  category: string;
  action: 'yes' | 'no' | 'skip';
  keywords: string[];
  timestamp: string;
}

interface UserPreference {
  user_id: string;
  category: string;
  yes_count: number;
  no_count: number;
  skip_count: number;
  total_interactions: number;
  preference_score: number;
}

interface UserPreferenceRow extends UserPreference {
  id: string;
  created_at: string;
  updated_at: string;
}

class UserPreferenceService {
  async trackSwipe(userId: string, prediction: Prediction, action: 'yes' | 'no' | 'skip'): Promise<void> {
    try {
      // Track in database
      const { error: interactionError } = await supabase
        .from('user_interactions')
        .insert({
          user_id: userId,
          prediction_id: prediction.id,
          category: prediction.category,
          action: action,
          keywords: this.extractKeywords(prediction.title),
          timestamp: new Date().toISOString(),
        } as UserInteraction);

      if (interactionError) {
        console.error('Error inserting interaction:', interactionError);
        return;
      }

      // Update user preferences
      await this.updatePreferences(userId, prediction, action);
    } catch (error) {
      console.error('Error tracking swipe:', error);
    }
  }

  async updatePreferences(userId: string, prediction: Prediction, action: 'yes' | 'no' | 'skip'): Promise<void> {
    try {
      const { data: existing, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('category', prediction.category)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching preferences:', fetchError);
        return;
      }

      if (existing) {
        const updates = {
          [`${action}_count`]: existing[`${action}_count` as keyof UserPreference] + 1,
          total_interactions: existing.total_interactions + 1,
          preference_score: this.calculateScore(
            existing.yes_count + (action === 'yes' ? 1 : 0),
            existing.no_count + (action === 'no' ? 1 : 0),
            existing.skip_count + (action === 'skip' ? 1 : 0)
          ),
          updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', userId)
          .eq('category', prediction.category);

        if (updateError) {
          console.error('Error updating preferences:', updateError);
        }
      } else {
        const newPreference: UserPreference = {
          user_id: userId,
          category: prediction.category,
          yes_count: action === 'yes' ? 1 : 0,
          no_count: action === 'no' ? 1 : 0,
          skip_count: action === 'skip' ? 1 : 0,
          total_interactions: 1,
          preference_score: action === 'yes' ? 1 : action === 'no' ? -1 : 0,
        };

        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert(newPreference);

        if (insertError) {
          console.error('Error inserting preferences:', insertError);
        }
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }

  calculateScore(yes: number, no: number, skip: number): number {
    const total = yes + no + skip;
    if (total === 0) return 0;
    
    // Weighted scoring: yes = +2, no = -1, skip = -0.5
    return ((yes * 2) - no - (skip * 0.5)) / total;
  }

  async getPersonalizedFeed(userId: string): Promise<Prediction[]> {
    try {
      // Get user preferences
      const { data: preferences, error: prefError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .order('preference_score', { ascending: false });

      if (prefError) {
        console.error('Error fetching preferences:', prefError);
        return [];
      }

      // Get predictions and sort by user preferences
      const predictions = await this.fetchPredictions();
      
      return predictions.sort((a, b) => {
        const scoreA = this.getPreferenceScore(a, preferences || []);
        const scoreB = this.getPreferenceScore(b, preferences || []);
        return scoreB - scoreA;
      });
    } catch (error) {
      console.error('Error getting personalized feed:', error);
      return [];
    }
  }

  private getPreferenceScore(prediction: Prediction, preferences: UserPreferenceRow[]): number {
    const userPref = preferences.find(p => p.category === prediction.category);
    if (!userPref) return 0;
    
    // Base score from user's category preference
    let score = userPref.preference_score;
    
    // Bonus for categories with high interaction counts
    if (userPref.total_interactions > 10) {
      score += 0.2;
    }
    
    // Bonus for trending predictions in preferred categories
    if (prediction.volume > 1000000 && userPref.preference_score > 0.5) {
      score += 0.3;
    }
    
    return score;
  }

  private async fetchPredictions(): Promise<Prediction[]> {
    try {
      // This would typically fetch from your predictions API
      // For now, returning empty array - implement based on your data source
      return [];
    } catch (error) {
      console.error('Error fetching predictions:', error);
      return [];
    }
  }

  extractKeywords(title: string): string[] {
    const patterns = [
      // Music
      /Taylor Swift|Drake|Beyonce|Kanye|BTS|Ariana Grande|The Weeknd|Post Malone|Ed Sheeran|Billie Eilish/gi,
      // Sports
      /NFL|NBA|MLB|NHL|UFC|FIFA|World Cup|Super Bowl|Champions League|Olympics/gi,
      // Entertainment
      /Marvel|Disney|Netflix|HBO|Oscar|Grammy|Emmy|Golden Globe|MTV|VMA/gi,
      // Tech & Business
      /Bitcoin|Ethereum|Tesla|Apple|Meta|Google|Amazon|Microsoft|SpaceX|OpenAI/gi,
      // Politics
      /Biden|Trump|Election|Congress|Senate|Supreme Court|Democrat|Republican/gi,
      // Gaming
      /PlayStation|Xbox|Nintendo|Steam|Epic|Fortnite|Minecraft|GTA|Call of Duty/gi,
    ];

    const keywords: string[] = [];
    patterns.forEach(pattern => {
      const matches = title.match(pattern);
      if (matches) {
        keywords.push(...matches.map(match => match.toLowerCase()));
      }
    });

    // Remove duplicates and return
    return [...new Set(keywords)];
  }

  async getUserStats(userId: string): Promise<{
    totalInteractions: number;
    favoriteCategory: string;
    preferenceScore: number;
    categories: { [key: string]: UserPreference };
  }> {
    try {
      const { data: preferences, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId);

      if (error || !preferences) {
        return {
          totalInteractions: 0,
          favoriteCategory: 'None',
          preferenceScore: 0,
          categories: {},
        };
      }

      const totalInteractions = preferences.reduce((sum, pref) => sum + pref.total_interactions, 0);
      const favoriteCategory = preferences.reduce((fav, pref) => 
        pref.preference_score > (fav?.preference_score || -1) ? pref : fav
      )?.category || 'None';
      const avgPreferenceScore = preferences.reduce((sum, pref) => sum + pref.preference_score, 0) / preferences.length;

      const categoriesMap = preferences.reduce((acc, pref) => {
        acc[pref.category] = pref;
        return acc;
      }, {} as { [key: string]: UserPreference });

      return {
        totalInteractions,
        favoriteCategory,
        preferenceScore: avgPreferenceScore,
        categories: categoriesMap,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalInteractions: 0,
        favoriteCategory: 'None',
        preferenceScore: 0,
        categories: {},
      };
    }
  }
}

export const userPreferenceService = new UserPreferenceService();
