import type { InputProps } from './Input.type';
import { InputWrapper, Label, StyledInput, ErrorMessage } from './Input.style';
import { memo } from 'react';

const Input = memo(
  ({ value, onChange, placeholder, disabled = false, error, label, type = 'text' }: InputProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <InputWrapper>
        {label && <Label>{label}</Label>}
        <StyledInput
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          $hasError={!!error}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </InputWrapper>
    );
  },
);

Input.displayName = 'Input';
export default Input;
