import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const dividerStyle = (theme: Theme) => css`
  border: none;
  border-top: 1px solid ${theme.colors.border.primary};
`;

export const visibilityCardStyle = (theme: Theme) => css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const visibilityTextStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const visibilityTitleStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const visibilityHintStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const errorBannerStyle = (theme: Theme) => css`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.status.error};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.status.error};
  background-color: ${theme.colors.bg.secondary};
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
`;

export const noticeStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const buttonsRowStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.sm};

  & > * {
    flex: 1;
  }
`;
