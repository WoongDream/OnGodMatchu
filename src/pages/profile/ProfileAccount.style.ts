import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;

  @media (max-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

export const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
  overflow: hidden;
`;

export const dangerCardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border: 1px solid #fecaca;
  border-radius: ${theme.borderRadius.lg};
  background-color: #fef2f2;
`;

export const rowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};

  &:not(:last-of-type) {
    border-bottom: 1px solid ${theme.colors.border.secondary};
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const rowMainStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  flex: 1;
  min-width: 0;
`;

export const rowLabelStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const rowValueStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
  word-break: break-all;
`;

export const rowSubtextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const rowAccentStyle = (theme: Theme) => css`
  color: ${theme.colors.accent.primary};
`;

export const rowActionStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  @media (max-width: ${theme.breakpoints.tablet}) {
    justify-content: flex-start;
  }
`;

export const dangerTitleStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'bold' })({ theme })}
  color: ${theme.colors.status.error};
  margin: 0;
`;

export const dangerBodyStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.primary};
  line-height: 1.6;
`;

export const dangerActionRowStyle = (theme: Theme) => css`
  display: flex;
  justify-content: flex-end;

  @media (max-width: ${theme.breakpoints.tablet}) {
    & > * {
      width: 100%;
    }
  }
`;
