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
      primary: '#38bdf8', // Sky cyan — 브랜드 메인
      hover: '#0ea5e9', // 한 단계 진한 sky
      active: '#0284c7', // 클릭/active 상태
      fg: '#ffffff',
      // 보조 톤 — 배경 강조, 배지, 알림 영역 등
      subtle: '#e0f5ff', // 가장 연한 sky tint (info background)
      muted: '#7dd3fc', // 중간 톤 (border, disabled accent)
    },
    status: {
      error: '#ef4444',
      warning: '#f59e0b',
      success: '#22c55e',
      info: '#38bdf8', // accent와 동일하게 통일
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
