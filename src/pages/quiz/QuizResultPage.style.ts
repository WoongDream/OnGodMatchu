import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const pageStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const commentsSectionStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border.primary};
`;

export const commentsHeaderStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin: 0;

  span {
    color: ${theme.colors.fg.tertiary};
    margin-left: 4px;
  }
`;
