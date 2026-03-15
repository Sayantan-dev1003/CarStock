export const lightTheme = {
  colors: {
    // Backgrounds
    bg: '#FDFCFB',           // warmer off-white, primary background
    bgCard: '#FFFFFF',        // pure white for cards
    bgMuted: '#F5F2F0',       // subtle section dividers / input fills

    // Primary accent — sophisticated deep amber
    primary: '#D97706',       // vibrant amber-600
    primaryLight: '#FEF3C7',  // amber-100, soft tinted backgrounds
    primaryDark: '#B45309',   // amber-700
    primaryDeep: '#451A03',   // deep dark amber for high contrast text/accents

    // Text
    textPrimary: '#1C1917',   // stone-900, near-black, headings
    textSecondary: '#57534E', // stone-600, warm gray, subtitles
    textMuted: '#A8A29E',     // stone-400, placeholders

    // Status
    success: '#059669',       // emerald-600
    error: '#DC2626',         // red-600
    warning: '#D97706',       // amber-600

    // UI
    border: '#E7E5E4',        // stone-200
    shadow: 'rgba(69, 26, 3, 0.08)', // subtly tinted shadow
  },

  font: {
    heading: 'Outfit_600SemiBold',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    bodySemiBold: 'Inter_600SemiBold',
    bodyBold: 'Inter_700Bold',
  },

  radius: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    full: 999,
  },

  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  },

  shadow: {
    sm: {
      shadowColor: '#1A1816',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    card: {
      shadowColor: '#1A1816',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    lg: {
      shadowColor: '#1A1816',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 24,
      elevation: 10,
    },
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    bg: '#1A1817',           // deep dark stone/warm black
    bgCard: '#353230',       // stone-900, slightly lighter
    bgMuted: '#22201F',      // darker than bgCard to make inputs look sunken

    primary: '#F59E0B',      // amber-500, brighter for high dark mode contrast
    primaryLight: '#451A03', // transparent dark amber background 
    primaryDark: '#D97706',   // amber-600
    primaryDeep: '#FEF3C7',  // amber-100 for high dark text contrast

    textPrimary: '#FAFAF9',  // stone-50, near white
    textSecondary: '#D6D3D1', // stone-300
    textMuted: '#78716C',    // stone-500

    success: '#10B981',      // emerald-500
    error: '#EF4444',        // red-500
    warning: '#F59E0B',      // amber-500

    border: '#423E3B',       // stone-800
    shadow: 'rgba(0, 0, 0, 0.4)', // stronger shadow for dark depths
  },
};

export const theme = lightTheme; // for backward compatibility 

// Maintain compatibility with existing code where possible by exporting old names or mapping them
export const Colors = {
  primary: theme.colors.primary,
  primaryDark: theme.colors.primaryDark,
  primaryLight: theme.colors.primaryLight,
  white: theme.colors.bgCard,
  screenBg: theme.colors.bg,
  dark: theme.colors.textPrimary,
  grey100: theme.colors.bgMuted,
  grey200: theme.colors.border,
  grey400: theme.colors.textMuted,
  grey500: theme.colors.textSecondary,
  success: theme.colors.success,
  warning: theme.colors.warning,
  warningLight: theme.colors.primaryLight,
  error: theme.colors.error,
};

export const Typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    xxxl: 36,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Spacing = theme.spacing;
export const BorderRadius = theme.radius;
export const Shadows = {
  sm: theme.shadow.sm,
  md: theme.shadow.card,
  lg: theme.shadow.lg,
};
