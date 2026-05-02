import { css, keyframes, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const wrapperStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.xl};
  min-height: 50vh;
`;

export const spinnerStyle = (theme: Theme) => css`
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid ${theme.colors.border.primary};
  border-top-color: ${theme.colors.accent.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const messageStyle = (theme: Theme) => css`
  ${text({ size: 'md' })({ theme })}
  color: ${theme.colors.fg.secondary};
  text-align: center;
`;

export const errorMessageStyle = (theme: Theme) => css`
  ${text({ size: 'md', weight: 'medium' })({ theme })}
  color: ${theme.colors.status.error};
  text-align: center;
`;
