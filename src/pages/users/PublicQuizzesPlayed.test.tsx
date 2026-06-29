import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { AttemptListItem, PublicProfileSummary } from '@/types';
import PublicQuizzesPlayed from './PublicQuizzesPlayed';

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

// ── useMyAttemptsInfinite mock ───────────────────────────────────────────────
const mockUseMyAttemptsInfinite = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useMyAttemptsInfinite', () => ({
  default: mockUseMyAttemptsInfinite,
}));

// ── PlayedQuizCard mock (자식 컴포넌트는 단순화) ─────────────────────────────
vi.mock('@/features/quiz/played/PlayedQuizCard', () => ({
  default: ({
    attempt,
    onClick,
  }: {
    attempt: AttemptListItem;
    onClick: (quizId: number) => void;
  }) =>
    React.createElement(
      'button',
      { 'data-testid': `played-card-${attempt.quizId}`, onClick: () => onClick(attempt.quizId) },
      attempt.quizTitle,
    ),
}));

// ── IntersectionObserver polyfill ────────────────────────────────────────────
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);
}

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

const makeAttempt = (id: number): AttemptListItem => ({
  id,
  quizId: id,
  quizPublicId: `pub-${id}`,
  quizTitle: `퀴즈 ${id}`,
  quizCategory: 'general',
  quizCategoryLabel: '상식',
  quizThumbnailKey: null,
  quizThumbnailUrl: null,
  playCount: 10,
  starCount: 5,
  commentCount: 2,
  shareCount: 1,
  score: 8,
  totalQuestions: 10,
  percent: 80,
  topPercentile: 20,
  timeLimitSec: 30,
  attemptCount: 1,
  completedAt: '2025-01-01T00:00:00Z',
});

const DEFAULT_HOOK_RETURN = {
  items: [] as AttemptListItem[],
  totalElements: 0,
  isLoading: false,
  isLoadingMore: false,
  hasNext: false,
  error: null as unknown,
  loadMore: vi.fn(),
};

const renderPage = (summary: PublicProfileSummary = makeSummary()) => {
  mockUseOutletContext.mockReturnValue({ publicId: summary.userId, summary });
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <PublicQuizzesPlayed />
      </MemoryRouter>
    </ThemeProvider>,
  );
};

describe('PublicQuizzesPlayed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    mockUseMyAttemptsInfinite.mockReturnValue(DEFAULT_HOOK_RETURN);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('정상 렌더', () => {
    it('제목에 닉네임이 노출된다 ("{nickname}님이 푼 퀴즈")', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: '테스터님이 푼 퀴즈' })).toBeInTheDocument();
    });

    it('"전체 {totalElements}개" 와 검색 인풋을 렌더한다', () => {
      mockUseMyAttemptsInfinite.mockReturnValue({ ...DEFAULT_HOOK_RETURN, totalElements: 7 });
      renderPage();
      expect(screen.getByText('전체 7개')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('퀴즈 제목으로 찾기')).toBeInTheDocument();
    });
  });

  describe('hook 인자 전달', () => {
    it('useMyAttemptsInfinite 에 publicId 가 userId 로 전달된다', () => {
      renderPage(makeSummary({ userId: 'pub-42' }));
      expect(mockUseMyAttemptsInfinite).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'pub-42' }),
      );
    });
  });

  describe('로딩 상태', () => {
    it('isLoading=true && items=[] 이면 "불러오는 중..." 을 렌더한다', () => {
      mockUseMyAttemptsInfinite.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        isLoading: true,
        items: [],
      });
      renderPage();
      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
    });
  });

  describe('에러 상태', () => {
    it('error 가 있으면 에러 메시지를 렌더한다', () => {
      mockUseMyAttemptsInfinite.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        error: new Error('서버 에러'),
      });
      renderPage();
      expect(screen.getByText('풀이 기록을 불러오지 못했습니다.')).toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('items=[] 이면 "아직 푼 퀴즈가 없어요." 를 렌더한다', () => {
      renderPage();
      expect(screen.getByText('아직 푼 퀴즈가 없어요.')).toBeInTheDocument();
    });
  });

  describe('목록 렌더', () => {
    it('items 가 있으면 quizId 별 PlayedQuizCard 를 렌더한다', () => {
      mockUseMyAttemptsInfinite.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        items: [makeAttempt(1), makeAttempt(2)],
        totalElements: 2,
      });
      renderPage();
      expect(screen.getByTestId('played-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('played-card-2')).toBeInTheDocument();
      expect(screen.queryByText('아직 푼 퀴즈가 없어요.')).not.toBeInTheDocument();
    });

    it('카드 클릭 시 navigate("/quiz/{id}") 가 호출된다', () => {
      mockUseMyAttemptsInfinite.mockReturnValue({
        ...DEFAULT_HOOK_RETURN,
        items: [makeAttempt(55)],
        totalElements: 1,
      });
      renderPage();
      fireEvent.click(screen.getByTestId('played-card-55'));
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/55');
    });
  });

  describe('검색 입력', () => {
    it('인풋에 입력하면 디바운스 후 hook 이 title 인자로 재호출된다', () => {
      vi.useFakeTimers();
      try {
        renderPage();
        const input = screen.getByPlaceholderText('퀴즈 제목으로 찾기');
        act(() => {
          fireEvent.change(input, { target: { value: '자바' } });
        });
        act(() => {
          vi.advanceTimersByTime(300);
        });
        const lastCall =
          mockUseMyAttemptsInfinite.mock.calls[mockUseMyAttemptsInfinite.mock.calls.length - 1][0];
        expect(lastCall).toMatchObject({ title: '자바' });
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('memoization', () => {
    it('displayName 이 "PublicQuizzesPlayed" 이다', () => {
      expect(PublicQuizzesPlayed.displayName).toBe('PublicQuizzesPlayed');
    });
  });
});
