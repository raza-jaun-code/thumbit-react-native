export const COLORS = {
  background: '#0A0A0F',
  surface: '#1A1A24',
  surfaceLight: '#252532',
  primary: '#FF5A5F',
  primaryDark: '#FF3B57',
  secondary: '#4A90FF',
  secondaryDark: '#3A7FEF',
  accent: '#FFD700',
  success: '#00D9A5',
  error: '#FF4757',
  warning: '#FFA502',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#6B6B7B',
  border: '#2A2A38',
  cardBg: 'rgba(26, 26, 36, 0.8)',
  glassBg: 'rgba(255, 255, 255, 0.05)',
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

export const GRADIENTS = {
  primary: ['#FF5A5F', '#FF3B57'],
  secondary: ['#4A90FF', '#3A7FEF'],
  accent: ['#FFD700', '#FFA502'],
  dark: ['#1A1A24', '#0A0A0F'],
  card: ['rgba(26, 26, 36, 0.9)', 'rgba(37, 37, 50, 0.7)'],
} as const;

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 26,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
