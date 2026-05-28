import { css, type Theme } from '@emotion/react';

export const SPARKLINE_WIDTH = 80;
export const SPARKLINE_HEIGHT = 32;

export const wrapperStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.md};
  height: 40px;
  padding: 0 ${theme.spacing.md};
  background-color: ${theme.colors.accent.subtle};
  border-radius: ${theme.borderRadius.md};
  white-space: nowrap;
`;

export const textStackStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  line-height: 1.1;
  color: ${theme.colors.fg.secondary};
`;

export const rowStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: baseline;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSize.xs};
`;

export const labelStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.tertiary ?? theme.colors.fg.secondary};
  font-weight: ${theme.fontWeight.medium};
  letter-spacing: 0.02em;
`;

export const todayValueStyle = (theme: Theme) => css`
  color: ${theme.colors.accent.primary};
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
`;

export const totalValueStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.secondary};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
`;

export const sparklineWrapperStyle = css`
  display: none;

  @media (min-width: 48rem) {
    display: block;
  }
`;

export const sparklineSvgStyle = css`
  display: block;
`;

export const desktopOnlyStyle = css`
  display: none;

  @media (min-width: 48rem) {
    display: flex;
  }
`;
