import { css, type Theme } from '@emotion/react';

export const SPARKLINE_WIDTH = 80;
export const SPARKLINE_HEIGHT = 32;

export const wrapperStyle = (theme: Theme) => css`
  display: none;
  align-items: center;
  align-self: stretch;
  gap: ${theme.spacing.md};
  padding: 0 ${theme.spacing.md};
  background-color: ${theme.colors.accent.subtle};
  border: 1px solid ${theme.colors.border.primary};
  white-space: nowrap;

  @media (min-width: ${theme.breakpoints.tablet}) {
    display: inline-flex;
  }
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
`;

export const labelStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.tertiary ?? theme.colors.fg.secondary};
  font-size: 0.6875rem;
  font-weight: ${theme.fontWeight.medium};
  letter-spacing: 0.04em;
`;

export const todayValueStyle = (theme: Theme) => css`
  color: ${theme.colors.accent.primary};
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.bold};
`;

export const totalValueStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.primary};
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.bold};
`;

export const sparklineWrapperStyle = css`
  display: none;

  @media (min-width: 48rem) {
    display: block;
  }
`;

export const sparklineSvgStyle = css`
  display: block;
  overflow: visible;
`;

export const desktopOnlyStyle = css`
  display: none;

  @media (min-width: 48rem) {
    display: flex;
  }
`;
