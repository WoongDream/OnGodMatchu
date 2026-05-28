import { css, type Theme } from '@emotion/react';

export const listStyle = (theme: Theme) => css`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const emptyStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.tertiary};
  text-align: center;
  padding: ${theme.spacing.lg} 0;
  margin: 0;
`;
