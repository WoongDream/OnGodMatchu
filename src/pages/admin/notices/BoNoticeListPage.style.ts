import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const pageStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const ownerBannerStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.accent.subtle};
  color: ${theme.colors.fg.secondary};
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
`;

export const ownerTagStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'bold' })({ theme })}
  flex-shrink: 0;
  padding: 0 ${theme.spacing.sm};
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  border-radius: ${theme.borderRadius.sm};
  background-color: ${theme.colors.accent.primary};
  color: ${theme.colors.accent.fg};
`;

export const headerStyle = (theme: Theme) => css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const subtitleStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin: ${theme.spacing.xs} 0 0;
`;

export const statsGridStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const statCardStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
`;

export const statLabelStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const statValueStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const statHintStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const filterBarStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

export const searchWrapStyle = () => css`
  flex: 1 1 16rem;
  min-width: 12rem;
`;

export const tabsStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;

export const tabButtonStyle = (theme: Theme, active: boolean) => css`
  ${text({ size: 'sm', weight: active ? 'semibold' : 'medium' })({ theme })}
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.full};
  border: 1px solid ${active ? theme.colors.accent.primary : theme.colors.border.primary};
  background-color: ${active ? theme.colors.accent.subtle : theme.colors.bg.primary};
  color: ${active ? theme.colors.accent.active : theme.colors.fg.secondary};
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    border-color: ${theme.colors.accent.muted};
  }
`;

export const tableStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.primary};
  overflow: hidden;
`;

const gridColumns = '1fr 6rem 6rem 7rem 1.5rem';

export const tableHeadStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: ${gridColumns};
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background-color: ${theme.colors.bg.secondary};
  border-bottom: 1px solid ${theme.colors.border.primary};
  ${text({ size: 'xs', weight: 'semibold' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const rowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: ${gridColumns};
  align-items: center;
  gap: ${theme.spacing.md};
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 1px solid ${theme.colors.border.secondary};
  text-align: left;
  color: inherit;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:last-of-type {
    border-bottom: none;
  }

  &:hover {
    background-color: ${theme.colors.bg.secondary};
  }
`;

export const rowTitleStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium', ellipsis: true })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const cellMutedStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const chevronStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  color: ${theme.colors.fg.tertiary};
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

export const errorStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  color: ${theme.colors.status.error};
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
