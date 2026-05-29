import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = css`
  display: flex;
  width: 100%;
`;

export const formStyle = (theme: Theme) => css`
  display: flex;
  align-items: stretch;
  gap: ${theme.spacing.sm};
  width: 100%;
`;

export const inputStyle = (theme: Theme) => css`
  ${text({ size: 'md' })({ theme })}
  flex: 1;
  min-width: 0;
  height: 2.75rem;
  padding: 0 0.875rem;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.primary};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.primary};
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${theme.colors.accent.primary};
  }

  &::placeholder {
    color: ${theme.colors.fg.tertiary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const submitButtonStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border: none;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.accent.primary};
  color: ${theme.colors.bg.primary};
  cursor: pointer;
  transition:
    background-color 0.15s,
    opacity 0.15s;

  &:hover:not(:disabled) {
    background-color: ${theme.colors.accent.hover};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
