import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { MyQuizListItem, MyQuizzesAggregate } from '@/types';
import ProfileQuizzesMade from './ProfileQuizzesMade';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseOutletContext = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace?: boolean }) =>
      React.createElement('div', {
        'data-testid': 'navigate',
        'data-to': to,
        'data-replace': String(replace ?? false),
      }),
    useOutletContext: mockUseOutletContext,
    useNavigate: () => mockNavigate,
  };
});

// ── useMyQuizzesAggregate mock ───────────────────────────────────────────────
const mockUseMyQuizzesAggregate = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useMyQuizzesAggregate', () => ({
  default: mockUseMyQuizzesAggregate,
}));

// ── useMyQuizzes mock ────────────────────────────────────────────────────────
const mockUseMyQuizzes = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useMyQuizzes', () => ({
  default: mockUseMyQuizzes,
}));

// ── child components mock ────────────────────────────────────────────────────
vi.mock('@/components/my-quiz-stats', () => ({
  default: ({ stats, isLoading }: { stats?: object; isLoading: boolean }) =>
    React.createElement('div', {
      'data-testid': 'my-quiz-stats',
      'data-loading': String(isLoading),
      'data-has-stats': stats ? 'true' : 'false',
    }),
}));

vi.mock('@/components/my-quiz-list', () => ({
  default: ({
    items,
    onEdit,
    isMutating,
  }: {
    items: MyQuizListItem[];
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onToggleVisibility: (id: number, isPublic: boolean) => void;
    isMutating: boolean;
  }) =>
    React.createElement(
      'ul',
      { 'data-testid': 'my-quiz-list', 'data-mutating': String(isMutating) },
      items.map((item) =>
        React.createElement(
          'li',
          { key: item.id, 'data-testid': `quiz-item-${item.id}` },
          React.createElement('button', { onClick: () => onEdit(item.id) }, `편집-${item.id}`),
        ),
      ),
    ),
}));

vi.mock('@/components/dropdown', () => ({
  default: ({
    value,
    onChange,
    options,
    ariaLabel,
  }: {
    value: string;
    onChange: (val: string) => void;
    options: Array<{ value: string; label: string }>;
    ariaLabel: string;
  }) =>
    React.createElement(
      'select',
      {
        'aria-label': ariaLabel,
        value,
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
      },
      options.map((opt) =>
        React.createElement('option', { key: opt.value, value: opt.value }, opt.label),
      ),
    ),
}));

vi.mock('@/components/chip-button', () => ({
  default: ({
    children,
    active,
    onClick,
  }: {
    children: React.ReactNode;
    active: boolean;
    onClick: () => void;
  }) =>
    React.createElement(
      'button',
      { onClick, 'aria-pressed': String(active), role: 'tab' },
      children,
    ),
}));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const MOCK_STATS: MyQuizzesAggregate = {
  totalQuizCount: 5,
  totalPlayCount: 100,
  totalShareCount: 20,
  totalStarCount: 30,
  totalCommentCount: 10,
  weeklyPlayCount: 15,
};

const makeItem = (id: number): MyQuizListItem => ({
  id,
  publicId: `uuid-${id}`,
  title: `퀴즈 제목 ${id}`,
  category: 'general',
  categoryLabel: '상식',
  isPublic: true,
  thumbnailUrl: null,
  playCount: 10,
  shareCount: 5,
  starCount: 3,
  commentCount: 2,
  correctRate: 0.7,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-02T00:00:00Z',
});

const DEFAULT_QUIZ_RETURN = {
  items: [],
  totalElements: 0,
  isLoading: false,
  error: null,
  isMutating: false,
  remove: vi.fn(),
  toggleVisibility: vi.fn(),
};

const DEFAULT_AGGREGATE_RETURN = {
  stats: MOCK_STATS,
  isLoading: false,
};

// ── render 헬퍼 ───────────────────────────────────────────────────────────────
const renderPage = (isMe = true) => {
  mockUseOutletContext.mockReturnValue({ isMe });
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <ProfileQuizzesMade />
      </MemoryRouter>
    </ThemeProvider>,
  );
};

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('ProfileQuizzesMade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMyQuizzesAggregate.mockReturnValue(DEFAULT_AGGREGATE_RETURN);
    mockUseMyQuizzes.mockReturnValue(DEFAULT_QUIZ_RETURN);
  });

  describe('접근 제어', () => {
    it('isMe=false 이면 Navigate가 렌더된다', () => {
      renderPage(false);
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '..');
    });

    it('isMe=false 이면 "내가 만든 퀴즈" 제목이 보이지 않는다', () => {
      renderPage(false);
      expect(screen.queryByRole('heading', { name: '내가 만든 퀴즈' })).not.toBeInTheDocument();
    });
  });

  describe('정상 렌더 (isMe=true)', () => {
    it('"내가 만든 퀴즈" 제목이 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: '내가 만든 퀴즈' })).toBeInTheDocument();
    });

    it('"+ 새 퀴즈" 버튼이 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('button', { name: '+ 새 퀴즈' })).toBeInTheDocument();
    });

    it('MyQuizStats 컴포넌트가 렌더된다', () => {
      renderPage();
      expect(screen.getByTestId('my-quiz-stats')).toBeInTheDocument();
    });

    it('필터 chip 3개(전체/공개/비공개)가 렌더된다', () => {
      renderPage();
      const tabs = screen.getAllByRole('tab');
      expect(tabs).toHaveLength(3);
    });

    it('정렬 dropdown이 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('combobox', { name: '정렬 기준' })).toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('isLoading=true && items=[] 이면 "불러오는 중..." 텍스트가 보인다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        isLoading: true,
        items: [],
      });
      renderPage();
      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
    });

    it('로딩 중에는 MyQuizList 가 렌더되지 않는다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        isLoading: true,
        items: [],
      });
      renderPage();
      expect(screen.queryByTestId('my-quiz-list')).not.toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('error 있으면 "퀴즈 목록을 불러오지 못했습니다." 가 보인다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        error: new Error('서버 에러'),
      });
      renderPage();
      expect(screen.getByText('퀴즈 목록을 불러오지 못했습니다.')).toBeInTheDocument();
    });

    it('에러 시 MyQuizList 가 렌더되지 않는다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        error: new Error('서버 에러'),
      });
      renderPage();
      expect(screen.queryByTestId('my-quiz-list')).not.toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('items=[] && isLoading=false && error=null 이면 "아직 만든 퀴즈가 없습니다." 가 보인다', () => {
      renderPage();
      expect(screen.getByText('아직 만든 퀴즈가 없습니다.')).toBeInTheDocument();
    });

    it('빈 상태에서 "퀴즈 만들기" 버튼이 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('button', { name: '퀴즈 만들기' })).toBeInTheDocument();
    });

    it('빈 상태의 "퀴즈 만들기" 버튼 클릭 시 navigate("/quiz/create") 호출', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '퀴즈 만들기' }));
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/create');
    });
  });

  describe('네비게이션', () => {
    it('"+ 새 퀴즈" 버튼 클릭 시 navigate("/quiz/create") 호출', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '+ 새 퀴즈' }));
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/create');
    });

    it('MyQuizCard 편집 버튼 클릭 시 navigate("/quiz/{id}/edit") 호출', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        items: [makeItem(42)],
        totalElements: 1,
      });
      renderPage();
      fireEvent.click(screen.getByText('편집-42'));
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/42/edit');
    });
  });

  describe('필터 chip 상호작용', () => {
    it('초기 상태에서 "전체" chip이 active(aria-pressed=true)다', () => {
      renderPage();
      const tabs = screen.getAllByRole('tab');
      // 첫 번째 탭이 "전체"
      expect(tabs[0]).toHaveAttribute('aria-pressed', 'true');
    });

    it('"공개" chip 클릭 시 useMyQuizzes 가 visibility="public" 으로 재호출된다', () => {
      renderPage();
      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[1]); // "공개"
      // 다음 렌더 싸이클에서 useMyQuizzes 인자 확인
      const lastCall = mockUseMyQuizzes.mock.calls[mockUseMyQuizzes.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ visibility: 'public' });
    });

    it('"비공개" chip 클릭 시 useMyQuizzes 가 visibility="private" 으로 재호출된다', () => {
      renderPage();
      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[2]); // "비공개"
      const lastCall = mockUseMyQuizzes.mock.calls[mockUseMyQuizzes.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ visibility: 'private' });
    });

    it('"전체" chip 클릭 시 visibility 가 "all" 로 돌아온다', () => {
      renderPage();
      const tabs = screen.getAllByRole('tab');
      fireEvent.click(tabs[1]); // 공개 선택
      fireEvent.click(tabs[0]); // 전체로 복귀
      const lastCall = mockUseMyQuizzes.mock.calls[mockUseMyQuizzes.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ visibility: 'all' });
    });
  });

  describe('정렬 dropdown 상호작용', () => {
    it('초기 정렬은 "latest" 다', () => {
      renderPage();
      const select = screen.getByRole('combobox', { name: '정렬 기준' });
      expect(select).toHaveValue('latest');
    });

    it('dropdown 변경 시 useMyQuizzes 가 sort 값 갱신된 인자로 재호출된다', () => {
      renderPage();
      const select = screen.getByRole('combobox', { name: '정렬 기준' });
      fireEvent.change(select, { target: { value: 'plays' } });
      const lastCall = mockUseMyQuizzes.mock.calls[mockUseMyQuizzes.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ sort: 'plays' });
    });
  });

  describe('"더 보기" 버튼', () => {
    it('items.length < totalElements 이면 "더 보기" 버튼이 렌더된다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        items: [makeItem(1)],
        totalElements: 10,
      });
      renderPage();
      expect(screen.getByRole('button', { name: /더 보기/ })).toBeInTheDocument();
    });

    it('items.length >= totalElements 이면 "더 보기" 버튼이 없다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        items: [makeItem(1), makeItem(2)],
        totalElements: 2,
      });
      renderPage();
      expect(screen.queryByRole('button', { name: /더 보기/ })).not.toBeInTheDocument();
    });

    it('"더 보기" 버튼 클릭 시 useMyQuizzes 가 더 큰 size 로 재호출된다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        items: [makeItem(1)],
        totalElements: 10,
      });
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /더 보기/ }));
      const lastCall = mockUseMyQuizzes.mock.calls[mockUseMyQuizzes.mock.calls.length - 1][0];
      // 초기 PAGE_SIZE=6, 클릭 후 12
      expect(lastCall.size).toBeGreaterThan(6);
    });

    it('"더 보기" 버튼에 현재/전체 개수가 표시된다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        items: [makeItem(1), makeItem(2)],
        totalElements: 10,
      });
      renderPage();
      expect(screen.getByRole('button', { name: /2 \/ 10/ })).toBeInTheDocument();
    });
  });

  describe('MyQuizList 렌더', () => {
    it('items 가 있으면 MyQuizList 가 렌더된다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        items: [makeItem(1), makeItem(2)],
        totalElements: 2,
      });
      renderPage();
      expect(screen.getByTestId('my-quiz-list')).toBeInTheDocument();
    });

    it('items 가 있으면 빈 상태 메시지가 보이지 않는다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        items: [makeItem(1)],
        totalElements: 1,
      });
      renderPage();
      expect(screen.queryByText('아직 만든 퀴즈가 없습니다.')).not.toBeInTheDocument();
    });
  });
});
