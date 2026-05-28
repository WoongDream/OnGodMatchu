import { memo, useMemo } from 'react';
import { useTheme } from '@emotion/react';
import { formatCount } from '@/lib/format/count';
import { toPolylinePoints } from '@/lib/chart/sparkline';
import type { VisitorBlockProps } from './VisitorBlock.type';
import {
  SPARKLINE_HEIGHT,
  SPARKLINE_WIDTH,
  desktopOnlyStyle,
  labelStyle,
  rowStyle,
  sparklineSvgStyle,
  sparklineWrapperStyle,
  textStackStyle,
  todayValueStyle,
  totalValueStyle,
  wrapperStyle,
} from './VisitorBlock.style';

const VisitorBlock = memo(({ today, total, daily }: VisitorBlockProps) => {
  const theme = useTheme();

  const points = useMemo(() => toPolylinePoints(daily, SPARKLINE_WIDTH, SPARKLINE_HEIGHT), [daily]);

  return (
    <div css={wrapperStyle} aria-label="방문자 통계">
      <div css={textStackStyle}>
        <span css={rowStyle}>
          <span css={labelStyle}>TODAY</span>
          <span css={todayValueStyle}>{formatCount(today)}</span>
        </span>
        <span css={[rowStyle, desktopOnlyStyle]}>
          <span css={labelStyle}>TOTAL</span>
          <span css={totalValueStyle}>{formatCount(total)}</span>
        </span>
      </div>
      <div css={sparklineWrapperStyle} aria-hidden>
        {points ? (
          <svg
            css={sparklineSvgStyle}
            width={SPARKLINE_WIDTH}
            height={SPARKLINE_HEIGHT}
            viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
          >
            <polyline
              fill="none"
              stroke={theme.colors.accent.primary}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        ) : null}
      </div>
    </div>
  );
});

VisitorBlock.displayName = 'VisitorBlock';
export default VisitorBlock;
