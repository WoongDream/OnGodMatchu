import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const navStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} 0;
`;

export const linkStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.fg.secondary};
  text-decoration: none;

  &.active {
    background-color: ${theme.colors.bg.secondary};
    color: ${theme.colors.fg.primary};
    font-weight: ${theme.fontWeight.semibold};
  }

  &:hover:not(.active) {
    background-color: ${theme.colors.bg.secondary};
  }
`;

export const childLinkStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.fg.secondary};
  text-decoration: none;

  &.active {
    background-color: ${theme.colors.bg.secondary};
    color: ${theme.colors.fg.primary};
    font-weight: ${theme.fontWeight.semibold};
  }

  &:hover:not(.active) {
    background-color: ${theme.colors.bg.secondary};
  }
`;

export const countStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const groupHeaderStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};

  &:hover {
    background-color: ${theme.colors.bg.secondary};
  }
`;

export const groupLabelStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const groupChevronStyle = (open: boolean) => (theme: Theme) => css`
  ${text({ size: 'md', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  display: inline-block;
  transition: transform 0.15s;
  transform: rotate(${open ? '90deg' : '0deg'});
`;
