import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';
import type { BadgeVariant } from './Badge.type';

const VARIANT_TONES: Record<BadgeVariant, { bg: string; fg: (theme: Theme) => string }> = {
  success: {
    bg: '#dcfce7',
    fg: (theme) => theme.colors.status.success,
  },
  info: {
    bg: '#e0f5ff',
    fg: (theme) => theme.colors.accent.primary,
  },
  warning: {
    bg: '#fef3c7',
    fg: (theme) => theme.colors.status.warning,
  },
};

export const badgeStyle = (variant: BadgeVariant) => (theme: Theme) => {
  const tone = VARIANT_TONES[variant];
  return css`
    ${text({ size: 'xs', weight: 'medium' })({ theme })}
    display: inline-flex;
    align-items: center;
    height: 1.25rem;
    padding: 0 ${theme.spacing.sm};
    border-radius: ${theme.borderRadius.full};
    background-color: ${tone.bg};
    color: ${tone.fg(theme)};
    white-space: nowrap;
  `;
};
