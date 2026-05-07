import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const cardHeadingStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const imageRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

export const imageActionsStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  @media (max-width: ${theme.breakpoints.tablet}) {
    align-items: center;
  }
`;

export const imageButtonsRowStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;

  @media (max-width: ${theme.breakpoints.tablet}) {
    justify-content: center;
  }
`;

export const policyTextStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  line-height: 1.5;
`;

export const fieldStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const labelRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
`;

export const labelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const counterStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const textareaStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  width: 100%;
  min-height: 4rem;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.primary};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.primary};
  }
`;

export const saveRowStyle = (theme: Theme) => css`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

export const visibilityRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${theme.spacing.md};
`;

export const visibilityTextStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const visibilityTitleStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const visibilityHintStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
  line-height: 1.5;
`;

export const errorTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.status.error};
`;

export const statusTextStyle =
  (status: 'available' | 'taken' | 'invalid' | 'checking' | 'error') => (theme: Theme) => css`
    ${text({ size: 'xs', weight: 'regular' })({ theme })}
    color: ${status === 'available'
      ? theme.colors.status.success
      : status === 'checking'
        ? theme.colors.fg.tertiary
        : theme.colors.status.error};
  `;
