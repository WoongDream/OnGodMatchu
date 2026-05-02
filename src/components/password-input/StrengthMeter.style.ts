import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';
import type { PasswordStrengthScore } from './PasswordInput.type';

const STRENGTH_COLOR_KEYS: readonly (keyof Theme['colors']['strength'])[] = [
  'veryWeak',
  'weak',
  'fair',
  'good',
  'strong',
];

export const meterWrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
`;

export const barRowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${theme.spacing.xs};
`;

export const barSegmentStyle =
  (filled: boolean, score: PasswordStrengthScore) => (theme: Theme) => css`
    height: 0.375rem;
    border-radius: ${theme.borderRadius.sm};
    background-color: ${filled
      ? theme.colors.strength[STRENGTH_COLOR_KEYS[score]]
      : theme.colors.border.primary};
    transition: background-color 0.15s;
  `;

export const infoRowStyle = (theme: Theme) => css`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
`;

export const strengthLabelStyle = (score: PasswordStrengthScore) => (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.strength[STRENGTH_COLOR_KEYS[score]]};
`;

export const crackTimeTextStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const feedbackTextStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.status.warning};
`;
