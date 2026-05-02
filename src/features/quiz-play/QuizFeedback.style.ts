import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const wrapperStyle = (correct: boolean) => (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.lg};
  background-color: ${correct
    ? `${theme.colors.status.success}18`
    : `${theme.colors.status.error}18`};
  border: 1px solid ${correct ? theme.colors.status.success : theme.colors.status.error};
`;

export const resultStyle = (correct: boolean) => (theme: Theme) => css`
  ${text({ size: 'md', weight: 'bold' })({ theme })}
  color: ${correct ? theme.colors.status.success : theme.colors.status.error};
`;

export const answerStyle = (theme: Theme) => css`
  ${text({ size: 'sm' })({ theme })}
  color: ${theme.colors.fg.secondary};
`;

export const answerImageStyle = (theme: Theme) => css`
  width: 100%;
  max-width: 24rem;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.primary};
`;
