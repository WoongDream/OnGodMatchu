import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import type { MonthlyUserStat } from '@/api/admin';
import type { UseMonthlyUserStatsReturn } from '@/hooks/useMonthlyUserStats';
import MonthlyUserStatsModal from './MonthlyUserStatsModal';

// ── useMonthlyUserStats mock ──────────────────────────────────────────────────
const mockUseMonthlyUserStats = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useMonthlyUserStats', () => ({
  default: (enabled: boolean, months?: number) => mockUseMonthlyUserStats(enabled, months),
}));

const setHook = (value: Partial<UseMonthlyUserStatsReturn>) => {
  mockUseMonthlyUserStats.mockReturnValue({
    stats: undefined,
    isLoading: false,
    error: null,
    ...value,
  });
};

const STATS: MonthlyUserStat[] = [
  { yearMonth: '2024-01', cumulative: 100, newCount: 100, churnCount: 0 },
  { yearMonth: '2024-02', cumulative: 1200, newCount: 1100, churnCount: 5 },
];

describe('MonthlyUserStatsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setHook({ stats: STATS });
  });

  describe('open/close', () => {
    it('isOpen=false 면 dialog 가 렌더되지 않는다', () => {
      renderWithTheme(<MonthlyUserStatsModal isOpen={false} onClose={vi.fn()} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('isOpen=true 면 제목/부제가 렌더된다', () => {
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('최근 6개월 누적 가입 유저 추이')).toBeInTheDocument();
    });

    it('useMonthlyUserStats 가 (isOpen, 6) 으로 호출된다', () => {
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      expect(mockUseMonthlyUserStats).toHaveBeenCalledWith(true, 6);
    });
  });

  describe('빈 상태 / 로딩', () => {
    it('stats 가 비어 있고 로딩 중이면 "불러오는 중..." 이 렌더된다', () => {
      setHook({ stats: [], isLoading: true });
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
    });

    it('stats 가 비어 있고 로딩이 끝나면 "데이터가 없어요." 가 렌더된다', () => {
      setHook({ stats: [], isLoading: false });
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      expect(screen.getByText('데이터가 없어요.')).toBeInTheDocument();
    });

    it('stats=undefined 이어도 빈 상태로 처리된다', () => {
      setHook({ stats: undefined, isLoading: false });
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      expect(screen.getByText('데이터가 없어요.')).toBeInTheDocument();
    });
  });

  describe('데이터 렌더 — 라벨 포맷', () => {
    it("차트 라벨이 'YYYY.M' 형식으로 렌더된다", () => {
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      expect(screen.getByText('2024.1')).toBeInTheDocument();
      expect(screen.getByText('2024.2')).toBeInTheDocument();
    });

    it("리스트 라벨이 'YYYY년 M월' 형식으로 렌더된다", () => {
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      // 리스트는 역순(최신 먼저) — 최신 달엔 ' · 이번 달' 이 붙는다.
      expect(screen.getByText(/2024년 2월/)).toBeInTheDocument();
      expect(screen.getByText('2024년 1월')).toBeInTheDocument();
    });

    it('최신 달(리스트 첫 행)에 "· 이번 달" 이 표시된다', () => {
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      expect(screen.getByText(/2024년 2월 · 이번 달/)).toBeInTheDocument();
    });

    it('차트 막대 값이 K 단축 표기된다 (1200 → "1.20K")', () => {
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      expect(screen.getByText('1.20K')).toBeInTheDocument();
    });

    it('1000 미만 값은 그대로 표기된다 (100 → "100")', () => {
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      // 차트 막대 값 + 리스트 누적값에 동시에 나타날 수 있으므로 존재만 확인.
      expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    });

    it('신규/이탈 값이 +/- 부호와 함께 렌더된다', () => {
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      expect(screen.getByText('+1,100')).toBeInTheDocument();
      expect(screen.getByText('-5')).toBeInTheDocument();
    });

    it('리스트 헤더 컬럼이 렌더된다', () => {
      renderWithTheme(<MonthlyUserStatsModal isOpen onClose={vi.fn()} />);
      expect(screen.getByText('월')).toBeInTheDocument();
      expect(screen.getByText('누적 유저')).toBeInTheDocument();
      expect(screen.getByText('신규')).toBeInTheDocument();
      expect(screen.getByText('이탈')).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('displayName 이 "MonthlyUserStatsModal" 이다', () => {
      expect(MonthlyUserStatsModal.displayName).toBe('MonthlyUserStatsModal');
    });
  });
});
