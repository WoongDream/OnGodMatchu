import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
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
`;

export const thumbnailStyle = (theme: Theme) => css`
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.tertiary};
  overflow: hidden;
  margin-bottom: ${theme.spacing.sm};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const categoryStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.accent.primary};
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'semibold', ellipsis: 2 })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;
`;

export const descriptionStyle = (theme: Theme) => css`
  ${text({ size: 'sm', ellipsis: 1 })({ theme })}
  color: ${theme.colors.fg.secondary};
  margin: 0;
`;

export const metricsRowStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-top: auto;
  padding-top: ${theme.spacing.sm};
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

export const starCornerStyle = (theme: Theme) => css`
  margin-left: auto;
  display: inline-flex;
  color: ${theme.colors.fg.tertiary};

  /* StarButton active 색은 컴포넌트 내부에서 처리 */
  button {
    padding: ${theme.spacing.xs};
  }
`;
