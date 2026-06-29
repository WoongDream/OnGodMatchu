import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

export const toolbarStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding-top: ${theme.spacing.md};
`;

export const sortBoxStyle = css`
  flex-shrink: 0;
`;

export const searchBoxStyle = css`
  flex: 1;
  min-width: 0;
`;

export const messageStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.tertiary};
  text-align: center;
  padding: ${theme.spacing['2xl']} 0;
`;
