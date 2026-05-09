import { css, type Theme } from '@emotion/react';
import { text } from '@/styles/text';
import type { ButtonVariant, ButtonSize } from './Button.type';

const variantBlock = (variant: ButtonVariant, theme: Theme) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${theme.colors.accent.primary};
        color: ${theme.colors.accent.fg};
        &:hover:not(:disabled) {
          background-color: ${theme.colors.accent.hover};
        }
      `;
    case 'secondary':
      return css`
        background-color: transparent;
        color: ${theme.colors.accent.primary};
        border: 1px solid ${theme.colors.accent.primary};
        &:hover:not(:disabled) {
          background-color: ${theme.colors.bg.secondary};
        }
      `;
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${theme.colors.fg.secondary};
        border: 1px solid ${theme.colors.border.primary};
        &:hover:not(:disabled) {
          background-color: ${theme.colors.bg.secondary};
        }
      `;
    case 'danger':
      return css`
        background-color: ${theme.colors.status.error};
        color: ${theme.colors.accent.fg};
        &:hover:not(:disabled) {
          background-color: #dc2626;
        }
      `;
    case 'dangerOutline':
      return css`
        background-color: transparent;
        color: ${theme.colors.status.error};
        border: 1px solid ${theme.colors.status.error};
        &:hover:not(:disabled) {
          background-color: #fef2f2;
        }
      `;
  }
};

const sizeBlock = (size: ButtonSize, theme: Theme) => {
  switch (size) {
    case 'sm':
      return css`
        height: 2rem;
        padding: 0 ${theme.spacing.sm};
        border-radius: ${theme.borderRadius.sm};
      `;
    case 'md':
      return css`
        height: 2.75rem;
        padding: 0 ${theme.spacing.lg};
        border-radius: ${theme.borderRadius.md};
      `;
    case 'lg':
      return css`
        height: 3.25rem;
        padding: 0 ${theme.spacing.xl};
        border-radius: ${theme.borderRadius.lg};
      `;
  }
};

export const buttonStyle =
  (variant: ButtonVariant, size: ButtonSize, fullWidth: boolean) => (theme: Theme) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.15s,
      opacity 0.15s;
    width: ${fullWidth ? '100%' : 'auto'};

    ${variantBlock(variant, theme)}
    ${sizeBlock(size, theme)}
    ${text({ size, weight: 'semibold' })({ theme })}

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `;
