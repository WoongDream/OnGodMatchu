export const theme = {
  colors: {
    fg: {
      primary: '#18181b',
      secondary: '#71717a',
      tertiary: '#a1a1aa',
      inverse: '#ffffff',
    },
    bg: {
      primary: '#ffffff',
      secondary: '#f7f7f8',
      tertiary: '#f0f0f2',
    },
    border: {
      primary: '#e4e4e7',
      secondary: '#f0f0f2',
    },
    accent: {
      primary: '#6c3ce1',
      hover: '#5a2ecf',
      fg: '#ffffff',
    },
    status: {
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#22c55e',
    },
    strength: {
      veryWeak: '#ef4444',
      weak: '#f97316',
      fair: '#f59e0b',
      good: '#84cc16',
      strong: '#22c55e',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.625rem',
    lg: '0.75rem',
    full: '9999px',
  },
  breakpoints: {
    tablet: '48rem', // 768px
    desktop: '80rem', // 1280px
  },
} as const;

export type Theme = typeof theme;
