import { memo } from 'react';
import Input from '@/components/input';
import { wrapperStyle } from './QuizAnswer.style';

type QuizAnswerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

const QuizAnswer = memo(({ value, onChange, onSubmit, disabled = false }: QuizAnswerProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !disabled) {
      onSubmit();
    }
  };

  return (
    <div css={wrapperStyle} onKeyDown={handleKeyDown}>
      <Input
        value={value}
        onChange={onChange}
        placeholder="정답을 입력하세요"
        disabled={disabled}
      />
    </div>
  );
});

QuizAnswer.displayName = 'QuizAnswer';
export default QuizAnswer;
