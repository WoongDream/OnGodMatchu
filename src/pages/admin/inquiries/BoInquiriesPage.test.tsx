import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { BoInquiryListItem, InquiryStats } from '@/types';
import BoInquiriesPage from './BoInquiriesPage';

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

// ── useDebouncedValue mock — 즉시 pass-through ─────────────────────────────────
vi.mock('@/hooks/useDebouncedValue', () => ({ default: (v: unknown) => v }));

// ── useBoInquiries mock ──────────────────────────────────────────────────────
const mockUseBoInquiries = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useBoInquiries', () => ({ default: mockUseBoInquiries }));

// ── useBoInquiryStats mock ───────────────────────────────────────────────────
const mockUseBoInquiryStats = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useBoInquiryStats', () => ({ default: mockUseBoInquiryStats }));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const MOCK_STATS: InquiryStats = {
  total: 1234,
  pending: 12,
  inProgress: 5,
  done: 1217,
};

const makeItem = (id: number, overrides: Partial<BoInquiryListItem> = {}): BoInquiryListItem => ({
  id,
  title: `문의${id}`,
  author: {
    publicId: `pub-${id}`,
    nickname: `유저${id}`,
    profileImageUrl: null,
  },
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2025-03-15T09:00:00Z',
  ...overrides,
});

const DEFAULT_INQUIRIES_RETURN = {
  items: [] as BoInquiryListItem[],
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
        <BoInquiriesPage />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('BoInquiriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBoInquiries.mockReturnValue(DEFAULT_INQUIRIES_RETURN);
    mockUseBoInquiryStats.mockReturnValue(DEFAULT_STATS_RETURN);
  });

  describe('렌더', () => {
    it('제목과 설명이 표시된다', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: '문의사항 관리' })).toBeInTheDocument();
      expect(
        screen.getByText('접수된 문의를 시간 순으로 확인하고 상세에서 답변해요.'),
      ).toBeInTheDocument();
    });
  });

  describe('통계 카드', () => {
    it('stats 카드 4개 값(전체/대기/처리중/완료)이 표시된다', () => {
      renderPage();
      expect(screen.getByText('전체 문의')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument(); // total
      expect(screen.getByText('1,217')).toBeInTheDocument(); // done
      // 대기/처리중 값은 카드 + 탭 카운트 뱃지 양쪽에 나타날 수 있어 복수
      expect(screen.getAllByText('12').length).toBeGreaterThanOrEqual(1); // pending
      expect(screen.getAllByText('5').length).toBeGreaterThanOrEqual(1); // inProgress
    });

    it('stats 가 undefined 면 0 으로 표시된다', () => {
      mockUseBoInquiryStats.mockReturnValue({ ...DEFAULT_STATS_RETURN, stats: undefined });
      renderPage();
      // 카드 4개 모두 0
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('필터 탭', () => {
    it('필터 탭 4개가 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('button', { name: /전체/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /대기/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /처리중/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /완료/ })).toBeInTheDocument();
    });

    it('초기에는 filter=ALL 로 useBoInquiries 가 호출된다', () => {
      renderPage();
      const lastCall = mockUseBoInquiries.mock.calls[mockUseBoInquiries.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ filter: 'ALL' });
    });

    it('"대기" 탭 클릭 시 filter=PENDING 으로 재호출된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /대기/ }));
      const lastCall = mockUseBoInquiries.mock.calls[mockUseBoInquiries.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ filter: 'PENDING' });
    });

    it('"처리중" 탭 클릭 시 filter=IN_PROGRESS 로 재호출된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /처리중/ }));
      const lastCall = mockUseBoInquiries.mock.calls[mockUseBoInquiries.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ filter: 'IN_PROGRESS' });
    });

    it('"완료" 탭 클릭 시 filter=DONE 으로 재호출된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /완료/ }));
      const lastCall = mockUseBoInquiries.mock.calls[mockUseBoInquiries.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ filter: 'DONE' });
    });
  });

  describe('검색', () => {
    it('검색어 입력 시 query 로 useBoInquiries 가 재호출된다 (디바운스 pass-through)', () => {
      renderPage();
      fireEvent.change(screen.getByPlaceholderText('문의 제목 검색'), {
        target: { value: '환불' },
      });
      const lastCall = mockUseBoInquiries.mock.calls[mockUseBoInquiries.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ query: '환불' });
    });

    it('검색어가 비어있으면 query 는 undefined 로 전달된다', () => {
      renderPage();
      const lastCall = mockUseBoInquiries.mock.calls[mockUseBoInquiries.mock.calls.length - 1][0];
      expect(lastCall.query).toBeUndefined();
    });
  });

  describe('목록 행', () => {
    it('items 가 있으면 제목·작성자·접수일이 표시된다', () => {
      mockUseBoInquiries.mockReturnValue({
        ...DEFAULT_INQUIRIES_RETURN,
        items: [makeItem(1)],
        totalElements: 1,
      });
      renderPage();
      expect(screen.getByText('문의1')).toBeInTheDocument();
      expect(screen.getByText('유저1')).toBeInTheDocument();
      expect(screen.getByText('2025-03-15')).toBeInTheDocument();
    });

    it('행 클릭 시 navigate(`/admin/inquiries/{id}`) 호출', () => {
      mockUseBoInquiries.mockReturnValue({
        ...DEFAULT_INQUIRIES_RETURN,
        items: [makeItem(42)],
        totalElements: 1,
      });
      renderPage();
      fireEvent.click(screen.getByText('문의42'));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/inquiries/42');
    });
  });

  describe('빈 상태', () => {
    it('items=[] && isLoading=false && error=null 이면 "조건에 맞는 문의가 없어요." 가 보인다', () => {
      renderPage();
      expect(screen.getByText('조건에 맞는 문의가 없어요.')).toBeInTheDocument();
    });

    it('error 있으면 "목록을 불러오지 못했어요." 가 보인다', () => {
      mockUseBoInquiries.mockReturnValue({
        ...DEFAULT_INQUIRIES_RETURN,
        error: new Error('서버 에러'),
      });
      renderPage();
      expect(screen.getByText('목록을 불러오지 못했어요.')).toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('isLoading=true && items=[] 이면 빈/에러 메시지가 보이지 않는다', () => {
      mockUseBoInquiries.mockReturnValue({
        ...DEFAULT_INQUIRIES_RETURN,
        isLoading: true,
      });
      renderPage();
      expect(screen.queryByText('조건에 맞는 문의가 없어요.')).not.toBeInTheDocument();
      expect(screen.queryByText('목록을 불러오지 못했어요.')).not.toBeInTheDocument();
    });
  });

  describe('무한 스크롤', () => {
    it('hasNext=true 면 sentinel 안내 문구가 보인다', () => {
      mockUseBoInquiries.mockReturnValue({
        ...DEFAULT_INQUIRIES_RETURN,
        items: [makeItem(1)],
        totalElements: 100,
        hasNext: true,
      });
      renderPage();
      expect(screen.getAllByText('스크롤하면 더 불러와요').length).toBeGreaterThanOrEqual(1);
    });

    it('IntersectionObserver 가 sentinel 을 observe 한다 (hasNext=true)', () => {
      const observe = vi.fn();
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          observe = observe;
          unobserve = vi.fn();
          disconnect = vi.fn();
          takeRecords = vi.fn(() => []);
        },
      );
      mockUseBoInquiries.mockReturnValue({
        ...DEFAULT_INQUIRIES_RETURN,
        items: [makeItem(1)],
        totalElements: 100,
        hasNext: true,
      });
      renderPage();
      expect(observe).toHaveBeenCalled();
    });
  });

  describe('푸터 카운트', () => {
    it('전체/현재 건수가 표시된다', () => {
      mockUseBoInquiries.mockReturnValue({
        ...DEFAULT_INQUIRIES_RETURN,
        items: [makeItem(1), makeItem(2)],
        totalElements: 50,
      });
      renderPage();
      expect(screen.getByText(/전체 50건 중 2건/)).toBeInTheDocument();
    });
  });
});
