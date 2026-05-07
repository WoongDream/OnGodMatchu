import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr 2fr;
    align-items: stretch;
  }
`;

export const highlightCardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.accent.muted};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.accent.subtle};
`;

export const highlightHeaderStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.accent.active};
`;

export const highlightLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'bold' })({ theme })}
  color: ${theme.colors.accent.active};
`;

export const highlightValueRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: ${theme.spacing.xl};
`;

export const highlightValueStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  font-size: 2rem;
  line-height: 1.1;
  color: ${theme.colors.accent.active};
`;

export const highlightDeltaStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  display: inline-flex;
  align-items: center;
  gap: 0.125rem;
  color: ${theme.colors.accent.primary};
`;

export const gridStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
  overflow: hidden;

  @media (min-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const cellStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
  border-right: 1px solid ${theme.colors.border.secondary};
  border-bottom: 1px solid ${theme.colors.border.secondary};

  &:nth-of-type(2n) {
    border-right: none;
  }

  @media (min-width: ${theme.breakpoints.tablet}) {
    &:nth-of-type(2n) {
      border-right: 1px solid ${theme.colors.border.secondary};
    }
    &:nth-of-type(3n) {
      border-right: none;
    }
  }
`;

export const cellHeaderStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.fg.secondary};

  svg {
    display: block;
    flex-shrink: 0;
  }
`;

export const cellLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  line-height: 1.125rem;
  color: ${theme.colors.fg.secondary};
`;

export const cellValueStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;
