import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  position: relative;
  display: flex;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
  cursor: pointer;
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  &:focus-visible {
    outline: 2px solid ${theme.colors.accent.primary};
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

export const thumbnailStyle = (theme: Theme) => css`
  flex: 0 0 11rem;
  aspect-ratio: 16 / 9;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.tertiary};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 640px) {
    flex-basis: auto;
    width: 100%;
  }
`;

export const bodyStyle = (theme: Theme) => css`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const categoryStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.accent.primary};
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'semibold', ellipsis: 1 })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const metricsRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  color: ${theme.colors.fg.tertiary};
`;

export const metricItemStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.tertiary};
  line-height: 1;

  svg {
    color: ${theme.colors.fg.tertiary};
    flex-shrink: 0;
  }
`;

export const recordRowStyle = (theme: Theme) => css`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.accent.muted};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.xs};
  color: ${theme.colors.fg.secondary};
`;

export const recordLabelStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'semibold' })({ theme })}
  color: ${theme.colors.accent.active};
`;

export const recordItemStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.secondary};
`;

export const recordValueStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.primary};
  font-weight: ${theme.fontWeight.semibold};
`;

/** 상위 % — 강조 여부에 따라 primary 또는 기본 톤. */
export const topPercentileStyle = (highlight: boolean) => (theme: Theme) => css`
  font-weight: ${theme.fontWeight.semibold};
  color: ${highlight ? theme.colors.accent.primary : theme.colors.fg.secondary};
`;

export const replayCountStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-left: auto;
  color: ${theme.colors.fg.tertiary};
`;

/** 풀이 횟수 — primary 톤 + 배경 블록으로 풀이 시간과 시각 구별. */
export const replayChipStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  background-color: ${theme.colors.accent.subtle};
  color: ${theme.colors.accent.active};
  font-weight: ${theme.fontWeight.semibold};
  line-height: 1;
`;

export const dateStyle = (theme: Theme) => css`
  color: ${theme.colors.fg.tertiary};
`;
