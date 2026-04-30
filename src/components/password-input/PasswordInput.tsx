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
  HintBox,
  HintTitle,
  HintList,
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
    showHint = true,
    userInputs,
  }: PasswordInputProps) => {
    const [revealed, setRevealed] = useState(false);
    const inputId = useId();

    const strength = useMemo(() => evaluateStrength(value, userInputs ?? []), [value, userInputs]);

    useEffect(() => {
      onStrengthChange?.(strength);
    }, [strength, onStrengthChange]);

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
          <StrengthMeter score={strength.score} crackTimesDisplay={strength.crackTimesDisplay} />
        )}
        {showChecklist && <RuleChecklist ruleStatus={ruleStatus} />}
        {showHint && (
          <HintBox>
            <HintTitle>💡 안전한 비밀번호 만들기 팁</HintTitle>
            <HintList>
              <li>10자 이상의 길이가 가장 중요해요</li>
              <li>특수문자보다는 길이가 보안에 더 효과적이에요</li>
              <li>예: &quot;내고양이는오늘도잠만잔다&quot; 같은 문장도 좋아요</li>
              <li>다른 사이트와 동일한 비밀번호는 피해주세요</li>
            </HintList>
          </HintBox>
        )}
      </Wrapper>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
