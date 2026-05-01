import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const formStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
`;

export const titleStyle = (theme: Theme) => css`
  ${text({ size: 'xl', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
  margin-bottom: ${theme.spacing.sm};
`;

export const linkRowStyle = (theme: Theme) => css`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.xs};
`;

export const linkTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const errorTextStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.status.error};
`;

export const linkButtonStyle = (theme: Theme) => css`
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.accent.primary};

  &:hover {
    text-decoration: underline;
  }
`;
