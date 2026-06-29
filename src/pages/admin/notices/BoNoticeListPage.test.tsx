import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { BoNoticeListItem, NoticeStats } from '@/types';
import BoNoticeListPage from './BoNoticeListPage';

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

// ── useBoNotices mock ────────────────────────────────────────────────────────
const mockUseBoNotices = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useBoNotices', () => ({ default: mockUseBoNotices }));

// ── useBoNoticeStats mock ────────────────────────────────────────────────────
const mockUseBoNoticeStats = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useBoNoticeStats', () => ({ default: mockUseBoNoticeStats }));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const MOCK_STATS: NoticeStats = {
  total: 12,
  published: 7,
  pinned: 2,
  draft: 3,
};

const makeItem = (id: number, overrides: Partial<BoNoticeListItem> = {}): BoNoticeListItem => ({
  id,
  title: `공지 제목 ${id}`,
  status: 'PUBLISHED',
  pinned: false,
  viewCount: 1234,
  createdAt: '2025-03-15T09:00:00Z',
  ...overrides,
});

const DEFAULT_NOTICES_RETURN = {
  items: [] as BoNoticeListItem[],
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
        <BoNoticeListPage />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('BoNoticeListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBoNotices.mockReturnValue(DEFAULT_NOTICES_RETURN);
    mockUseBoNoticeStats.mockReturnValue(DEFAULT_STATS_RETURN);
  });

  describe('OWNER 배너', () => {
    it('OWNER 배너 텍스트가 렌더된다', () => {
      renderPage();
      expect(screen.getByText('OWNER')).toBeInTheDocument();
      expect(
        screen.getByText('공지사항 관리의 모든 기능은 OWNER만 사용할 수 있어요.'),
      ).toBeInTheDocument();
    });
  });

  describe('통계 카드', () => {
    it('stats 4값(전체/게시/고정/임시저장)이 표시된다', () => {
      renderPage();
      expect(screen.getByText('전체 공지')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // total
      expect(screen.getByText('게시 중')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument(); // published
      expect(screen.getByText('고정')).toBeInTheDocument();
      expect(screen.getByText('임시저장')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // draft
    });

    it('stats 가 undefined 면 0 으로 표시된다', () => {
      mockUseBoNoticeStats.mockReturnValue({ ...DEFAULT_STATS_RETURN, stats: undefined });
      renderPage();
      // 전체/게시/고정/임시저장 카드의 값 + 탭 카운트 모두 0
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('필터 탭', () => {
    it('필터 탭 4개가 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /전체/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /고정/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /게시/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /임시저장/ })).toBeInTheDocument();
    });

    it('초기 filter 는 ALL 로 useBoNotices 가 호출된다', () => {
      renderPage();
      const lastCall = mockUseBoNotices.mock.calls[mockUseBoNotices.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ filter: 'ALL' });
    });

    it('"고정" 탭 클릭 시 filter=PINNED 로 재호출된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /고정/ }));
      const lastCall = mockUseBoNotices.mock.calls[mockUseBoNotices.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ filter: 'PINNED' });
    });

    it('"임시저장" 탭 클릭 시 filter=DRAFT 로 재호출된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /임시저장/ }));
      const lastCall = mockUseBoNotices.mock.calls[mockUseBoNotices.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ filter: 'DRAFT' });
    });
  });

  describe('목록 행', () => {
    it('items 가 있으면 제목·조회수·작성일이 표시된다', () => {
      mockUseBoNotices.mockReturnValue({
        ...DEFAULT_NOTICES_RETURN,
        items: [makeItem(1)],
        totalElements: 1,
      });
      renderPage();
      expect(screen.getByText('공지 제목 1')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument(); // viewCount toLocaleString
      expect(screen.getByText('2025-03-15')).toBeInTheDocument(); // createdAt slice(0,10)
    });

    it('상태 배지가 렌더된다', () => {
      mockUseBoNotices.mockReturnValue({
        ...DEFAULT_NOTICES_RETURN,
        items: [makeItem(1, { status: 'DRAFT' })],
        totalElements: 1,
      });
      renderPage();
      // NoticeStatusBadge — DRAFT 상태 라벨("임시저장")은 탭에도 있으므로 2개 이상
      expect(screen.getAllByText('임시저장').length).toBeGreaterThanOrEqual(2);
    });

    it('행 클릭 시 navigate(`/admin/notices/{id}`) 호출', () => {
      mockUseBoNotices.mockReturnValue({
        ...DEFAULT_NOTICES_RETURN,
        items: [makeItem(42)],
        totalElements: 1,
      });
      renderPage();
      fireEvent.click(screen.getByText('공지 제목 42'));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/notices/42');
    });
  });

  describe('새 공지 작성', () => {
    it('"새 공지 작성" 버튼 클릭 시 navigate("/admin/notices/new") 호출', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '새 공지 작성' }));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/notices/new');
    });
  });

  describe('로딩 상태', () => {
    it('isLoading=true && items=[] 이면 "불러오는 중..." 이 보인다', () => {
      mockUseBoNotices.mockReturnValue({
        ...DEFAULT_NOTICES_RETURN,
        isLoading: true,
        items: [],
      });
      renderPage();
      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('error 있으면 "공지를 불러오지 못했어요." 가 보인다', () => {
      mockUseBoNotices.mockReturnValue({
        ...DEFAULT_NOTICES_RETURN,
        error: new Error('서버 에러'),
      });
      renderPage();
      expect(screen.getByText('공지를 불러오지 못했어요.')).toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('items=[] && isLoading=false && error=null 이면 "아직 등록된 공지가 없어요." 가 보인다', () => {
      renderPage();
      expect(screen.getByText('아직 등록된 공지가 없어요.')).toBeInTheDocument();
    });
  });
});
