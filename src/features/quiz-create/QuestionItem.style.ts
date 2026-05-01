import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const headerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const numberStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  color: ${theme.colors.accent.primary};
`;

export const actionsStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.xs};
`;

export const iconButtonStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  padding: ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.sm};

  &:hover {
    color: ${theme.colors.fg.secondary};
    background-color: ${theme.colors.bg.secondary};
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;
