import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
`;

export const labelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const inputBoxStyle = css`
  position: relative;
  width: 100%;
`;

export const inputStyle = (hasError: boolean) => (theme: Theme) => css`
  ${text({ size: 'md' })({ theme })}
  width: 100%;
  height: 2.75rem;
  padding: 0 2.75rem 0 0.875rem;
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

export const toggleButtonStyle = (theme: Theme) => css`
  position: absolute;
  top: 50%;
  right: 0.5rem;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  background: transparent;
  color: ${theme.colors.fg.secondary};
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;

  &:hover:not(:disabled) {
    color: ${theme.colors.fg.primary};
    background-color: ${theme.colors.bg.secondary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent.primary};
    outline-offset: 1px;
  }
`;

export const errorMessageStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.status.error};
`;
