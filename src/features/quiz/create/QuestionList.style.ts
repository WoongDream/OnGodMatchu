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

export const listWrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;
