import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing['2xl']} 0;
`;

export const labelStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const numberStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.accent.primary};
  font-size: 4rem;
`;

export const totalStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const messageStyle = (theme: Theme) => css`
  ${text({ size: 'md' })({ theme })}
  color: ${theme.colors.fg.primary};
`;
