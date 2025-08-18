import { supabase } from '../lib/supabase/client';
import { kalshiClient } from '../lib/kalshi/client';
import { AppPrediction } from '../lib/kalshi/transformer';
import { useUserStore } from '../store/userStore';

export interface PaperPrediction {
  id: string;
  userId: string;
  kalshiMarketTicker: string;
  marketTitle: string;
  category: string;
  predictionType: 'yes' | 'no';
  stake: number;
  oddsAtTime: number;
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  createdAt: Date;
  resolvedAt?: Date;
}

class PredictionService {
  // Place a paper trade
  async placePrediction(
    prediction: AppPrediction,
    choice: 'yes' | 'no',
    stake: number
  ): Promise<PaperPrediction> {
    const user = useUserStore.getState().user;
    if (!user) throw new Error('User not logged in');

    // Check if user has enough virtual balance
    if (user.virtualBalance < stake) {
      throw new Error('Insufficient virtual balance');
    }

    const odds = choice === 'yes' ? prediction.currentOdds.yes : prediction.currentOdds.no;
    const potentialPayout = (stake * 100) / odds;

    // Create prediction in database
    const { data, error } = await supabase
      .from('predictions')
      .insert({
        user_id: user.id,
        kalshi_market_ticker: prediction.kalshiTicker, // Updated to use kalshiTicker
        kalshi_event_ticker: prediction.eventTicker,  // Updated to use eventTicker
        market_title: prediction.title,
        category: prediction.category,
        prediction_type: choice,
        stake,
        odds_at_time: odds,
        potential_payout: potentialPayout,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Update user's virtual balance
    await supabase
      .from('users')
      .update({ 
        virtual_balance: user.virtualBalance - stake,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Update local state
    useUserStore.getState().updateBalance(user.virtualBalance - stake);

    return data;
  }

  // Check and resolve predictions based on Kalshi results
  async resolvePredictions(): Promise<void> {
    // Get all pending predictions
    const { data: pendingPredictions, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('status', 'pending');

    if (error || !pendingPredictions) return;

    for (const prediction of pendingPredictions) {
      try {
        // Get market status from Kalshi
        const market = await kalshiClient.getMarket(prediction.kalshi_market_ticker);
        
        if (market.status === 'settled' && market.outcome) {
          const won = prediction.prediction_type === market.outcome;
          const newStatus = won ? 'won' : 'lost';
          
          // Update prediction status
          await supabase
            .from('predictions')
            .update({
              status: newStatus,
              resolved_at: new Date().toISOString(),
            })
            .eq('id', prediction.id);

          // If won, credit the user's account
          if (won) {
            const { data: user } = await supabase
              .from('users')
              .select('virtual_balance')
              .eq('id', prediction.user_id)
              .single();

            if (user) {
              const newBalance = user.virtual_balance + prediction.potential_payout;
              
              await supabase
                .from('users')
                .update({
                  virtual_balance: newBalance,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', prediction.user_id);

              // Send notification
              await this.sendPredictionNotification(
                prediction.user_id,
                `You won! Your prediction "${prediction.market_title}" earned you $${prediction.potential_payout.toFixed(2)}`
              );
            }
          }
        }
      } catch (error) {
        console.error(`Failed to resolve prediction ${prediction.id}:`, error);
      }
    }
  }

  // Get user's prediction history
  async getUserPredictions(userId: string): Promise<PaperPrediction[]> {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Calculate user statistics
  async getUserStats(userId: string) {
    const predictions = await this.getUserPredictions(userId);
    
    const totalPredictions = predictions.length;
    const resolvedPredictions = predictions.filter(p => p.status !== 'pending');
    const wins = predictions.filter(p => p.status === 'won').length;
    const losses = predictions.filter(p => p.status === 'lost').length;
    const winRate = resolvedPredictions.length > 0 
      ? (wins / resolvedPredictions.length) * 100 
      : 0;
    
    const totalWinnings = predictions
      .filter(p => p.status === 'won')
      .reduce((sum, p) => sum + (p.potentialPayout - p.stake), 0);
    
    const totalLosses = predictions
      .filter(p => p.status === 'lost')
      .reduce((sum, p) => sum + p.stake, 0);
    
    const netProfit = totalWinnings - totalLosses;
    
    // Calculate streak
    const sortedResolved = resolvedPredictions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    let currentStreak = 0;
    for (const pred of sortedResolved) {
      if (pred.status === 'won') {
        currentStreak++;
      } else {
        break;
      }
    }
    
    return {
      totalPredictions,
      wins,
      losses,
      winRate,
      totalWinnings,
      totalLosses,
      netProfit,
      currentStreak,
      pending: predictions.filter(p => p.status === 'pending').length,
    };
  }

  private async sendPredictionNotification(userId: string, message: string) {
    // Implement push notification logic here
    console.log(`Notification for ${userId}: ${message}`);
  }
}

export const predictionService = new PredictionService();
