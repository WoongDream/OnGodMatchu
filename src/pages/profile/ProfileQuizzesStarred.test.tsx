import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent } from '@testing-library/react';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import type { Quiz } from '@/types';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockUseOutletContext = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: mockUseOutletContext,
    Navigate: (props: { to: string }) => {
      mockNavigate(props.to);
      return <div data-testid="navigate" data-to={props.to} />;
    },
  };
});

// ── useStarredQuizzes mock ────────────────────────────────────────────────────
const mockUseStarredQuizzes = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useStarredQuizzes', () => ({
  default: mockUseStarredQuizzes,
}));

// ── QuizList stub (의존성 차단) ────────────────────────────────────────────────
// onStarToggled 를 검증하기 위해 스타 취소/추가를 흉내내는 버튼을 노출한다.
const STUB_QUIZ_ID = 42;
vi.mock('@/features/quiz/list/QuizList', () => ({
  default: ({
    quizzes,
    onStarToggled,
  }: {
    quizzes: Quiz[];
    onStarToggled?: (quizId: number, nextStarred: boolean) => void;
  }) => (
    <div data-testid="quiz-list" data-count={quizzes.length}>
      QuizList: {quizzes.length}
      <button
        type="button"
        data-testid="unstar"
        onClick={() => onStarToggled?.(STUB_QUIZ_ID, false)}
      >
        unstar
      </button>
      <button type="button" data-testid="star" onClick={() => onStarToggled?.(STUB_QUIZ_ID, true)}>
        star
      </button>
    </div>
  ),
}));

import ProfileQuizzesStarred from './ProfileQuizzesStarred';

// ── helpers ───────────────────────────────────────────────────────────────────
const makeQuiz = (id: number): Quiz => ({
  id,
  authorNickname: '작성자',
  title: `퀴즈 ${id}`,
  description: '',
  category: 'game',
  thumbnailUrl: null,
  playCount: 0,
  starCount: 0,
  commentCount: 0,
  shareCount: 0,
  isStarred: true,
  isPublic: true,
  createdAt: '2026-05-01T00:00:00+09:00',
});

const baseHook = {
  items: [] as Quiz[],
  totalElements: 0,
  isLoading: false,
  isLoadingMore: false,
  hasNext: false,
  error: undefined as unknown,
  loadMore: vi.fn(),
  removeQuiz: vi.fn(),
};

const setHook = (overrides: Partial<typeof baseHook>) => {
  mockUseStarredQuizzes.mockReturnValue({ ...baseHook, ...overrides });
};

beforeEach(() => {
  vi.clearAllMocks();
  // 기본: 본인(isMe)
  mockUseOutletContext.mockReturnValue({ profile: { id: 'u1' }, isMe: true });
  setHook({});
  // IntersectionObserver 스텁
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe('ProfileQuizzesStarred', () => {
  describe('접근 제어', () => {
    it('isMe=false 면 상위 경로로 redirect 한다', () => {
      mockUseOutletContext.mockReturnValue({ profile: { id: 'u1' }, isMe: false });
      renderWithTheme(<ProfileQuizzesStarred />);

      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '..');
      expect(mockNavigate).toHaveBeenCalledWith('..');
    });
  });

  describe('툴바', () => {
    it('전체 개수와 검색 입력을 렌더한다', () => {
      setHook({ totalElements: 7, items: [makeQuiz(1)] });
      renderWithTheme(<ProfileQuizzesStarred />);

      expect(screen.getByText('전체 7개')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('퀴즈 제목으로 찾기')).toBeInTheDocument();
    });
  });

  describe('상태별 렌더링', () => {
    it('items 가 있으면 QuizList 를 렌더하고 개수를 전달한다', () => {
      setHook({ items: [makeQuiz(1), makeQuiz(2), makeQuiz(3)], totalElements: 3 });
      renderWithTheme(<ProfileQuizzesStarred />);

      const list = screen.getByTestId('quiz-list');
      expect(list).toBeInTheDocument();
      expect(list).toHaveAttribute('data-count', '3');
    });

    it('초기 로딩 중이면 "불러오는 중..." 을 보여준다', () => {
      setHook({ isLoading: true, items: [] });
      renderWithTheme(<ProfileQuizzesStarred />);

      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
      expect(screen.queryByTestId('quiz-list')).not.toBeInTheDocument();
    });

    it('error 가 있으면 에러 메시지를 보여준다', () => {
      setHook({ error: new Error('boom'), items: [] });
      renderWithTheme(<ProfileQuizzesStarred />);

      expect(screen.getByText('스타 준 퀴즈를 불러오지 못했습니다.')).toBeInTheDocument();
      expect(screen.queryByTestId('quiz-list')).not.toBeInTheDocument();
    });

    it('비검색 상태에서 빈 결과면 "아직 스타 준 퀴즈가 없어요" 를 보여준다', () => {
      setHook({ items: [], totalElements: 0 });
      renderWithTheme(<ProfileQuizzesStarred />);

      expect(screen.getByText('아직 스타 준 퀴즈가 없어요.')).toBeInTheDocument();
    });

    it('검색 중 빈 결과면 "검색 결과가 없어요" 를 보여준다', () => {
      vi.useFakeTimers();
      try {
        setHook({ items: [], totalElements: 0 });
        renderWithTheme(<ProfileQuizzesStarred />);

        const input = screen.getByPlaceholderText('퀴즈 제목으로 찾기');
        act(() => {
          fireEvent.change(input, { target: { value: '없는검색어' } });
        });

        // 디바운스(300ms) 통과 → isSearching=true
        act(() => {
          vi.advanceTimersByTime(300);
        });

        expect(screen.getByText('검색 결과가 없어요.')).toBeInTheDocument();
        expect(screen.queryByText('아직 스타 준 퀴즈가 없어요.')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('onStarToggled → removeQuiz 연동', () => {
    it('nextStarred=false(스타 취소) 면 removeQuiz(quizId) 를 호출한다', () => {
      setHook({ items: [makeQuiz(STUB_QUIZ_ID)], totalElements: 1 });
      renderWithTheme(<ProfileQuizzesStarred />);

      act(() => {
        fireEvent.click(screen.getByTestId('unstar'));
      });

      expect(baseHook.removeQuiz).toHaveBeenCalledWith(STUB_QUIZ_ID);
      expect(baseHook.removeQuiz).toHaveBeenCalledTimes(1);
    });

    it('nextStarred=true(스타 추가) 면 removeQuiz 를 호출하지 않는다', () => {
      setHook({ items: [makeQuiz(STUB_QUIZ_ID)], totalElements: 1 });
      renderWithTheme(<ProfileQuizzesStarred />);

      act(() => {
        fireEvent.click(screen.getByTestId('star'));
      });

      expect(baseHook.removeQuiz).not.toHaveBeenCalled();
    });
  });
});
