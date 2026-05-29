import { memo, useState } from 'react';
import Button from '@/components/button';
import {
  COUNT_OPTIONS,
  MIN_QUESTIONS_FOR_COUNT_OPTIONS,
  TIME_LIMIT_OPTIONS,
  type CountOption,
  type QuizPlayOptionsProps,
  type TimeLimitOption,
} from './QuizPlayOptions.type';
import {
  cardStyle,
  countCardStyle,
  countFewNoticeBoxStyle,
  countFewNoticeTextStyle,
  countFewNoticeTotalStyle,
  countGridStyle,
  sectionCaptionStyle,
  sectionHeaderStyle,
  sectionLabelStyle,
  sectionStyle,
  timeDotStyle,
  timeDotWrapStyle,
  timeLabelStyle,
  timeRowStyle,
} from './QuizPlayOptions.style';

const formatTimeLabel = (sec: TimeLimitOption): string => (sec === null ? '타이머 X' : `${sec}초`);

const QuizPlayOptions = memo(({ questionCount, onStart }: QuizPlayOptionsProps) => {
  const [time, setTime] = useState<TimeLimitOption>(null);
  const [count, setCount] = useState<CountOption>(10);

  const isFew = questionCount > 0 && questionCount < MIN_QUESTIONS_FOR_COUNT_OPTIONS;
  const effectiveCount = isFew ? questionCount : count;
  const shuffle = !isFew;

  const handleStart = () => {
    onStart({ count: effectiveCount, timeLimitSec: time, shuffle });
  };

  return (
    <section css={cardStyle}>
      <div css={sectionStyle}>
        <header css={sectionHeaderStyle}>
          <h3 css={sectionLabelStyle}>문항당 시간</h3>
        </header>
        <div css={timeRowStyle} role="radiogroup" aria-label="문항당 시간">
          {TIME_LIMIT_OPTIONS.map((sec) => {
            const selected = sec === time;
            return (
              <button
                key={String(sec)}
                type="button"
                role="radio"
                aria-checked={selected}
                css={timeDotWrapStyle}
                onClick={() => setTime(sec)}
              >
                <span css={timeDotStyle(selected)} aria-hidden />
                <span css={timeLabelStyle(selected)}>{formatTimeLabel(sec)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div css={sectionStyle}>
        <header css={sectionHeaderStyle}>
          <h3 css={sectionLabelStyle}>풀이 개수</h3>
          {!isFew && (
            <span css={sectionCaptionStyle}>전체 문항 {questionCount}개 중에서 무작위 출제</span>
          )}
        </header>

        {isFew ? (
          <div css={countFewNoticeBoxStyle} role="status" aria-live="polite">
            <span css={countFewNoticeTextStyle}>전체 문항이 적어 모든 문제를 풀어요.</span>
            <span css={countFewNoticeTotalStyle}>총 {questionCount}문제</span>
          </div>
        ) : (
          <div css={countGridStyle} role="radiogroup" aria-label="풀이 개수">
            {COUNT_OPTIONS.map((n) => {
              const disabled = n > questionCount;
              const selected = n === count;
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={disabled}
                  css={countCardStyle(selected, disabled)}
                  onClick={() => setCount(n)}
                >
                  {n} 문제
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Button fullWidth onClick={handleStart} disabled={questionCount === 0}>
        {Math.min(effectiveCount, Math.max(1, questionCount))}문제 풀기 시작 →
      </Button>
    </section>
  );
});

QuizPlayOptions.displayName = 'QuizPlayOptions';
export default QuizPlayOptions;
