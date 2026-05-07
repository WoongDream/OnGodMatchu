import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import type { AttemptResponse } from '@/types/attempt';
import type { Question } from '@/types/quiz';
import QuizResultPage from './QuizResultPage';

// --- hoisted mocks ---
const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseLocation = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '5' }),
    useLocation: mockUseLocation,
  };
});

// 자식 컴포넌트 격리 — QuizResultPage 의 조합 로직만 검증
vi.mock('@/features/quiz/result/ResultScore', () => ({
  default: ({ scores, total }: { scores: number; total: number }) => (
    <div data-testid="result-score" data-scores={scores} data-total={total}>
      ResultScore
    </div>
  ),
}));

vi.mock('@/features/quiz/result/ResultDetailList', () => ({
  default: ({
    questions,
    results,
  }: {
    questions: Question[];
    results: AttemptResponse['results'];
  }) => (
    <div
      data-testid="result-detail-list"
      data-questions-length={questions.length}
      data-results-length={results.length}
    >
      ResultDetailList
    </div>
  ),
}));

vi.mock('@/features/quiz/result/ResultActions', () => ({
  default: ({
    quizId,
    onRetry,
    onHome,
  }: {
    quizId: number;
    onRetry: () => void;
    onHome: () => void;
  }) => (
    <div data-testid="result-actions" data-quiz-id={quizId}>
      <button onClick={onRetry}>다시 풀기</button>
      <button onClick={onHome}>홈으로</button>
    </div>
  ),
}));

// --- 픽스처 ---

const baseQuestion: Question = {
  id: 1,
  quizId: 5,
  orderNum: 1,
  imageKey: null,
  imageUrl: null,
  answerImageKey: null,
  answerImageUrl: null,
  questionText: '테스트 문제',
  answer: '정답',
};

const baseResult: AttemptResponse = {
  id: 1,
  quizId: 5,
  score: 3,
  totalQuestions: 5,
  percent: 60,
  completedAt: '2026-05-07T00:00:00Z',
  results: [
    {
      questionId: 1,
      userAnswer: '내 답',
      correctAnswer: '정답',
      correct: true,
      correctAnswerImageUrl: null,
    },
  ],
};

// -------------------------------------------------------------------

describe('QuizResultPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('state 없을 때', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({ state: null, pathname: '/quiz/5/result' });
    });

    it('navigate("/", { replace: true }) 를 호출한다', () => {
      renderWithTheme(<QuizResultPage />);

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('null 을 렌더한다 (아무 자식도 없음)', () => {
      const { container } = renderWithTheme(<QuizResultPage />);

      expect(container).toBeEmptyDOMElement();
    });

    it('ResultScore / ResultDetailList / ResultActions 를 렌더하지 않는다', () => {
      renderWithTheme(<QuizResultPage />);

      expect(screen.queryByTestId('result-score')).not.toBeInTheDocument();
      expect(screen.queryByTestId('result-detail-list')).not.toBeInTheDocument();
      expect(screen.queryByTestId('result-actions')).not.toBeInTheDocument();
    });
  });

  describe('state 있을 때', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        state: { result: baseResult, questions: [baseQuestion] },
        pathname: '/quiz/5/result',
      });
    });

    it('navigate 를 호출하지 않는다', () => {
      renderWithTheme(<QuizResultPage />);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('ResultScore 를 렌더한다', () => {
      renderWithTheme(<QuizResultPage />);

      expect(screen.getByTestId('result-score')).toBeInTheDocument();
    });

    it('ResultDetailList 를 렌더한다', () => {
      renderWithTheme(<QuizResultPage />);

      expect(screen.getByTestId('result-detail-list')).toBeInTheDocument();
    });

    it('ResultActions 를 렌더한다', () => {
      renderWithTheme(<QuizResultPage />);

      expect(screen.getByTestId('result-actions')).toBeInTheDocument();
    });

    it('ResultScore 에 score 와 totalQuestions 를 prop 으로 전달한다', () => {
      renderWithTheme(<QuizResultPage />);

      const scoreEl = screen.getByTestId('result-score');
      expect(scoreEl).toHaveAttribute('data-scores', String(baseResult.score));
      expect(scoreEl).toHaveAttribute('data-total', String(baseResult.totalQuestions));
    });

    it('ResultDetailList 에 questions 와 results 를 prop 으로 전달한다', () => {
      renderWithTheme(<QuizResultPage />);

      const listEl = screen.getByTestId('result-detail-list');
      expect(listEl).toHaveAttribute('data-questions-length', '1');
      expect(listEl).toHaveAttribute('data-results-length', String(baseResult.results.length));
    });

    it('ResultActions 에 quizId(숫자) 를 prop 으로 전달한다', () => {
      renderWithTheme(<QuizResultPage />);

      const actionsEl = screen.getByTestId('result-actions');
      expect(actionsEl).toHaveAttribute('data-quiz-id', '5');
    });

    describe('다시 풀기 클릭', () => {
      it('navigate("/quiz/5") 를 호출한다', async () => {
        renderWithTheme(<QuizResultPage />);

        screen.getByRole('button', { name: '다시 풀기' }).click();

        expect(mockNavigate).toHaveBeenCalledWith('/quiz/5');
      });

      it('홈 navigate 는 호출하지 않는다', () => {
        renderWithTheme(<QuizResultPage />);

        screen.getByRole('button', { name: '다시 풀기' }).click();

        expect(mockNavigate).not.toHaveBeenCalledWith('/');
      });
    });

    describe('홈으로 클릭', () => {
      it('navigate("/") 를 호출한다', () => {
        renderWithTheme(<QuizResultPage />);

        screen.getByRole('button', { name: '홈으로' }).click();

        expect(mockNavigate).toHaveBeenCalledWith('/');
      });

      it('retry navigate 는 호출하지 않는다', () => {
        renderWithTheme(<QuizResultPage />);

        screen.getByRole('button', { name: '홈으로' }).click();

        expect(mockNavigate).not.toHaveBeenCalledWith('/quiz/5');
      });
    });
  });

  describe('다양한 score / totalQuestions 전달', () => {
    it.each([
      { score: 0, total: 10 },
      { score: 5, total: 5 },
      { score: 10, total: 10 },
    ])(
      'score=$score, total=$total 이 ResultScore prop 으로 그대로 전달된다',
      ({ score, total }) => {
        const result: AttemptResponse = { ...baseResult, score, totalQuestions: total };
        mockUseLocation.mockReturnValue({
          state: { result, questions: [baseQuestion] },
          pathname: '/quiz/5/result',
        });

        renderWithTheme(<QuizResultPage />);

        const scoreEl = screen.getByTestId('result-score');
        expect(scoreEl).toHaveAttribute('data-scores', String(score));
        expect(scoreEl).toHaveAttribute('data-total', String(total));
      },
    );
  });

  describe('questions 여러 개 전달', () => {
    it('questions 3개가 ResultDetailList 로 전달된다', () => {
      const questions: Question[] = [
        { ...baseQuestion, id: 1, orderNum: 1 },
        { ...baseQuestion, id: 2, orderNum: 2 },
        { ...baseQuestion, id: 3, orderNum: 3 },
      ];
      mockUseLocation.mockReturnValue({
        state: { result: baseResult, questions },
        pathname: '/quiz/5/result',
      });

      renderWithTheme(<QuizResultPage />);

      expect(screen.getByTestId('result-detail-list')).toHaveAttribute(
        'data-questions-length',
        '3',
      );
    });
  });
});
