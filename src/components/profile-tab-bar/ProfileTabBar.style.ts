import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const tabsStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.md};
  padding: 0 ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.primary};
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: none;
`;

export const tabStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  flex-shrink: 0;
  padding: ${theme.spacing.sm} 0;
  color: ${theme.colors.fg.secondary};
  text-decoration: none;
  border-bottom: 2px solid transparent;
  white-space: nowrap;

  &.active {
    color: ${theme.colors.fg.primary};
    font-weight: ${theme.fontWeight.semibold};
    border-bottom-color: ${theme.colors.accent.primary};
  }
`;

export const countStyle = (theme: Theme) => css`
  margin-left: ${theme.spacing.xs};
  color: ${theme.colors.fg.tertiary};
  font-weight: ${theme.fontWeight.regular};
`;
