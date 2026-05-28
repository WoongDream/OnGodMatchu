import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xl};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.lg};
  border: 1px solid ${theme.colors.border.primary};
  background: linear-gradient(135deg, ${theme.colors.bg.primary}, ${theme.colors.accent.subtle});

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.lg};
  }
`;

export const circleWrapperStyle = css`
  position: relative;
  width: 96px;
  height: 96px;
  flex-shrink: 0;
`;

export const svgStyle = css`
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
`;

export const trackStyle = (theme: Theme) => css`
  fill: none;
  stroke: ${theme.colors.border.primary};
  stroke-width: 6;
`;

export const progressStyle = (theme: Theme) => css`
  fill: none;
  stroke: ${theme.colors.accent.primary};
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.6s ease;
`;

export const circleCenterStyle = css`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
`;

export const percentNumberStyle = (theme: Theme) => css`
  font-size: 1.75rem;
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
  line-height: 1;
`;

export const percentLabelStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;

export const rightStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const captionStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.accent.primary};
`;

export const titleStyle = (theme: Theme) => css`
  font-size: 1.375rem;
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
  line-height: 1.3;
  margin: 0;
`;

export const titleHighlightStyle = (theme: Theme) => css`
  color: ${theme.colors.accent.primary};
`;
