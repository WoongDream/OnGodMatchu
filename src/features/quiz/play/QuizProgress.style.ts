import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const labelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const barStyle = (theme: Theme) => css`
  width: 100%;
  height: 6px;
  background-color: ${theme.colors.bg.tertiary};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

export const fillStyle = (percent: number) => (theme: Theme) => css`
  height: 100%;
  width: ${percent}%;
  background-color: ${theme.colors.accent.primary};
  border-radius: ${theme.borderRadius.full};
  transition: width 0.3s ease;
`;
