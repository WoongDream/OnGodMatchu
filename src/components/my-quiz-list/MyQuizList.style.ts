import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const listStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const itemStyle = css`
  display: block;
`;

export const emptyStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'regular' })({ theme })}
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.fg.secondary};
  border: 1px dashed ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
`;
