import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.primary};
  background-color: ${theme.colors.bg.primary};
`;

export const topRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const metaStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const chartStyle = css`
  display: flex;
  align-items: stretch;
  gap: 6px;
  height: 200px;
`;

export const barColumnStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
`;

export const badgeSlotStyle = css`
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const myBadgeStyle = (theme: Theme) => css`
  padding: 3px 10px;
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.accent.primary};
  color: ${theme.colors.bg.primary};
  ${text({ size: 'xs', weight: 'bold' })({ theme })}
  white-space: nowrap;
`;

export const barTrackStyle = css`
  width: 100%;
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  min-height: 0;
`;

export const barFillStyle = (heightPercent: number, isMine: boolean) => (theme: Theme) => css`
  width: 100%;
  height: ${Math.max(2, heightPercent)}%;
  border-radius: ${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0;
  background-color: ${isMine ? theme.colors.accent.primary : theme.colors.bg.tertiary};
  transition: background-color 0.15s;
`;

export const barLabelStyle = (isMine: boolean) => (theme: Theme) => css`
  margin-top: 6px;
  ${text({ size: 'xs' })({ theme })}
  color: ${isMine ? theme.colors.accent.primary : theme.colors.fg.tertiary};
  font-weight: ${isMine ? theme.fontWeight.bold : theme.fontWeight.regular};
`;

export const footerStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  text-align: center;
`;

export const footerHighlightStyle = (theme: Theme) => css`
  color: ${theme.colors.accent.primary};
  font-weight: ${theme.fontWeight.bold};
`;
