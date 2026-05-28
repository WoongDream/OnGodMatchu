import { css, type Theme } from '@emotion/react';

export const itemStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: ${theme.spacing.sm};
  align-items: flex-start;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border.secondary};
`;

export const bodyStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  min-width: 0;
`;

export const headStyle = (theme: Theme) => css`
  display: flex;
  align-items: baseline;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

export const nicknameStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
`;

export const timeStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const contentStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.primary};
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
`;

export const actionsStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  align-self: center;
  gap: ${theme.spacing.xs};
`;

export const deleteButtonStyle = (theme: Theme) => css`
  appearance: none;
  background: transparent;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  color: ${theme.colors.fg.secondary};
  cursor: pointer;
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  line-height: 1.2;
  transition:
    color 0.15s,
    border-color 0.15s,
    background-color 0.15s;

  &:hover:not(:disabled) {
    color: ${theme.colors.status.error};
    border-color: ${theme.colors.status.error};
    background-color: ${theme.colors.bg.secondary};
  }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;
