import { describe, it, expect } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import MyQuizStats from './MyQuizStats';
import type { MyQuizzesAggregate } from '@/types';

const FULL_STATS: MyQuizzesAggregate = {
  totalQuizCount: 12,
  totalPlayCount: 10739,
  totalShareCount: 305,
  totalStarCount: 88,
  totalCommentCount: 47,
  weeklyPlayCount: 1204,
  avgCorrectRate: 72,
};

describe('MyQuizStats', () => {
  describe('displayName', () => {
    it('displayName 이 "MyQuizStats" 이다', () => {
      expect(MyQuizStats.displayName).toBe('MyQuizStats');
    });
  });

  describe('aria-label section', () => {
    it('"내가 만든 퀴즈 통계" region 이 하나 렌더된다', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
      expect(screen.getByRole('region', { name: '내가 만든 퀴즈 통계' })).toBeInTheDocument();
    });
  });

  describe('강조 카드 — 이번 주 플레이', () => {
    it('"이번 주 플레이" 라벨이 렌더된다', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
      expect(screen.getByLabelText('이번 주 플레이')).toBeInTheDocument();
    });

    it('"이번 주 플레이" 텍스트 라벨이 보인다', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
      expect(screen.getByText('이번 주 플레이')).toBeInTheDocument();
    });
  });

  describe('grid — 6개 listitem', () => {
    it('ul 안에 listitem 이 정확히 6개다', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
      expect(screen.getAllByRole('listitem')).toHaveLength(6);
    });
  });

  describe('stats 있을 때 — 라벨 노출', () => {
    it.each([['퀴즈'], ['플레이'], ['스타'], ['댓글'], ['공유'], ['평균 정답률']])(
      '"%s" 라벨이 렌더된다',
      (label) => {
        renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
        expect(screen.getByText(label)).toBeInTheDocument();
      },
    );
  });

  describe('stats 있을 때 — 값 포맷 (ko-KR 천 단위 콤마)', () => {
    it('totalQuizCount: 12 → "12"', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
      expect(screen.getByText((12).toLocaleString('ko-KR'))).toBeInTheDocument();
    });

    it('totalPlayCount: 10739 → "10,739"', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
      expect(screen.getByText((10739).toLocaleString('ko-KR'))).toBeInTheDocument();
    });

    it('totalStarCount: 88 → "88"', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
      expect(screen.getByText((88).toLocaleString('ko-KR'))).toBeInTheDocument();
    });

    it('totalCommentCount: 47 → "47"', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
      expect(screen.getByText((47).toLocaleString('ko-KR'))).toBeInTheDocument();
    });

    it('totalShareCount: 305 → "305"', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
      expect(screen.getByText((305).toLocaleString('ko-KR'))).toBeInTheDocument();
    });
  });

  describe('weekly count — + prefix 포맷', () => {
    it('weeklyPlayCount=1204 → "+1,204"', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
      expect(screen.getByText(`+${(1204).toLocaleString('ko-KR')}`)).toBeInTheDocument();
    });

    it('weeklyPlayCount=0 → "+0"', () => {
      renderWithTheme(<MyQuizStats stats={{ ...FULL_STATS, weeklyPlayCount: 0 }} />);
      expect(screen.getByText('+0')).toBeInTheDocument();
    });

    it('큰 수 weeklyPlayCount=1000000 → "+1,000,000"', () => {
      renderWithTheme(<MyQuizStats stats={{ ...FULL_STATS, weeklyPlayCount: 1_000_000 }} />);
      expect(screen.getByText(`+${(1_000_000).toLocaleString('ko-KR')}`)).toBeInTheDocument();
    });
  });

  describe('증감률 (delta) — toFixed(1) 검증', () => {
    // 증감률 텍스트는 ArrowUpIcon + 숫자% 형태. 텍스트 매치는 숫자 부분만으로.
    it('weeklyPlayCount=1204, totalPlayCount=10000 → "12.0%"', () => {
      renderWithTheme(
        <MyQuizStats stats={{ ...FULL_STATS, weeklyPlayCount: 1204, totalPlayCount: 10000 }} />,
      );
      expect(screen.getByText('12.0%')).toBeInTheDocument();
    });

    it('weeklyPlayCount=1204, totalPlayCount=10739 → "11.2%"', () => {
      // 1204 / 10739 * 100 = 11.2116... → toFixed(1) = "11.2"
      renderWithTheme(<MyQuizStats stats={FULL_STATS} />);
      expect(screen.getByText('11.2%')).toBeInTheDocument();
    });

    it('weeklyPlayCount=0, totalPlayCount=100 → "0.0%"', () => {
      renderWithTheme(
        <MyQuizStats stats={{ ...FULL_STATS, weeklyPlayCount: 0, totalPlayCount: 100 }} />,
      );
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
  });

  describe('증감률 미노출 케이스', () => {
    // 증감률 텍스트는 소수 한 자리 % 패턴 (avg 정답률은 Math.round 정수라 충돌 X)
    const DECIMAL_PERCENT = /^\d+\.\d+%$/;

    it('totalPlayCount=0 이면 증감률이 렌더되지 않는다', () => {
      renderWithTheme(
        <MyQuizStats stats={{ ...FULL_STATS, weeklyPlayCount: 0, totalPlayCount: 0 }} />,
      );
      expect(screen.queryByText(DECIMAL_PERCENT)).not.toBeInTheDocument();
    });

    it('isLoading=true 이면 증감률이 렌더되지 않는다', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} isLoading={true} />);
      expect(screen.queryByText(DECIMAL_PERCENT)).not.toBeInTheDocument();
    });

    it('stats=undefined 이면 증감률이 렌더되지 않는다', () => {
      renderWithTheme(<MyQuizStats stats={undefined} />);
      expect(screen.queryByText(DECIMAL_PERCENT)).not.toBeInTheDocument();
    });
  });

  describe('평균 정답률 — formatRate 검증', () => {
    it('avgCorrectRate=72 → "72%"', () => {
      renderWithTheme(<MyQuizStats stats={{ ...FULL_STATS, avgCorrectRate: 72 }} />);
      expect(screen.getByText('72%')).toBeInTheDocument();
    });

    it('avgCorrectRate=72.5 → "73%" (Math.round)', () => {
      renderWithTheme(<MyQuizStats stats={{ ...FULL_STATS, avgCorrectRate: 72.5 }} />);
      expect(screen.getByText('73%')).toBeInTheDocument();
    });

    it('avgCorrectRate=0 → "0%"', () => {
      renderWithTheme(<MyQuizStats stats={{ ...FULL_STATS, avgCorrectRate: 0 }} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('avgCorrectRate=100 → "100%"', () => {
      renderWithTheme(<MyQuizStats stats={{ ...FULL_STATS, avgCorrectRate: 100 }} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('avgCorrectRate=null → "—"', () => {
      renderWithTheme(<MyQuizStats stats={{ ...FULL_STATS, avgCorrectRate: null }} />);
      // null이면 — 가 포함되어야 함 (weekly도 값 있으므로 "—"는 이 셀 하나)
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });

    it('avgCorrectRate=undefined → "—"', () => {
      const statsWithoutRate: MyQuizzesAggregate = {
        totalQuizCount: FULL_STATS.totalQuizCount,
        totalPlayCount: FULL_STATS.totalPlayCount,
        totalShareCount: FULL_STATS.totalShareCount,
        totalStarCount: FULL_STATS.totalStarCount,
        totalCommentCount: FULL_STATS.totalCommentCount,
        weeklyPlayCount: FULL_STATS.weeklyPlayCount,
        avgCorrectRate: undefined,
      };
      renderWithTheme(<MyQuizStats stats={statsWithoutRate} />);
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('placeholder 상태 — isLoading=true', () => {
    it('weekly + 6 cell 모두 "—" → 총 7개', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} isLoading={true} />);
      expect(screen.getAllByText('—')).toHaveLength(7);
    });

    it('"+—" 는 렌더되지 않는다', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} isLoading={true} />);
      expect(screen.queryByText('+—')).not.toBeInTheDocument();
    });

    it('실제 숫자 값이 DOM 에 없다', () => {
      renderWithTheme(<MyQuizStats stats={FULL_STATS} isLoading={true} />);
      expect(screen.queryByText((10739).toLocaleString('ko-KR'))).not.toBeInTheDocument();
    });
  });

  describe('placeholder 상태 — stats=undefined', () => {
    it('weekly + 6 cell 모두 "—" → 총 7개', () => {
      renderWithTheme(<MyQuizStats stats={undefined} />);
      expect(screen.getAllByText('—')).toHaveLength(7);
    });

    it('"+—" 는 렌더되지 않는다', () => {
      renderWithTheme(<MyQuizStats stats={undefined} />);
      expect(screen.queryByText('+—')).not.toBeInTheDocument();
    });

    it('listitem 은 여전히 6개다', () => {
      renderWithTheme(<MyQuizStats stats={undefined} />);
      expect(screen.getAllByRole('listitem')).toHaveLength(6);
    });
  });

  describe('placeholder 상태 — stats=undefined + isLoading=true 조합', () => {
    it('weekly + 6 cell 모두 "—" → 총 7개', () => {
      renderWithTheme(<MyQuizStats stats={undefined} isLoading={true} />);
      expect(screen.getAllByText('—')).toHaveLength(7);
    });
  });
});
