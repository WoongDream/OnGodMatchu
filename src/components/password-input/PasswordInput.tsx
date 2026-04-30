import { memo, useEffect, useId, useMemo, useState } from 'react';
import { evaluateStrength } from '@/lib/password';
import type { PasswordInputProps } from './PasswordInput.type';
import {
  Wrapper,
  Label,
  InputBox,
  StyledInput,
  ToggleButton,
  ErrorMessage,
} from './PasswordInput.style';
import StrengthMeter from './StrengthMeter';
import RuleChecklist from './RuleChecklist';
import EyeIcon from './icons/EyeIcon';
import EyeOffIcon from './icons/EyeOffIcon';

const PasswordInput = memo(
  ({
    value,
    onChange,
    onStrengthChange,
    label,
    placeholder,
    disabled = false,
    error,
    ruleStatus,
    showStrengthMeter = true,
    showChecklist = true,
    userInputs,
  }: PasswordInputProps) => {
    const [revealed, setRevealed] = useState(false);
    const inputId = useId();

    const strength = useMemo(() => evaluateStrength(value, userInputs ?? []), [value, userInputs]);

    useEffect(() => {
      onStrengthChange?.(strength);
    }, [strength, onStrengthChange]);

    const feedbackText =
      strength.score < 2 ? strength.feedbackWarning || strength.feedbackSuggestions[0] || '' : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const handleToggleClick = () => {
      setRevealed((prev) => !prev);
    };

    return (
      <Wrapper>
        {label && <Label htmlFor={inputId}>{label}</Label>}
        <InputBox>
          <StyledInput
            id={inputId}
            type={revealed ? 'text' : 'password'}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            $hasError={!!error}
            autoComplete="new-password"
            maxLength={64}
          />
          <ToggleButton
            type="button"
            onClick={handleToggleClick}
            disabled={disabled}
            aria-pressed={revealed}
            aria-label={revealed ? '비밀번호 숨기기' : '비밀번호 표시'}
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </ToggleButton>
        </InputBox>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {showStrengthMeter && value.length > 0 && (
          <StrengthMeter
            score={strength.score}
            crackTimesDisplay={strength.crackTimesDisplay}
            feedbackText={feedbackText}
          />
        )}
        {showChecklist && <RuleChecklist ruleStatus={ruleStatus} />}
      </Wrapper>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
