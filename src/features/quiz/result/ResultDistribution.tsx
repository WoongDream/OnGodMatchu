import { memo } from 'react';
import { PlayIcon } from '@/components/icon';
import { formatCount } from '@/lib/format/count';
import type { QuizScoreDistribution } from '@/types';
import {
  badgeSlotStyle,
  barColumnStyle,
  barFillStyle,
  barLabelStyle,
  barTrackStyle,
  chartStyle,
  footerHighlightStyle,
  footerStyle,
  metaStyle,
  myBadgeStyle,
  titleStyle,
  topRowStyle,
  wrapperStyle,
} from './ResultDistribution.style';

type ResultDistributionProps = {
  data: QuizScoreDistribution;
  myScore: number;
  /** topPercentile 응답 (0~100). 푸터 안내문 노출용. null 이면 푸터 미노출 */
  topPercentile: number | null;
};

const ResultDistribution = memo(({ data, myScore, topPercentile }: ResultDistributionProps) => {
  const { totalAttempts, averageScore, distribution } = data;
  const maxCount = distribution.reduce((m, d) => (d.count > m ? d.count : m), 0);

  return (
    <section css={wrapperStyle} aria-label="점수 분포">
      <div css={topRowStyle}>
        <h3 css={titleStyle}>점수 분포</h3>
        <div css={metaStyle}>
          <span>평균 {averageScore.toFixed(1)}점</span>
          <span>
            <PlayIcon size={14} aria-hidden /> {formatCount(totalAttempts)}명
          </span>
        </div>
      </div>

      <div css={chartStyle} role="list" aria-label="점수별 응시자 수">
        {distribution.map((d) => {
          const isMine = d.score === myScore;
          const heightPercent = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
          return (
            <div
              key={d.score}
              css={barColumnStyle}
              role="listitem"
              aria-label={`${d.score}점 ${d.count}명${isMine ? ' (내 점수)' : ''}`}
            >
              <div css={badgeSlotStyle}>
                {isMine && <span css={myBadgeStyle}>내 점수 {d.score}</span>}
              </div>
              <div css={barTrackStyle}>
                <div css={barFillStyle(heightPercent, isMine)} />
              </div>
              <span css={barLabelStyle(isMine)}>{d.score}</span>
            </div>
          );
        })}
      </div>

      {topPercentile !== null && (
        <p css={footerStyle}>
          총 응시자 중 <span css={footerHighlightStyle}>상위 {Math.round(topPercentile)}%</span>의
          점수에요.
        </p>
      )}
    </section>
  );
});

ResultDistribution.displayName = 'ResultDistribution';
export default ResultDistribution;
