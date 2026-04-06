import styled, { type CSSObject } from '@emotion/styled';
import { text } from '@/styles/text';
import type { Theme } from '@/styles/theme';
import type { ButtonVariant, ButtonSize } from './Button.type';

type StyledButtonProps = {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
};

const variantStyles: Record<ButtonVariant, (theme: Theme) => CSSObject> = {
  primary: (theme) => ({
    backgroundColor: theme.colors.accent.primary,
    color: theme.colors.accent.fg,
    '&:hover:not(:disabled)': { backgroundColor: theme.colors.accent.hover },
  }),
  secondary: (theme) => ({
    backgroundColor: 'transparent',
    color: theme.colors.accent.primary,
    border: `1px solid ${theme.colors.accent.primary}`,
    '&:hover:not(:disabled)': { backgroundColor: theme.colors.bg.secondary },
  }),
  ghost: (theme) => ({
    backgroundColor: 'transparent',
    color: theme.colors.fg.secondary,
    border: `1px solid ${theme.colors.border.primary}`,
    '&:hover:not(:disabled)': { backgroundColor: theme.colors.bg.secondary },
  }),
};

const sizeStyles: Record<ButtonSize, (theme: Theme) => CSSObject> = {
  sm: (theme) => ({
    height: '2rem',
    padding: `0 ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.sm,
  }),
  md: (theme) => ({
    height: '2.75rem',
    padding: `0 ${theme.spacing.lg}`,
    borderRadius: theme.borderRadius.md,
  }),
  lg: (theme) => ({
    height: '3.25rem',
    padding: `0 ${theme.spacing.xl}`,
    borderRadius: theme.borderRadius.lg,
  }),
};

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s,
    opacity 0.15s;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  ${({ $variant, theme }) => variantStyles[$variant](theme)}
  ${({ $size, theme }) => sizeStyles[$size](theme)}
  ${({ $size }) => text({ size: $size, weight: 'semibold' })}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
