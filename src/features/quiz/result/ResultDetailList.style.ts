import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const listStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  list-style: none;
  margin: 0;
  padding: 0;
  counter-reset: result;
`;

export const itemStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const headerStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const numberStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

const badgeBase = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'semibold' })({ theme })}
  display: inline-flex;
  align-items: center;
  height: 1.25rem;
  padding: 0 ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
`;

export const badgeCorrectStyle = (theme: Theme) => css`
  ${badgeBase(theme)}
  background-color: #dcfce7;
  color: ${theme.colors.status.success};
`;

export const badgeWrongStyle = (theme: Theme) => css`
  ${badgeBase(theme)}
  background-color: #fee2e2;
  color: ${theme.colors.status.error};
`;

export const userAnswerStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const userAnswerLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;
