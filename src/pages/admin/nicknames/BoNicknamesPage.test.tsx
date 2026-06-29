import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { ForbiddenNickname, NicknameRuleStats } from '@/types';
import BoNicknamesPage from './BoNicknamesPage';

// ── IntersectionObserver polyfill (happy-dom 미구현) ─────────────────────────
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
    },
  );
});

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ── useBoNicknames mock ──────────────────────────────────────────────────────
const mockUseBoNicknames = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useBoNicknames', () => ({ default: mockUseBoNicknames }));

// ── useBoNicknameStats mock ──────────────────────────────────────────────────
const mockUseBoNicknameStats = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useBoNicknameStats', () => ({ default: mockUseBoNicknameStats }));

// ── useDebouncedValue mock (디바운스 타이밍 제거 — identity) ───────────────────
vi.mock('@/hooks/useDebouncedValue', () => ({ default: (v: unknown) => v }));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const MOCK_STATS: NicknameRuleStats = {
  total: 12,
  forbidden: 7,
  reserved: 5,
};

const makeItem = (id: number, overrides: Partial<ForbiddenNickname> = {}): ForbiddenNickname => ({
  id,
  value: `닉네임 ${id}`,
  normalizedValue: `nickname${id}`,
  type: 'FORBIDDEN',
  matchType: 'EXACT',
  reason: '사칭 우려',
  createdAt: '2025-03-15T09:00:00Z',
  ...overrides,
});

const DEFAULT_NICKNAMES_RETURN = {
  items: [] as ForbiddenNickname[],
  totalElements: 0,
  isLoading: false,
  isLoadingMore: false,
  hasNext: false,
  error: null,
  loadMore: vi.fn(),
  refresh: vi.fn(),
};

const DEFAULT_STATS_RETURN = {
  stats: MOCK_STATS,
  isLoading: false,
  error: null,
  refresh: vi.fn(),
};

const renderPage = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <BoNicknamesPage />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('BoNicknamesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBoNicknames.mockReturnValue(DEFAULT_NICKNAMES_RETURN);
    mockUseBoNicknameStats.mockReturnValue(DEFAULT_STATS_RETURN);
  });

  describe('통계 카드', () => {
    it('stats 3값(전체 규칙/금지/예약)이 표시된다', () => {
      renderPage();
      expect(screen.getByText('전체 규칙')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // total
      // '금지'/'예약' 라벨은 탭에도 있으므로 카드 라벨 존재만 확인 (다수 매칭)
      expect(screen.getAllByText('금지').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('예약').length).toBeGreaterThanOrEqual(1);
    });

    it('stats 가 undefined 면 0 으로 표시된다', () => {
      mockUseBoNicknameStats.mockReturnValue({ ...DEFAULT_STATS_RETURN, stats: undefined });
      renderPage();
      // 전체/금지/예약 카드 값 + 탭 카운트 모두 0
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('필터 탭', () => {
    it('필터 탭 3개가 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /^전체/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^금지/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^예약/ })).toBeInTheDocument();
    });

    it('초기 filter 는 ALL 로 useBoNicknames 가 호출된다', () => {
      renderPage();
      const lastCall = mockUseBoNicknames.mock.calls[mockUseBoNicknames.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ filter: 'ALL' });
    });

    it('"금지" 탭 클릭 시 filter=FORBIDDEN 로 재호출된다', () => {
      renderPage();
      // 탭 텍스트는 "금지 {n}" — name 이 /^금지/ 인 버튼이 곧 탭
      fireEvent.click(screen.getByRole('button', { name: /^금지/ }));
      const lastCall = mockUseBoNicknames.mock.calls[mockUseBoNicknames.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ filter: 'FORBIDDEN' });
    });

    it('"예약" 탭 클릭 시 filter=RESERVED 로 재호출된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /^예약/ }));
      const lastCall = mockUseBoNicknames.mock.calls[mockUseBoNicknames.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ filter: 'RESERVED' });
    });
  });

  describe('목록 행', () => {
    it('items 가 있으면 value·사유·등록일이 표시된다', () => {
      mockUseBoNicknames.mockReturnValue({
        ...DEFAULT_NICKNAMES_RETURN,
        items: [makeItem(1)],
        totalElements: 1,
      });
      renderPage();
      expect(screen.getByText('닉네임 1')).toBeInTheDocument();
      expect(screen.getByText('사칭 우려')).toBeInTheDocument();
      expect(screen.getByText('2025-03-15')).toBeInTheDocument(); // createdAt slice(0,10)
    });

    it('유형 배지가 렌더된다 (RESERVED → "예약")', () => {
      mockUseBoNicknames.mockReturnValue({
        ...DEFAULT_NICKNAMES_RETURN,
        items: [makeItem(1, { type: 'RESERVED' })],
        totalElements: 1,
      });
      renderPage();
      // "예약" 라벨은 탭에도 있으므로 2개 이상
      expect(screen.getAllByText('예약').length).toBeGreaterThanOrEqual(2);
    });

    it('matchType=PREFIX → "접두일치" 라벨이 표시된다', () => {
      mockUseBoNicknames.mockReturnValue({
        ...DEFAULT_NICKNAMES_RETURN,
        items: [makeItem(1, { matchType: 'PREFIX' })],
        totalElements: 1,
      });
      renderPage();
      expect(screen.getByText('접두일치')).toBeInTheDocument();
    });

    it('reason=null 이면 "—" 로 폴백된다', () => {
      mockUseBoNicknames.mockReturnValue({
        ...DEFAULT_NICKNAMES_RETURN,
        items: [makeItem(1, { reason: null })],
        totalElements: 1,
      });
      renderPage();
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('행 클릭 시 navigate(`/admin/nicknames/{id}`) 호출', () => {
      mockUseBoNicknames.mockReturnValue({
        ...DEFAULT_NICKNAMES_RETURN,
        items: [makeItem(42)],
        totalElements: 1,
      });
      renderPage();
      fireEvent.click(screen.getByText('닉네임 42'));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/nicknames/42');
    });
  });

  describe('닉네임 추가', () => {
    it('"닉네임 추가" 버튼 클릭 시 navigate("/admin/nicknames/new") 호출', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '닉네임 추가' }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/nicknames/new');
    });
  });

  describe('로딩 상태', () => {
    it('isLoading=true && items=[] 이면 "불러오는 중..." 이 보인다', () => {
      mockUseBoNicknames.mockReturnValue({
        ...DEFAULT_NICKNAMES_RETURN,
        isLoading: true,
        items: [],
      });
      renderPage();
      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('error 있으면 "닉네임 규칙을 불러오지 못했어요." 가 보인다', () => {
      mockUseBoNicknames.mockReturnValue({
        ...DEFAULT_NICKNAMES_RETURN,
        error: new Error('서버 에러'),
      });
      renderPage();
      expect(screen.getByText('닉네임 규칙을 불러오지 못했어요.')).toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('items=[] && isLoading=false && error=null 이면 "아직 등록된 닉네임 규칙이 없어요." 가 보인다', () => {
      renderPage();
      expect(screen.getByText('아직 등록된 닉네임 규칙이 없어요.')).toBeInTheDocument();
    });
  });
});
