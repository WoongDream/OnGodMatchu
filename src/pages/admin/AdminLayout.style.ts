import { css, type Theme } from '@emotion/react';

export const wrapperStyle = (theme: Theme) => css`
  width: 100%;
  max-width: ${theme.breakpoints.desktop};
  margin: 0 auto;
  padding: ${theme.spacing.lg} ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.xl};
    display: grid;
    grid-template-columns: 16rem 1fr;
    gap: ${theme.spacing.xl};
    align-items: start;
  }
`;

export const sideStyle = (theme: Theme) => css`
  @media (max-width: calc(${theme.breakpoints.tablet} - 1px)) {
    margin-bottom: ${theme.spacing.md};
  }
`;

export const mainStyle = (theme: Theme) => css`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;
