import { css, type Theme } from '@emotion/react';

export const pageStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const bannerStyle = (theme: Theme) => css`
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  background-color: #f5f3ff;
  font-size: ${theme.fontSize.sm};
  color: #6d28d9;
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
  grid-template-columns: repeat(5, 1fr);
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

export const clickableCardStyle = css`
  cursor: pointer;
  transition: border-color 0.12s ease;

  &:hover {
    border-color: #38bdf8;
  }
`;

export const cardLabelStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const cardLabelRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const chevronBoxStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.bg.primary};
  font-size: ${theme.fontSize.lg};
  line-height: 1;
  color: ${theme.colors.fg.secondary};
`;

export const cardValueStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const cardSubStyle = (theme: Theme, danger?: boolean) => css`
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.medium};
  color: ${danger ? theme.colors.status.error : theme.colors.status.success};
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
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${active ? theme.colors.accent.primary : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.full};
  background-color: ${active ? theme.colors.accent.subtle : theme.colors.bg.primary};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  color: ${active ? theme.colors.accent.active : theme.colors.fg.secondary};
  cursor: pointer;
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
