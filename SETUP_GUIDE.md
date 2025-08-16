# Betcha App Setup Guide

## 🚀 Environment Configuration

Your `.env` file has been updated with comprehensive configuration for all services. Here's what you need to do:

### 1. **Supabase Setup** ✅ (Already configured)
- URL and anon key are already set
- Database is ready to use

### 2. **Kalshi API** (Get access when available)
```bash
# Replace these with your actual API credentials
KALSHI_API_KEY=your_actual_kalshi_api_key
KALSHI_API_SECRET=your_actual_kalshi_api_secret
```

### 3. **Image APIs** 
```bash
# Unsplash ✅ (Already configured)
UNSPLASH_API_KEY=Wga2Fpxbw--TZ1TeVi3JuPED2-2Zf1E2iTZwoMboRsoe42BzksgaRXVUKSd3QK6u5HtvYWSbvnrdPRAOG-zXek

# Pexels (Get free API key)
PEXELS_API_KEY=your_pexels_api_key
```

### 4. **Analytics** (Optional for now)
```bash
# Mixpanel
MIXPANEL_TOKEN=your_mixpanel_token

# Amplitude  
AMPLITUDE_API_KEY=your_amplitude_key
```

### 5. **Payments** (Future implementation)
```bash
# Stripe
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 🗄️ Database Setup

### 1. **Run the Schema in Supabase**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the script

### 2. **Database Tables Created**
- ✅ `users` - User profiles and stats
- ✅ `predictions` - User bets and outcomes
- ✅ `achievements` - Gamification system
- ✅ `user_preferences` - Personalization data
- ✅ `user_interactions` - Swipe tracking
- ✅ `user_sessions` - Analytics data
- ✅ `transactions` - Revenue tracking
- ✅ `leaderboard` - Public rankings

### 3. **Key Features**
- **Row Level Security** - Users can only see their own data
- **Automatic triggers** - Updates user stats and achievements
- **Performance indexes** - Fast queries on all tables
- **Preference scoring** - Smart personalization algorithm

## 🔧 Implementation Steps

### 1. **Update Environment Variables**
```bash
# Get API keys for services you want to use
# Update .env file with real values
```

### 2. **Run Database Schema**
```sql
-- Copy database/schema.sql content
-- Run in Supabase SQL Editor
```

### 3. **Test Database Connection**
```typescript
// Test your Supabase connection
import { supabase } from './lib/supabase/client';

const testConnection = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .limit(1);
  
  if (error) console.error('Connection failed:', error);
  else console.log('Database connected!');
};
```

### 4. **Verify Tables Created**
```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

## 📱 App Features Now Available

### 1. **User Management**
- Registration and authentication
- Profile management
- Virtual balance system

### 2. **Prediction System**
- Place bets on predictions
- Track odds and outcomes
- Automatic resolution

### 3. **Personalization**
- Track user preferences
- Swipe interactions
- Personalized feed algorithm

### 4. **Gamification**
- XP and leveling system
- Achievement unlocks
- Streak tracking

### 5. **Analytics**
- Session tracking
- User behavior analysis
- Performance metrics

## 🚨 Important Notes

1. **Environment Variables**: Never commit real API keys to version control
2. **Database Security**: RLS policies ensure users can only access their own data
3. **API Limits**: Be aware of rate limits for external APIs
4. **Testing**: Test all features in development before production

## 🔗 Next Steps

1. **Get Kalshi API access** when available
2. **Implement image services** with Unsplash/Pexels
3. **Add analytics** when ready for user tracking
4. **Set up payments** when implementing real money
5. **Test all features** thoroughly

## 📞 Support

If you encounter issues:
1. Check Supabase logs for database errors
2. Verify environment variables are loaded
3. Test API connections individually
4. Check browser console for client-side errors

Your betcha app is now set up with a robust foundation for growth! 🎉
