import { memo, useMemo } from 'react';
import Modal from '@/components/modal/Modal';
import useMonthlyUserStats from '@/hooks/useMonthlyUserStats';
import type { MonthlyUserStat } from '@/api/admin';
import {
  barColumnStyle,
  barFillStyle,
  barLabelStyle,
  barValueStyle,
  chartStyle,
  churnStyle,
  emptyStyle,
  listHeaderStyle,
  listRowStyle,
  listStyle,
  monthCellStyle,
  newStyle,
  subtitleStyle,
} from './MonthlyUserStatsModal.style';

type Props = { isOpen: boolean; onClose: () => void };

const chartLabel = (yearMonth: string): string =>
  `${yearMonth.slice(0, 4)}.${Number(yearMonth.slice(5, 7))}`;

const listLabel = (yearMonth: string): string =>
  `${yearMonth.slice(0, 4)}년 ${Number(yearMonth.slice(5, 7))}월`;

const formatK = (n: number): string => (n >= 1000 ? `${(n / 1000).toFixed(2)}K` : String(n));

const MonthlyUserStatsModal = memo(({ isOpen, onClose }: Props) => {
  // 차트는 최근 6개월, 하단 리스트는 전체 기간(스크롤). BE months 상한은 24.
  const { stats, isLoading } = useMonthlyUserStats(isOpen, 24);
  const ordered = useMemo<MonthlyUserStat[]>(() => stats ?? [], [stats]);
  const chartData = useMemo(() => ordered.slice(-6), [ordered]);

  const { min, max } = useMemo(() => {
    if (chartData.length === 0) {
      return { min: 0, max: 1 };
    }
    const values = chartData.map((s) => s.cumulative);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [chartData]);

  const barHeight = (value: number): number => {
    if (max === min) {
      return 100;
    }
    return 30 + ((value - min) / (max - min)) * 70;
  };

  // 리스트는 첫 활동(누적>0) 월부터 현재까지 — 서비스 시작 전 0 월 노이즈 제거, 기록이 쌓이면 자연히 스크롤.
  const listMonths = useMemo(() => {
    const firstActive = ordered.findIndex((s) => s.cumulative > 0);
    return firstActive === -1 ? ordered.slice(-1) : ordered.slice(firstActive);
  }, [ordered]);
  const reversed = useMemo(() => [...listMonths].reverse(), [listMonths]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="월별 유저 수" size="lg">
      <p css={subtitleStyle}>최근 6개월 누적 가입 유저 추이</p>

      {ordered.length === 0 ? (
        <p css={emptyStyle}>{isLoading ? '불러오는 중...' : '데이터가 없어요.'}</p>
      ) : (
        <>
          <div css={chartStyle}>
            {chartData.map((s, i) => {
              const isCurrent = i === chartData.length - 1;
              return (
                <div key={s.yearMonth} css={barColumnStyle}>
                  <span css={barValueStyle}>{formatK(s.cumulative)}</span>
                  <div css={(theme) => barFillStyle(theme, barHeight(s.cumulative), isCurrent)} />
                  <span css={(theme) => barLabelStyle(theme, isCurrent)}>
                    {chartLabel(s.yearMonth)}
                  </span>
                </div>
              );
            })}
          </div>

          <div css={listStyle}>
            <div css={listHeaderStyle}>
              <span>월</span>
              <span>누적 유저</span>
              <span>신규</span>
              <span>이탈</span>
            </div>
            {reversed.map((s, i) => (
              <div key={s.yearMonth} css={(theme) => listRowStyle(theme, i === 0)}>
                <span css={monthCellStyle}>
                  {listLabel(s.yearMonth)}
                  {i === 0 ? ' · 이번 달' : ''}
                </span>
                <span>{s.cumulative.toLocaleString()}</span>
                <span css={newStyle}>+{s.newCount.toLocaleString()}</span>
                <span css={churnStyle}>-{s.churnCount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
});

MonthlyUserStatsModal.displayName = 'MonthlyUserStatsModal';
export default MonthlyUserStatsModal;
