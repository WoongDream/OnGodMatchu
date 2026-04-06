import type { ButtonProps } from './Button.type';
import { StyledButton } from './Button.style';
import { memo } from 'react';

const Button = memo(
  ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    onClick,
    type = 'button',
    children,
  }: ButtonProps) => {
    return (
      <StyledButton
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        disabled={disabled}
        onClick={onClick}
        type={type}
      >
        {children}
      </StyledButton>
    );
  },
);

Button.displayName = 'Button';
export default Button;
