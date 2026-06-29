import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const navStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
`;

export const headerStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  letter-spacing: 0.04em;
  padding: ${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.xs};
  margin: 0;
`;

export const itemStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  display: block;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.fg.secondary};
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${theme.colors.bg.secondary};
  }

  &.active {
    background-color: ${theme.colors.accent.subtle};
    color: ${theme.colors.accent.primary};
  }
`;

export const disabledItemStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.sm};
  color: ${theme.colors.fg.tertiary};
  cursor: default;
`;

export const soonStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;
