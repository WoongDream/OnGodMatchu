import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const navStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} 0;
`;

export const linkStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.fg.secondary};
  text-decoration: none;

  &.active {
    background-color: ${theme.colors.bg.secondary};
    color: ${theme.colors.fg.primary};
    font-weight: ${theme.fontWeight.semibold};
  }

  &:hover:not(.active) {
    background-color: ${theme.colors.bg.secondary};
  }
`;

export const countStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;
