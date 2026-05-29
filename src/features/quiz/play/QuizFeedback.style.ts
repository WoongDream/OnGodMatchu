import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const rowStyle = (theme: Theme) => css`
  display: flex;
  align-items: stretch;
  gap: ${theme.spacing.sm};
  width: 100%;
`;

export const boxStyle = (correct: boolean) => (theme: Theme) => css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  background-color: ${correct
    ? `${theme.colors.status.success}12`
    : `${theme.colors.status.error}12`};
  border: 1px solid
    ${correct ? `${theme.colors.status.success}50` : `${theme.colors.status.error}50`};
  min-width: 0;
`;

export const resultRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  ${text({ size: 'md', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const resultIconStyle = (correct: boolean) => (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${correct ? theme.colors.status.success : theme.colors.status.error};
  color: ${theme.colors.fg.inverse};
  flex-shrink: 0;
`;

export const detailRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: baseline;
  gap: ${theme.spacing.sm};
  ${text({ size: 'sm' })({ theme })}
`;

export const detailLabelStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.tertiary};
`;

export const detailValueStyle = (theme: Theme) => css`
  color: ${theme.colors.status.success};
  font-weight: ${theme.fontWeight.bold};
`;

export const myAnswerValueStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.primary};
  font-weight: ${theme.fontWeight.bold};
`;

export const nextButtonStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 56px;
  padding: 0 ${theme.spacing.md};
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
