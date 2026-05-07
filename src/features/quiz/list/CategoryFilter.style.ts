import { css, type Theme } from '@emotion/react';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.sm};
  overflow-x: auto;
  padding: ${theme.spacing.md} 0;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;
