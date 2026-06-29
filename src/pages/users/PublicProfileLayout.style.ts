import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const navStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const groupLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
`;

export const navLinkStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
  text-decoration: none;

  &:hover {
    background-color: ${theme.colors.bg.secondary};
  }
  &.active {
    background-color: ${theme.colors.accent.subtle};
    color: ${theme.colors.accent.primary};
  }
`;

export const countStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;
