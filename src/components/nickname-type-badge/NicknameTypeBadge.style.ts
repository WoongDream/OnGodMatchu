import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export type NicknameTone = 'reserved' | 'forbidden';

const toneColor = (theme: Theme, tone: NicknameTone): string =>
  tone === 'forbidden' ? theme.colors.status.error : theme.colors.accent.primary;

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

export const dotStyle = (tone: NicknameTone) => (theme: Theme) => css`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${toneColor(theme, tone)};
`;
