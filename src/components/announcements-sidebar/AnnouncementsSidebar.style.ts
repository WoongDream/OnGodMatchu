import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const navStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} 0;
`;

export const groupHeaderStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
`;

export const linkStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.fg.secondary};
  text-decoration: none;

  &.active {
    background-color: ${theme.colors.accent.subtle};
    color: ${theme.colors.accent.primary};
    font-weight: ${theme.fontWeight.semibold};
  }

  &:hover:not(.active) {
    background-color: ${theme.colors.bg.secondary};
  }
`;

export const iconStyle = () => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  color: currentColor;

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

export const countStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;
