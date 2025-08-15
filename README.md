# Betcha - Prediction Betting App

A React Native app for paper trading prediction markets with a beautiful dark theme and intuitive swipe interface.

## 🚀 Features

- **Swipe Interface**: Intuitive card-based prediction browsing
- **Paper Trading**: Risk-free prediction betting with virtual currency
- **Achievement System**: Unlock achievements for streaks and wins
- **Leaderboards**: Compete with other users
- **Beautiful UI**: Sophisticated dark theme with baby blue accents
- **Real-time Updates**: Live prediction data and results

## 🛠 Tech Stack

- **Frontend**: React Native + Expo
- **UI Framework**: Tamagui + React Native Reanimated
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: Zustand
- **Navigation**: Expo Router
- **API Integration**: Kalshi (prediction markets)

## 📱 App Structure

```
/app
  /(auth)          # Authentication flow
  /(tabs)          # Main app tabs
  /(modals)        # Modal screens
/components         # Reusable UI components
/lib               # External service integrations
/store             # State management
/theme             # Design tokens and theming
/types             # TypeScript type definitions
```

## 🗄 Database Schema

The app uses a PostgreSQL database with the following key tables:

- **users**: User profiles, stats, and virtual balance
- **predictions**: User betting history and outcomes
- **achievements**: Unlocked achievements and badges
- **leaderboard**: Materialized view for rankings

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Expo CLI
- Supabase account
- Kalshi API access (optional for development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_KALSHI_API_KEY=your_kalshi_api_key
```

### 3. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL to create all tables, views, and functions

### 4. Start Development Server

```bash
npm start
```

Scan the QR code with Expo Go app or press `w` to open in web browser.

## 🎨 Design System

The app uses a sophisticated design token system:

- **Colors**: Dark theme with baby blue (#4FC3F7) accents
- **Typography**: Inter font family with consistent sizing
- **Spacing**: 4px base unit system (xs: 4, sm: 8, md: 12, etc.)
- **Shadows**: Subtle glows and elevation effects
- **Gradients**: Yes/No prediction gradients

## 🔧 Development

### Adding New Screens

1. Create screen file in appropriate directory
2. Add to navigation in `_layout.tsx`
3. Import and use design tokens from `theme/tokens`

### Styling Components

Use the design tokens for consistent styling:

```tsx
import { tokens } from '../theme/tokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.surface,
    padding: tokens.spacing.lg,
    borderRadius: tokens.radius.card,
  },
  title: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.color,
  },
});
```

### State Management

The app uses Zustand for state management:

- `userStore`: User authentication and profile
- `predictionStore`: Prediction data and navigation
- `cartStore`: Betting cart and checkout

## 📊 API Integration

### Kalshi Integration

The app integrates with Kalshi for real prediction market data:

- Market data fetching
- Real-time odds updates
- Market resolution handling

### Supabase Integration

- User authentication
- Data persistence
- Real-time subscriptions
- Row-level security

## 🎯 Key Components

- **SwipeableCard**: Main prediction interface with gesture handling
- **GlossyCard**: Beautiful card design with gradients
- **CartFloatingButton**: Quick access to betting cart
- **YesNoButtons**: Prediction action buttons

## 🚀 Deployment

### Expo Build

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build for web
expo build:web
```

### App Store Deployment

1. Configure app.json with proper metadata
2. Build production version
3. Submit to App Store/Play Store

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow design token guidelines
4. Test on multiple devices
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Open an issue on GitHub
- Join our Discord community

---

Built with ❤️ using React Native and Supabase
