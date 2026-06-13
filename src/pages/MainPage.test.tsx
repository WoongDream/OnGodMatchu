import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import type { Quiz } from '@/types';

// ── useQuizzes mock ───────────────────────────────────────────────────────────
const mockUseQuizzes = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useQuizzes', () => ({
  default: mockUseQuizzes,
}));

// ── CategoryFilter stub (라우터/store/hook 의존 차단) ────────────────────────────
vi.mock('@/features/quiz/list/CategoryFilter', () => ({
  default: () => <div data-testid="category-filter" />,
}));

// ── QuizList stub (의존성 차단) ────────────────────────────────────────────────
vi.mock('@/features/quiz/list/QuizList', () => ({
  default: ({ quizzes }: { quizzes: Quiz[] }) => (
    <div data-testid="quiz-list" data-count={quizzes.length}>
      QuizList: {quizzes.length}
    </div>
  ),
}));

import MainPage from './MainPage';

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
  isStarred: false,
  isPublic: true,
  createdAt: '2026-05-01T00:00:00+09:00',
});

const baseHook = {
  quizzes: [] as Quiz[],
  totalPages: 0,
  isLoading: false,
  error: undefined as unknown,
};

const setHook = (overrides: Partial<typeof baseHook>) => {
  mockUseQuizzes.mockReturnValue({ ...baseHook, ...overrides });
};

// useQuizzes 가 마지막에 받은 params 를 반환한다.
const lastParams = () => mockUseQuizzes.mock.calls.at(-1)?.[0];

beforeEach(() => {
  vi.clearAllMocks();
  setHook({});
});

describe('MainPage', () => {
  describe('기본 렌더링', () => {
    it('정렬 드롭다운 기본값 "인기순" 과 검색 placeholder 를 렌더한다', () => {
      setHook({ quizzes: [makeQuiz(1)] });
      renderWithTheme(<MainPage />);

      // Dropdown trigger 는 ariaLabel="정렬 기준", 닫힌 상태에서 선택 라벨 노출
      const trigger = screen.getByRole('button', { name: '정렬 기준' });
      expect(trigger).toHaveTextContent('인기순');
      expect(screen.getByPlaceholderText('검색어를 입력하세요.')).toBeInTheDocument();
    });

    it('useQuizzes 를 sort:"plays", 빈 q 로 호출한다', () => {
      setHook({ quizzes: [makeQuiz(1)] });
      renderWithTheme(<MainPage />);

      const params = lastParams();
      expect(params).toMatchObject({ sort: 'plays', q: '', category: undefined });
    });
  });

  describe('정렬 변경', () => {
    it('"최신순" 선택 시 useQuizzes 를 sort:"latest" 로 호출한다', async () => {
      const user = userEvent.setup();
      setHook({ quizzes: [makeQuiz(1)] });
      renderWithTheme(<MainPage />);

      await user.click(screen.getByRole('button', { name: '정렬 기준' }));
      await user.click(screen.getByRole('option', { name: '최신순' }));

      expect(lastParams()).toMatchObject({ sort: 'latest' });
    });
  });

  describe('검색 debounce', () => {
    it('300ms 경과 전에는 q 미반영, 경과 후 q 가 반영된다', () => {
      vi.useFakeTimers();
      try {
        setHook({ quizzes: [makeQuiz(1)] });
        renderWithTheme(<MainPage />);

        const input = screen.getByPlaceholderText('검색어를 입력하세요.');
        act(() => {
          fireEvent.change(input, { target: { value: '리액트' } });
        });

        // 디바운스 경과 전: q 아직 비어 있음
        act(() => {
          vi.advanceTimersByTime(299);
        });
        expect(lastParams()).toMatchObject({ q: '' });

        // 디바운스(300ms) 경과 후: q 반영
        act(() => {
          vi.advanceTimersByTime(1);
        });
        expect(lastParams()).toMatchObject({ q: '리액트' });
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('빈 상태 분기', () => {
    it('비검색 빈 결과면 "퀴즈가 없어요." 를 보여준다', () => {
      setHook({ quizzes: [] });
      renderWithTheme(<MainPage />);

      expect(screen.getByText('퀴즈가 없어요.')).toBeInTheDocument();
      expect(screen.queryByTestId('quiz-list')).not.toBeInTheDocument();
    });

    it('검색 중 빈 결과면 "검색 결과가 없어요." 를 보여준다', () => {
      vi.useFakeTimers();
      try {
        setHook({ quizzes: [] });
        renderWithTheme(<MainPage />);

        const input = screen.getByPlaceholderText('검색어를 입력하세요.');
        act(() => {
          fireEvent.change(input, { target: { value: '없는검색어' } });
        });
        act(() => {
          vi.advanceTimersByTime(300);
        });

        expect(screen.getByText('검색 결과가 없어요.')).toBeInTheDocument();
        expect(screen.queryByText('퀴즈가 없어요.')).not.toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('로딩/에러 분기', () => {
    it('isLoading 이면 "로딩 중..." 을 보여준다', () => {
      setHook({ isLoading: true, quizzes: [] });
      renderWithTheme(<MainPage />);

      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
      expect(screen.queryByTestId('quiz-list')).not.toBeInTheDocument();
    });

    it('error 가 있으면 "퀴즈를 불러오지 못했습니다." 를 보여준다 (로딩보다 우선)', () => {
      setHook({ error: new Error('boom'), isLoading: true, quizzes: [] });
      renderWithTheme(<MainPage />);

      expect(screen.getByText('퀴즈를 불러오지 못했습니다.')).toBeInTheDocument();
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
      expect(screen.queryByTestId('quiz-list')).not.toBeInTheDocument();
    });
  });

  describe('목록 렌더링', () => {
    it('quizzes 가 있으면 QuizList 를 렌더하고 개수를 전달한다', () => {
      setHook({ quizzes: [makeQuiz(1), makeQuiz(2), makeQuiz(3)] });
      renderWithTheme(<MainPage />);

      const list = screen.getByTestId('quiz-list');
      expect(list).toBeInTheDocument();
      expect(list).toHaveAttribute('data-count', '3');
    });
  });
});
