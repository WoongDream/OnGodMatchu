import { css, type Theme } from '@emotion/react';

export const messageStyle = (theme: Theme) => css`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
  line-height: 1.5;
  margin: 0;
`;

export const footerActionsStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
  width: 100%;
`;
