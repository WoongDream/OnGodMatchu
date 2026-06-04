import { css, type Theme } from '@emotion/react';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing['2xl']} ${theme.spacing.md};
  text-align: center;
`;

export const titleStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.fg.primary};
`;

export const descStyle = (theme: Theme) => css`
  margin: 0;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.fg.secondary};
`;
