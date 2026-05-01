import { memo } from 'react';
import type { InputProps } from './Input.type';
import {
  wrapperStyle,
  labelRowStyle,
  labelStyle,
  inputStyle,
  errorMessageStyle,
} from './Input.style';

const Input = memo(
  ({
    value,
    onChange,
    placeholder,
    disabled = false,
    error,
    label,
    labelTrailing,
    type = 'text',
  }: InputProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <div css={wrapperStyle}>
        {label && (
          <div css={labelRowStyle}>
            <label css={labelStyle}>{label}</label>
            {labelTrailing}
          </div>
        )}
        <input
          css={inputStyle(!!error)}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
        />
        {error && <span css={errorMessageStyle}>{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
