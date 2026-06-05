import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';
import type { InquiryStatus } from '@/types';

const toneColor = (theme: Theme, status: InquiryStatus): string => {
  if (status === 'PENDING') {
    return theme.colors.status.warning;
  }
  if (status === 'IN_PROGRESS') {
    return theme.colors.accent.primary;
  }
  return theme.colors.status.success;
};

export const wrapperStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0.5rem;
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.bg.tertiary};
  color: ${theme.colors.fg.secondary};
  white-space: nowrap;
`;

export const dotStyle = (status: InquiryStatus) => (theme: Theme) => css`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${toneColor(theme, status)};
`;
