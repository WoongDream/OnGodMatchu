import { memo, useEffect, useRef } from 'react';
import { SendIcon } from '@/components/icon';
import { formStyle, inputStyle, submitButtonStyle, wrapperStyle } from './QuizAnswer.style';

type QuizAnswerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  /** 변경되면 input 으로 focus 재이동 (예: 문항 인덱스 + phase 조합) */
  focusKey?: string | number;
};

const QuizAnswer = memo(
  ({ value, onChange, onSubmit, disabled = false, focusKey }: QuizAnswerProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (disabled) {
        return;
      }
      inputRef.current?.focus();
    }, [disabled, focusKey]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (disabled) {
        return;
      }
      onSubmit();
    };

    const submitDisabled = disabled || value.trim() === '';

    return (
      <div css={wrapperStyle}>
        <form css={formStyle} onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            css={inputStyle}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="정답을 입력하고 enter"
            disabled={disabled}
          />
          <button type="submit" css={submitButtonStyle} disabled={submitDisabled} aria-label="제출">
            <SendIcon size={20} aria-hidden />
          </button>
        </form>
      </div>
    );
  },
);

QuizAnswer.displayName = 'QuizAnswer';
export default QuizAnswer;
