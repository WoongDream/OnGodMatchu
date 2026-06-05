import { css, type Theme } from '@emotion/react';

export const rowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
  cursor: pointer;
  transition:
    background-color 0.12s ease,
    border-color 0.12s ease;

  &:hover {
    background-color: ${theme.colors.bg.secondary};
    border-color: ${theme.colors.border.primary};
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent.primary};
    outline-offset: -2px;
  }
`;

export const mainStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  min-width: 0;
`;

export const titleRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  min-width: 0;
`;

export const titleStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const contentStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const rightStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex-shrink: 0;
  color: ${theme.colors.fg.tertiary};
`;

export const dateStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.tertiary};
  white-space: nowrap;
`;

export const chevronStyle = css`
  flex-shrink: 0;
`;
