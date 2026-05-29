import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const cardStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 6.5rem 1fr;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  transition: background-color 0.15s ease;

  &:hover {
    background-color: ${theme.colors.bg.secondary};
  }

  @media (max-width: calc(${theme.breakpoints.tablet} - 1px)) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.sm};
  }
`;

export const leftColumnStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const versionStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const dateStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const rightColumnStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  min-width: 0;
`;

export const tagsRowStyle = (theme: Theme) => css`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const moreLinkStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.accent.primary};
`;
