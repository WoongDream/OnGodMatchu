import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const sectionStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const sectionTitleStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const categoryRowStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;
