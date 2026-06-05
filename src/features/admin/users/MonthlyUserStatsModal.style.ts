import { css, type Theme } from '@emotion/react';

export const subtitleStyle = (theme: Theme) => css`
  margin: 0 0 ${theme.spacing.lg};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
`;

export const emptyStyle = (theme: Theme) => css`
  padding: ${theme.spacing.xl} 0;
  text-align: center;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.tertiary};
`;

export const chartStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: end;
  gap: ${theme.spacing.sm};
  height: 180px;
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  background-color: ${theme.colors.bg.secondary};
  border-radius: ${theme.borderRadius.md};
`;

export const barColumnStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  gap: ${theme.spacing.xs};
`;

export const barValueStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.medium};
  color: ${theme.colors.fg.secondary};
`;

export const barFillStyle = (theme: Theme, heightPct: number, isCurrent: boolean) => css`
  width: 100%;
  max-width: 2.5rem;
  height: ${heightPct}%;
  border-radius: ${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0;
  background-color: ${isCurrent ? theme.colors.accent.primary : theme.colors.accent.subtle};
`;

export const barLabelStyle = (theme: Theme, isCurrent: boolean) => css`
  font-size: ${theme.fontSize.xs};
  font-weight: ${isCurrent ? theme.fontWeight.bold : theme.fontWeight.regular};
  color: ${isCurrent ? theme.colors.accent.active : theme.colors.fg.tertiary};
`;

export const listStyle = (theme: Theme) => css`
  max-height: 40rem;
  overflow-y: auto;
  margin-bottom: ${theme.spacing.xl};
  border: 1px solid ${theme.colors.border.secondary};
  border-radius: ${theme.borderRadius.md};
`;

/** 스크롤 영역 안에 sticky 로 두어 행과 동일한 너비·컬럼을 공유 (스크롤바로 인한 어긋남 방지). */
export const listHeaderStyle = (theme: Theme) => css`
  position: sticky;
  top: 0;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 1fr 5rem 5rem;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.bg.primary};
  border-bottom: 1px solid ${theme.colors.border.secondary};
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
`;

export const listRowStyle = (theme: Theme, isCurrent: boolean) => css`
  display: grid;
  grid-template-columns: 1fr 1fr 5rem 5rem;
  gap: ${theme.spacing.sm};
  align-items: center;
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border.secondary};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  color: ${theme.colors.fg.primary};
  background-color: ${isCurrent ? theme.colors.accent.subtle : 'transparent'};
`;

export const monthCellStyle = (theme: Theme) => css`
  font-weight: ${theme.fontWeight.semibold};
`;

export const newStyle = (theme: Theme) => css`
  color: ${theme.colors.status.success};
`;

export const churnStyle = (theme: Theme) => css`
  color: ${theme.colors.status.error};
`;
