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

export const avatarButtonStyle = (theme: Theme) => css`
  appearance: none;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  display: block;

  &:focus-visible {
    outline: 2px solid ${theme.colors.accent.primary};
    outline-offset: 2px;
  }
`;

export const nicknameButtonStyle = (theme: Theme) => css`
  appearance: none;
  background: transparent;
  border: none;
  padding: 0;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.fg.primary};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.accent.primary};
    outline-offset: 2px;
  }
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
