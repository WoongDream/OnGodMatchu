import { memo } from 'react';
import { wrapperStyle, svgStyle, trackStyle, progressStyle, labelStyle } from './QuizTimer.style';

const RADIUS = 13;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CRITICAL_THRESHOLD_SEC = 3;

type QuizTimerProps = {
  /** 남은 시간(초) — 0 이상. */
  remainingSec: number;
  /** 문항당 전체 시간(초) — progress 비율 계산용. */
  totalSec: number;
};

const QuizTimer = memo(({ remainingSec, totalSec }: QuizTimerProps) => {
  const safeRemaining = Math.max(0, remainingSec);
  const ratio = totalSec > 0 ? Math.min(1, safeRemaining / totalSec) : 0;
  const dashOffset = CIRCUMFERENCE * (1 - ratio);
  const isCritical = safeRemaining <= CRITICAL_THRESHOLD_SEC;

  return (
    <div css={wrapperStyle} role="timer" aria-label={`남은 시간 ${safeRemaining}초`}>
      <svg css={svgStyle} viewBox="0 0 32 32">
        <circle css={trackStyle} cx="16" cy="16" r={RADIUS} />
        <circle
          css={progressStyle(isCritical)}
          cx="16"
          cy="16"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span css={labelStyle(isCritical)}>{safeRemaining}</span>
    </div>
  );
});

QuizTimer.displayName = 'QuizTimer';
export default QuizTimer;
