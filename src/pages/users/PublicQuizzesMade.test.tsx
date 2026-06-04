import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { MyQuizListItem, PublicProfileSummary } from '@/types';
import PublicQuizzesMade from './PublicQuizzesMade';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseOutletContext = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useOutletContext: mockUseOutletContext,
    useNavigate: () => mockNavigate,
  };
});

// ── useMyQuizzes mock ────────────────────────────────────────────────────────
const mockUseMyQuizzes = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useMyQuizzes', () => ({
  default: mockUseMyQuizzes,
}));

// ── 자식 컴포넌트 mock ────────────────────────────────────────────────────────
vi.mock('@/components/my-quiz-list', () => ({
  default: ({
    items,
    readOnly,
    onOpen,
  }: {
    items: MyQuizListItem[];
    readOnly?: boolean;
    onOpen: (id: number) => void;
  }) =>
    React.createElement(
      'ul',
      { 'data-testid': 'my-quiz-list', 'data-read-only': String(readOnly ?? false) },
      items.map((item) =>
        React.createElement(
          'li',
          { key: item.id },
          React.createElement('button', { onClick: () => onOpen(item.id) }, `열기-${item.id}`),
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

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const makeSummary = (overrides?: Partial<PublicProfileSummary>): PublicProfileSummary => ({
  userId: 'pub-1',
  nickname: '테스터',
  profileImageUrl: 'https://example.com/avatar.png',
  bio: null,
  isProfilePublic: true,
  solvedCount: 7,
  avgSolveRate: 73,
  quizCount: 5,
  totalPlayCount: 100,
  totalStarCount: 30,
  ...overrides,
});

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
  items: [] as MyQuizListItem[],
  totalElements: 0,
  isLoading: false,
  error: null as unknown,
};

const renderPage = (summary: PublicProfileSummary = makeSummary()) => {
  mockUseOutletContext.mockReturnValue({ publicId: summary.userId, summary });
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <PublicQuizzesMade />
      </MemoryRouter>
    </ThemeProvider>,
  );
};

describe('PublicQuizzesMade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMyQuizzes.mockReturnValue(DEFAULT_QUIZ_RETURN);
  });

  describe('정상 렌더', () => {
    it('제목에 닉네임이 노출된다 ("{nickname}님이 만든 퀴즈")', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: '테스터님이 만든 퀴즈' })).toBeInTheDocument();
    });

    it('정렬 dropdown 이 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('combobox', { name: '정렬 기준' })).toBeInTheDocument();
    });

    it('"전체 {totalElements}개" 가 렌더된다', () => {
      mockUseMyQuizzes.mockReturnValue({ ...DEFAULT_QUIZ_RETURN, totalElements: 5 });
      renderPage();
      expect(screen.getByText('전체 5개')).toBeInTheDocument();
    });
  });

  describe('hook 인자 전달', () => {
    it('useMyQuizzes 에 publicId 가 userId 로 전달된다', () => {
      renderPage(makeSummary({ userId: 'pub-42' }));
      expect(mockUseMyQuizzes).toHaveBeenCalledWith(expect.objectContaining({ userId: 'pub-42' }));
    });
  });

  describe('로딩 상태', () => {
    it('isLoading=true && items=[] 이면 "불러오는 중..." 가 보인다', () => {
      mockUseMyQuizzes.mockReturnValue({ ...DEFAULT_QUIZ_RETURN, isLoading: true, items: [] });
      renderPage();
      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('error 있으면 "퀴즈 목록을 불러오지 못했습니다." 가 보인다', () => {
      mockUseMyQuizzes.mockReturnValue({ ...DEFAULT_QUIZ_RETURN, error: new Error('서버 에러') });
      renderPage();
      expect(screen.getByText('퀴즈 목록을 불러오지 못했습니다.')).toBeInTheDocument();
      expect(screen.queryByTestId('my-quiz-list')).not.toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('items=[] && !isLoading && !error 이면 "아직 만든 퀴즈가 없어요." 가 보인다', () => {
      renderPage();
      expect(screen.getByText('아직 만든 퀴즈가 없어요.')).toBeInTheDocument();
    });
  });

  describe('목록 렌더', () => {
    it('items 가 있으면 MyQuizList 가 readOnly 로 렌더된다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        items: [makeItem(1), makeItem(2)],
        totalElements: 2,
      });
      renderPage();
      const list = screen.getByTestId('my-quiz-list');
      expect(list).toBeInTheDocument();
      expect(list).toHaveAttribute('data-read-only', 'true');
    });

    it('항목 열기 시 navigate("/quiz/{id}") 가 호출된다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        items: [makeItem(42)],
        totalElements: 1,
      });
      renderPage();
      fireEvent.click(screen.getByText('열기-42'));
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/42');
    });
  });

  describe('정렬 dropdown 상호작용', () => {
    it('dropdown 변경 시 useMyQuizzes 가 sort 갱신된 인자로 재호출된다', () => {
      renderPage();
      fireEvent.change(screen.getByRole('combobox', { name: '정렬 기준' }), {
        target: { value: 'plays' },
      });
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

    it('"더 보기" 클릭 시 useMyQuizzes 가 더 큰 size 로 재호출된다', () => {
      mockUseMyQuizzes.mockReturnValue({
        ...DEFAULT_QUIZ_RETURN,
        items: [makeItem(1)],
        totalElements: 10,
      });
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: /더 보기/ }));
      const lastCall = mockUseMyQuizzes.mock.calls[mockUseMyQuizzes.mock.calls.length - 1][0];
      expect(lastCall.size).toBeGreaterThan(6);
    });
  });

  describe('memoization', () => {
    it('displayName 이 "PublicQuizzesMade" 이다', () => {
      expect(PublicQuizzesMade.displayName).toBe('PublicQuizzesMade');
    });
  });
});
