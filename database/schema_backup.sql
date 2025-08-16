-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  virtual_balance DECIMAL DEFAULT 1000, -- Starting virtual money
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Paper predictions table
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  kalshi_market_ticker TEXT NOT NULL,
  kalshi_event_ticker TEXT NOT NULL,
  market_title TEXT NOT NULL,
  category TEXT NOT NULL,
  prediction_type TEXT CHECK (prediction_type IN ('yes', 'no')),
  stake DECIMAL NOT NULL,
  odds_at_time DECIMAL NOT NULL,
  potential_payout DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'cancelled')),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Achievements table
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboard materialized view
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
  u.id,
  u.username,
  u.display_name,
  u.avatar_url,
  u.virtual_balance,
  u.xp,
  COUNT(p.id) as total_predictions,
  COUNT(CASE WHEN p.status = 'won' THEN 1 END) as wins,
  ROUND(COUNT(CASE WHEN p.status = 'won' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(CASE WHEN p.status IN ('won', 'lost') THEN 1 END), 0) * 100, 2) as win_rate
FROM users u
LEFT JOIN predictions p ON u.id = p.user_id
GROUP BY u.id
ORDER BY u.xp DESC;

-- Add indexes
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_status ON predictions(status);
CREATE INDEX idx_predictions_kalshi_ticker ON predictions(kalshi_market_ticker);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own predictions
CREATE POLICY "Users can view own predictions" ON predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions" ON predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions" ON predictions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own achievements
CREATE POLICY "Users can view own achievements" ON achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leaderboard view is public (read-only)
CREATE POLICY "Leaderboard is public" ON leaderboard
  FOR SELECT USING (true);

-- Function to update user stats when prediction is resolved
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user XP and balance based on prediction result
  IF NEW.status = 'won' THEN
    UPDATE users 
    SET 
      xp = xp + 10,
      virtual_balance = virtual_balance + NEW.potential_payout,
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      updated_at = NOW()
    WHERE id = NEW.user_id;
  ELSIF NEW.status = 'lost' THEN
    UPDATE users 
    SET 
      xp = xp + 2,
      current_streak = 0,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user stats
CREATE TRIGGER trigger_update_user_stats
  AFTER UPDATE ON predictions
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('won', 'lost'))
  EXECUTE FUNCTION update_user_stats();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  user_stats RECORD;
BEGIN
  -- Get user stats
  SELECT 
    COUNT(*) as total_predictions,
    COUNT(CASE WHEN status = 'won' THEN 1 END) as wins,
    COUNT(CASE WHEN status = 'lost' THEN 1 END) as losses,
    COALESCE(SUM(CASE WHEN status = 'won' THEN potential_payout - stake ELSE 0 END), 0) as total_profit
  INTO user_stats
  FROM predictions 
  WHERE user_id = NEW.user_id;
  
  -- Check for first win
  IF NEW.status = 'won' AND user_stats.wins = 1 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (NEW.user_id, 'first_win')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Check for streak achievements
  IF NEW.status = 'won' THEN
    SELECT current_streak INTO user_stats.current_streak FROM users WHERE id = NEW.user_id;
    
    IF user_stats.current_streak = 5 THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (NEW.user_id, 'streak_5')
      ON CONFLICT DO NOTHING;
    ELSIF user_stats.current_streak = 10 THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (NEW.user_id, 'streak_10')
      ON CONFLICT DO NOTHING;
    ELSIF user_stats.current_streak = 25 THEN
      INSERT INTO achievements (user_id, achievement_type)
      VALUES (NEW.user_id, 'streak_25')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  
  -- Check for prediction count achievements
  IF user_stats.total_predictions = 10 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (NEW.user_id, 'predictions_10')
    ON CONFLICT DO NOTHING;
  ELSIF user_stats.total_predictions = 50 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (NEW.user_id, 'predictions_50')
    ON CONFLICT DO NOTHING;
  ELSIF user_stats.total_predictions = 100 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (NEW.user_id, 'predictions_100')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Check for profit achievements
  IF user_stats.total_profit >= 100 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (NEW.user_id, 'profit_100')
    ON CONFLICT DO NOTHING;
  ELSIF user_stats.total_profit >= 500 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (NEW.user_id, 'profit_500')
    ON CONFLICT DO NOTHING;
  ELSIF user_stats.total_profit >= 1000 THEN
    INSERT INTO achievements (user_id, achievement_type)
    VALUES (NEW.user_id, 'profit_1000')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check achievements
CREATE TRIGGER trigger_check_achievements
  AFTER UPDATE ON predictions
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('won', 'lost'))
  EXECUTE FUNCTION check_achievements();

-- Refresh leaderboard function
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Refresh leaderboard every hour
SELECT cron.schedule(
  'refresh-leaderboard',
  '0 * * * *',
  'SELECT refresh_leaderboard();'
);
