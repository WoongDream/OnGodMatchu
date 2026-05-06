import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl} 0;
`;

export const imageStyle = (theme: Theme) => css`
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: ${theme.borderRadius.lg};
  background-color: ${theme.colors.bg.tertiary};
`;

export const textStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'semibold', lineHeight: 1.6 })({ theme })}
  color: ${theme.colors.fg.primary};
`;
