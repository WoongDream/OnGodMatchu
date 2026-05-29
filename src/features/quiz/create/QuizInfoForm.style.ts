import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';

export const sectionStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const sectionTitleStyle = (theme: Theme) => css`
  ${text({ size: 'lg', weight: 'bold' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const thumbnailFieldStyle = css`
  width: 100%;
  max-width: 36rem;
`;

export const categoryRowStyle = (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

export const fieldGroupStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

export const fieldLabelRowStyle = (theme: Theme) => css`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  ${text({ size: 'sm', weight: 'medium' })({ theme })}
  color: ${theme.colors.fg.primary};
`;

export const requiredDotStyle = (theme: Theme) => css`
  color: ${theme.colors.status.error};
  font-size: ${theme.fontSize.md};
  line-height: 1;
`;

export const errorMessageStyle = (theme: Theme) => css`
  ${text({ size: 'xs' })({ theme })}
  color: ${theme.colors.status.error};
`;

export const textareaStyle = (hasError: boolean) => (theme: Theme) => css`
  ${text({ size: 'md' })({ theme })}
  width: 100%;
  min-height: 5rem;
  padding: 0.75rem 0.875rem;
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${hasError ? theme.colors.status.error : theme.colors.border.primary};
  background-color: ${theme.colors.bg.primary};
  color: ${theme.colors.fg.primary};
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.15s;

  &:focus {
    border-color: ${hasError ? theme.colors.status.error : theme.colors.accent.primary};
  }

  &::placeholder {
    color: ${theme.colors.fg.tertiary};
  }
`;

export const categoryFieldStyle = (hasError: boolean) => (theme: Theme) => css`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${hasError ? theme.colors.status.error : 'transparent'};
`;
