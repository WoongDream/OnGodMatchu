import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const progressTrackStyle = (theme: Theme) => css`
  position: relative;
  height: 4px;
  background-color: ${theme.colors.bg.tertiary};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  margin-top: ${theme.spacing.xs};
`;

export const progressBarStyle = (percent: number) => (theme: Theme) => css`
  position: absolute;
  inset: 0 ${100 - percent}% 0 0;
  background-color: ${theme.colors.accent.primary};
  transition: right 0.2s ease;
`;

export const stepLabelStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const stepRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

export const stepRowTrackStyle = css`
  flex: 1;
`;

export const guideTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin-bottom: ${theme.spacing.md};
`;

export const fieldStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
`;

export const fieldLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const inputStyle = (hasError: boolean) => (theme: Theme) => css`
  height: 2.75rem;
  padding: 0 ${theme.spacing.md};
  border: 1px solid ${hasError ? theme.colors.status.error : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.primary};
  ${text({ size: 'md' })({ theme })}

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.primary};
  }

  &::placeholder {
    color: ${theme.colors.fg.tertiary};
  }
`;

export const errorTextStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.status.error};
`;
