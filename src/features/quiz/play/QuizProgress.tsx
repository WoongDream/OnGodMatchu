import { memo, type ReactNode } from 'react';
import {
  wrapperStyle,
  topRowStyle,
  labelStyle,
  currentStyle,
  barStyle,
  fillStyle,
} from './QuizProgress.style';

type QuizProgressProps = {
  current: number;
  total: number;
  /** 우상단 슬롯 (예: 타이머). null 이면 라벨만 마운트. */
  trailing?: ReactNode;
};

const QuizProgress = memo(({ current, total, trailing }: QuizProgressProps) => {
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div css={wrapperStyle}>
      <div css={topRowStyle}>
        <span css={labelStyle}>
          <span css={currentStyle}>{current}</span>
          {' / '}
          {total}
        </span>
        {trailing}
      </div>
      <div css={barStyle}>
        <div css={fillStyle(percent)} />
      </div>
    </div>
  );
});

QuizProgress.displayName = 'QuizProgress';
export default QuizProgress;
