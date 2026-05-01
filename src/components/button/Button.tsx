import { memo } from 'react';
import type { ButtonProps } from './Button.type';
import { buttonStyle } from './Button.style';

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
      <button
        css={buttonStyle(variant, size, fullWidth)}
        disabled={disabled}
        onClick={onClick}
        type={type}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
