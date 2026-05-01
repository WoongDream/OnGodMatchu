import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
`;

export const labelRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
`;

export const labelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const inputStyle = (hasError: boolean) => (theme: Theme) => css`
  ${text({ size: 'md' })({ theme })}
  width: 100%;
  height: 2.75rem;
  padding: 0 0.875rem;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${hasError ? theme.colors.status.error : theme.colors.border.primary};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.primary};
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${hasError ? theme.colors.status.error : theme.colors.accent.primary};
  }

  &::placeholder {
    color: ${theme.colors.fg.tertiary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const errorMessageStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.status.error};
`;
