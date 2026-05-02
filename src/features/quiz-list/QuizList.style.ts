import { css, type Theme } from '@emotion/react';

export const wrapperStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const emptyMessageStyle = (theme: Theme) => css`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${theme.spacing['2xl']} 0;
  color: ${theme.colors.fg.tertiary};
`;
