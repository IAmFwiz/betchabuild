export const tokens = {
  colors: {
    // Backgrounds
    background: '#0B0B0F',
    surface: '#12131A',
    surface2: '#16161E',
    outline: '#2A2B35',
    
    // Text
    color: '#F2F2F5',
    color2: '#C7CBD1',
    color3: '#9AA0A6',
    
    // Primary accent (baby blue)
    blue: '#4FC3F7',
    blueStrong: '#2DA9E0',
    blueSoft: '#AEE7FF',
    
    // Secondary accent
    red: '#FF3B5C',
    redStrong: '#D72D4C',
    
    // Supporting
    purple: '#9B5CFF',
    gold: '#FFC857',
    
    // Legacy colors for compatibility
    primary: '#4FC3F7',
    primaryLight: '#AEE7FF',
    primaryDark: '#2DA9E0',
    secondary: '#FF3B5C',
    secondaryLight: '#FF6B8A',
    secondaryDark: '#D72D4C',
    success: '#34C759',
    error: '#FF3B5C',
    warning: '#FFC857',
    yes: '#4FC3F7',
    no: '#FF3B5C',
    maybe: '#FFC857',
    text: '#F2F2F5',
    textSecondary: '#C7CBD1',
    border: '#2A2B35',
    cardBackground: '#12131A',
    cardBorder: '#2A2B35',
    cardShadow: 'rgba(79, 195, 247, 0.24)',
  },
  
  gradients: {
    yesGradient: ['#AEE7FF', '#4FC3F7'],
    noGradient: ['#FFC0CB', '#FF3B5C'],
  },
  
  shadows: {
    cardGlow: 'rgba(79, 195, 247, 0.24)',
    badgeGlow: 'rgba(155, 92, 255, 0.18)',
    elevation: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
    },
    sm: {
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  radius: {
    card: 24,
    pill: 999,
    button: 16,
    small: 8,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  typography: {
    fonts: {
      body: 'Inter',
      heading: 'Inter',
    },
    weights: {
      regular: '400',
      semibold: '600',
      bold: '700',
      heavy: '800',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
      huge: 32,
      giant: 40,
    },
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    captionBold: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
  },
} as const;

export type Tokens = typeof tokens;
