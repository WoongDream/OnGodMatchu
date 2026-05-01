import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.primary};
  cursor: pointer;
  transition: box-shadow 0.15s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

export const thumbnailStyle = (theme: Theme) => css`
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: ${theme.borderRadius.md};
  background-color: ${theme.colors.bg.tertiary};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'semibold', ellipsis: 2 })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const descriptionStyle = (theme: Theme) => css`
  ${text({ size: 'sm', ellipsis: 1 })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const metaStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

export const categoryStyle = (theme: Theme) => css`
  ${text({ size: 'xs', weight: 'medium' })({ theme })}
  color: ${theme.colors.accent.primary};
`;

export const playCountStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.fg.tertiary};
`;
