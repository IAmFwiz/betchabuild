export const tokens = {
  colors: {
    // Core colors
    primary: '#4FC3F7', // Baby blue
    background: '#0A0A0B', // Deep black
    surface: '#1A1A1C', // Card background
    
    // Text colors
    color: '#FFFFFF',
    textSecondary: '#A0A0A0',
    textMuted: '#6B6B6B',
    
    // Action colors
    success: '#22C55E', // Green for YES
    error: '#EF4444', // Red for NO
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Gradient colors
    gradientGreenStart: 'rgba(34, 197, 94, 0.3)',
    gradientGreenEnd: 'transparent',
    gradientRedStart: 'rgba(239, 68, 68, 0.3)',
    gradientRedEnd: 'transparent',
    
    // Glass morphism
    glassBackground: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    
    // Shadows and effects
    shadowColor: '#000000',
    glowColor: '#4FC3F7',
  },
  
  typography: {
    fonts: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semiBold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 48,
    },
    weights: {
      regular: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },
  
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    card: 20,
    round: 999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    glow: {
      shadowColor: '#4FC3F7',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 0,
    },
  },
  
  animations: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  glossEffect: {
    overlay: {
      colors: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)', 'transparent'],
      start: { x: 0, y: 0 },
      end: { x: 0.5, y: 0.5 },
    },
    shimmer: {
      colors: ['transparent', 'rgba(255,255,255,0.1)', 'transparent'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },
};

export default tokens;
