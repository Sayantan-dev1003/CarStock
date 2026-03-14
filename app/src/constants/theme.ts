export const theme = {
  colors: {
    // Backgrounds
    bg: '#FAF9F6',           // lighter warm off-white, primary background
    bgCard: '#FFFFFF',        // pure white for cards
    bgMuted: '#F1EFEA',       // subtle section dividers / input fills

    // Primary accent — sophisticated deep amber
    primary: '#B45309',       // amber-700, more sophisticated main color
    primaryLight: '#FFFBEB',  // amber-50, soft tinted backgrounds
    primaryDark: '#92400E',   // amber-800, pressed state

    // Text
    textPrimary: '#1C1917',   // stone-900, near-black, headings
    textSecondary: '#57534E', // stone-600, warm gray, subtitles
    textMuted: '#A8A29E',     // stone-400, placeholders

    // Status
    success: '#15803D',       // green-700
    error: '#B91C1C',         // red-700
    warning: '#B45309',       // amber-700

    // UI
    border: '#E7E5E4',        // stone-200
    shadow: 'rgba(28, 25, 23, 0.05)',
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
