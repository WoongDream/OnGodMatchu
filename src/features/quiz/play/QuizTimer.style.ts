import { css, type Theme } from '@emotion/react';

export const wrapperStyle = css`
  position: relative;
  width: 78px;
  height: 78px;
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
  stroke-width: 3;
`;

export const progressStyle = (isCritical: boolean) => (theme: Theme) => css`
  fill: none;
  stroke: ${isCritical ? theme.colors.status.error : theme.colors.accent.primary};
  stroke-width: 3;
  stroke-linecap: round;
  transition:
    stroke-dashoffset 0.3s linear,
    stroke 0.15s;
`;

export const labelStyle = (isCritical: boolean) => (theme: Theme) => css`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  font-weight: ${theme.fontWeight.bold};
  line-height: 1;
  letter-spacing: -0.04em;
  /* 폰트 metric (ascender 여백) 으로 시각 중심이 위로 치우치는 것 보정 */
  padding-top: 0.1em;
  color: ${isCritical ? theme.colors.status.error : theme.colors.accent.primary};
  transition: color 0.15s;
`;
