import { css, type Theme } from '@emotion/react';

export const pageStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const titleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const subtitleStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.md};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
`;

export const statsGridStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const cardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  text-align: left;
`;

export const cardLabelStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const cardValueStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const tabsStyle = (theme: Theme) => css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

export const searchInputStyle = (theme: Theme) => css`
  flex: 1;
  min-width: 12rem;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.primary};

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.primary};
  }
`;

export const tabButtonStyle = (theme: Theme, active: boolean) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${active ? theme.colors.accent.primary : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.full};
  background-color: ${active ? theme.colors.accent.subtle : theme.colors.bg.primary};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  color: ${active ? theme.colors.accent.active : theme.colors.fg.secondary};
  cursor: pointer;
`;

export const tabCountStyle = (theme: Theme, active: boolean) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  padding: 0 ${theme.spacing.xs};
  border-radius: ${theme.borderRadius.full};
  background-color: ${active ? theme.colors.accent.primary : theme.colors.bg.secondary};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.semibold};
  color: ${active ? theme.colors.bg.primary : theme.colors.fg.tertiary};
`;

export const listHeaderStyle = (theme: Theme, columns: string) => css`
  display: grid;
  grid-template-columns: ${columns};
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.sm};
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const emptyStyle = (theme: Theme) => css`
  padding: ${theme.spacing['2xl']} 0;
  text-align: center;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.tertiary};
`;

export const sentinelStyle = (theme: Theme) => css`
  padding: ${theme.spacing.md} 0;
  text-align: center;
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const footerCountStyle = (theme: Theme) => css`
  margin: 0;
  text-align: center;
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;
