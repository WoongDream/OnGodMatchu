import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const tabsStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.md};
  padding: 0 ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.primary};
  overflow-x: auto;
`;

export const tabStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} 0;
  color: ${theme.colors.fg.secondary};
  border-bottom: 2px solid transparent;
  text-decoration: none;

  &.active {
    color: ${theme.colors.accent.primary};
    border-bottom-color: ${theme.colors.accent.primary};
    font-weight: ${theme.fontWeight.semibold};
  }
`;

export const countStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  padding: 0.0625rem ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.bg.tertiary};
  color: ${theme.colors.fg.tertiary};

  .active & {
    background-color: ${theme.colors.accent.subtle};
    color: ${theme.colors.accent.primary};
  }
`;
