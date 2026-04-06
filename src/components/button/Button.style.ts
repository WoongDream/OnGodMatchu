import styled from '@emotion/styled';
import { text } from '@/styles/text';
import type { ButtonVariant, ButtonSize } from './Button.type';

type StyledButtonProps = {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
};

export const StyledButton = styled.button<StyledButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s,
    opacity 0.15s;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  ${({ $variant, theme }) => {
    const { accent, bg, border, fg } = theme.colors;
    switch ($variant) {
      case 'primary':
        return `
          background-color: ${accent.primary};
          color: ${accent.fg};
          &:hover:not(:disabled) { background-color: ${accent.hover}; }
        `;
      case 'secondary':
        return `
          background-color: transparent;
          color: ${accent.primary};
          border: 1px solid ${accent.primary};
          &:hover:not(:disabled) { background-color: ${bg.secondary}; }
        `;
      case 'ghost':
        return `
          background-color: transparent;
          color: ${fg.secondary};
          border: 1px solid ${border.primary};
          &:hover:not(:disabled) { background-color: ${bg.secondary}; }
        `;
    }
  }}

  ${({ $size, theme }) => {
    const { borderRadius } = theme;
    switch ($size) {
      case 'sm':
        return `
          height: 2rem;
          padding: 0 ${theme.spacing.sm};
          border-radius: ${borderRadius.sm};
        `;
      case 'md':
        return `
          height: 2.75rem;
          padding: 0 ${theme.spacing.lg};
          border-radius: ${borderRadius.md};
        `;
      case 'lg':
        return `
          height: 3.25rem;
          padding: 0 ${theme.spacing.xl};
          border-radius: ${borderRadius.lg};
        `;
    }
  }}

  ${({ $size }) =>
    text({
      size: $size === 'lg' ? 'lg' : $size === 'sm' ? 'sm' : 'md',
      weight: 'semibold',
    })}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;
