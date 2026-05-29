import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const detailStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const detailHeaderStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const backLinkStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  align-self: flex-start;
  color: ${theme.colors.fg.secondary};
  text-decoration: none;

  &:hover {
    color: ${theme.colors.accent.primary};
  }
`;

export const releaseHeaderRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: baseline;
  gap: ${theme.spacing.md};
`;

export const versionStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const detailTitleStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const detailDateStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const tagsRowStyle = (theme: Theme) => css`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

export const detailBodyStyle = (theme: Theme) => css`
  padding: ${theme.spacing.md} 0;
  border-top: 1px solid ${theme.colors.border.primary};
`;

export const notFoundStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing['2xl']};
  color: ${theme.colors.fg.secondary};
  text-align: center;
`;
