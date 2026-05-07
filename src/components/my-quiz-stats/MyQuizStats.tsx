import { memo, type ComponentType } from 'react';
import {
  QuizIcon,
  PlayIcon,
  StarIcon,
  CommentIcon,
  ShareIcon,
  AccuracyIcon,
  TrendingUpIcon,
  ArrowUpIcon,
  type IconProps,
} from '@/components/icon';
import type { MyQuizStatsProps } from './MyQuizStats.type';
import {
  wrapperStyle,
  highlightCardStyle,
  highlightHeaderStyle,
  highlightLabelStyle,
  highlightValueRowStyle,
  highlightValueStyle,
  highlightDeltaStyle,
  gridStyle,
  cellStyle,
  cellHeaderStyle,
  cellLabelStyle,
  cellValueStyle,
} from './MyQuizStats.style';

const formatNumber = (n: number): string => n.toLocaleString('ko-KR');

const formatRate = (rate: number | null | undefined): string =>
  rate === null || rate === undefined ? '—' : `${Math.round(rate)}%`;

type Cell = {
  key: string;
  label: string;
  value: string;
  Icon: ComponentType<IconProps>;
};

const MyQuizStats = memo(({ stats, isLoading = false }: MyQuizStatsProps) => {
  const placeholder = isLoading || !stats;

  const weekly = placeholder ? '—' : `+${formatNumber(stats.weeklyPlayCount)}`;
  const delta =
    placeholder || stats.totalPlayCount === 0
      ? null
      : `${((stats.weeklyPlayCount / stats.totalPlayCount) * 100).toFixed(1)}%`;

  const cells: Cell[] = [
    {
      key: 'totalQuiz',
      label: '퀴즈',
      value: placeholder ? '—' : formatNumber(stats.totalQuizCount),
      Icon: QuizIcon,
    },
    {
      key: 'totalPlay',
      label: '플레이',
      value: placeholder ? '—' : formatNumber(stats.totalPlayCount),
      Icon: PlayIcon,
    },
    {
      key: 'totalStar',
      label: '스타',
      value: placeholder ? '—' : formatNumber(stats.totalStarCount),
      Icon: StarIcon,
    },
    {
      key: 'totalComment',
      label: '댓글',
      value: placeholder ? '—' : formatNumber(stats.totalCommentCount),
      Icon: CommentIcon,
    },
    {
      key: 'totalShare',
      label: '공유',
      value: placeholder ? '—' : formatNumber(stats.totalShareCount),
      Icon: ShareIcon,
    },
    {
      key: 'avgCorrectRate',
      label: '평균 정답률',
      value: placeholder ? '—' : formatRate(stats.avgCorrectRate),
      Icon: AccuracyIcon,
    },
  ];

  return (
    <section css={wrapperStyle} aria-label="내가 만든 퀴즈 통계">
      <div css={highlightCardStyle} aria-label="이번 주 플레이">
        <div css={highlightHeaderStyle}>
          <TrendingUpIcon size={20} />
          <span css={highlightLabelStyle}>이번 주 플레이</span>
        </div>
        <div css={highlightValueRowStyle}>
          <strong css={highlightValueStyle}>{weekly}</strong>
          {delta && (
            <span css={highlightDeltaStyle}>
              <ArrowUpIcon size={18} />
              {delta}
            </span>
          )}
        </div>
      </div>
      <ul css={gridStyle}>
        {cells.map(({ key, label, value, Icon }) => (
          <li key={key} css={cellStyle}>
            <div css={cellHeaderStyle}>
              <Icon size={18} />
              <span css={cellLabelStyle}>{label}</span>
            </div>
            <span css={cellValueStyle}>{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
});

MyQuizStats.displayName = 'MyQuizStats';
export default MyQuizStats;
