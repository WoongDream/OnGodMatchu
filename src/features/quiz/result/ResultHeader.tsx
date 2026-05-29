import { memo } from 'react';
import Badge from '@/components/badge';
import {
  wrapperStyle,
  circleWrapperStyle,
  svgStyle,
  trackStyle,
  progressStyle,
  circleCenterStyle,
  percentNumberStyle,
  percentLabelStyle,
  rightStyle,
  captionStyle,
  titleStyle,
  titleHighlightStyle,
} from './ResultHeader.style';

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type ResultHeaderProps = {
  score: number;
  totalQuestions: number;
  topPercentile: number | null;
};

const ResultHeader = memo(({ score, totalQuestions, topPercentile }: ResultHeaderProps) => {
  const percent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const ratio = Math.min(1, Math.max(0, percent / 100));
  const dashOffset = CIRCUMFERENCE * (1 - ratio);

  return (
    <section css={wrapperStyle} aria-label="퀴즈 결과 요약">
      <div css={circleWrapperStyle} role="img" aria-label={`정답률 ${percent}%`}>
        <svg css={svgStyle} viewBox="0 0 96 96">
          <circle css={trackStyle} cx="48" cy="48" r={RADIUS} />
          <circle
            css={progressStyle}
            cx="48"
            cy="48"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div css={circleCenterStyle}>
          <span css={percentNumberStyle}>{percent}</span>
          <span css={percentLabelStyle}>정답률 %</span>
        </div>
      </div>

      <div css={rightStyle}>
        <span css={captionStyle}>퀴즈 결과</span>
        <h2 css={titleStyle}>
          전체 <span css={titleHighlightStyle}>{totalQuestions}</span> 문제 중
          <br />
          <span css={titleHighlightStyle}>{score}</span>문제 정답!
        </h2>
        {topPercentile !== null && (
          <Badge variant="info">▲ 상위 {Math.round(topPercentile)} %</Badge>
        )}
      </div>
    </section>
  );
});

ResultHeader.displayName = 'ResultHeader';
export default ResultHeader;
