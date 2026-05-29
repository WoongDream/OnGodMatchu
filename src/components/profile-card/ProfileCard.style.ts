import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
`;

export const headerRowStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const nicknameStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const bioStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
  text-align: center;
  max-width: 16rem;
  margin: 0;
`;

export const statsGroupStyle = (theme: Theme) => css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.xs};
`;

export const statBlockStyle = (theme: Theme) => css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const blockTitleStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  margin: 0;
  color: ${theme.colors.fg.tertiary};

  svg {
    display: block;
    flex-shrink: 0;
  }
`;

export const statRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: stretch;
  padding: ${theme.spacing.xs} 0;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.secondary};
`;

export const statCellStyle = (theme: Theme) => css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 0 ${theme.spacing.sm};
`;

export const statValueStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const statLabelStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const statDividerStyle = (theme: Theme) => css`
  width: 1px;
  align-self: stretch;
  background-color: ${theme.colors.border.secondary};
`;
