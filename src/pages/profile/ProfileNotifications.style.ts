import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const countStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
  white-space: nowrap;
  margin-bottom: ${theme.spacing.sm};
`;

export const listStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const messageStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  text-align: center;
  padding: ${theme.spacing.xl} 0;
`;

export const emptyStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing['2xl']} 0;
  color: ${theme.colors.fg.secondary};
`;

export const sentinelStyle = (theme: Theme) => css`
  display: flex;
  justify-content: center;
  padding: ${theme.spacing.lg} 0;
  color: ${theme.colors.fg.tertiary};
  font-size: ${theme.fontSize.sm};
`;
