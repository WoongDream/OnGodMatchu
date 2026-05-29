import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const pageStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const headerStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const headerIconStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.accent.subtle};
  color: ${theme.colors.accent.primary};

  svg {
    width: 1.375rem;
    height: 1.375rem;
    display: block;
  }
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const subtitleStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin: ${theme.spacing.xs} 0 0;
`;

export const listStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  overflow: hidden;
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const rowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  text-decoration: none;
  border-bottom: 1px solid ${theme.colors.border.secondary};
  color: inherit;
  transition: background-color 0.15s ease;

  li:last-child & {
    border-bottom: none;
  }

  &:hover {
    background-color: ${theme.colors.bg.secondary};
  }
`;

export const rowTitleStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const rowDateStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  flex-shrink: 0;
`;

export const loadingStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  text-align: center;
  padding: ${theme.spacing.lg};
`;

export const emptyStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
  text-align: center;
  padding: ${theme.spacing['2xl']} ${theme.spacing.lg};
  border: 1px dashed ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
`;

export const sentinelStyle = () => css`
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const cardListStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;
