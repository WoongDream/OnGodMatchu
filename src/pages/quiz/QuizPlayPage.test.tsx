import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, fireEvent, waitFor } from '@/test/renderWithTheme';
import type { Quiz, Question } from '@/types';
import type { AttemptResponse } from '@/types/attempt';
import QuizPlayPage from './QuizPlayPage';

// --- hoisted mocks ---
const mockNavigate = vi.hoisted(() => vi.fn());
const mockSubmit = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '42' }),
  };
});

vi.mock('@/hooks/useQuizDetail', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/useSubmitAttempt', () => ({
  default: vi.fn(),
}));

// 자식 컴포넌트 light stub — QuizPlayPage 로직만 검증
vi.mock('@/features/quiz/play/QuizProgress', () => ({
  default: () => <div data-testid="quiz-progress" />,
}));
vi.mock('@/features/quiz/play/QuizQuestion', () => ({
  default: () => <div data-testid="quiz-question" />,
}));
// QuizAnswer stub: value/onChange/onSubmit/disabled 프롭 전달만 노출
vi.mock('@/features/quiz/play/QuizAnswer', () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
    disabled: boolean;
  }) => (
    <input
      data-testid="quiz-answer-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// --- helpers ---
import useQuizDetail from '@/hooks/useQuizDetail';
import useSubmitAttempt from '@/hooks/useSubmitAttempt';

const mockUseQuizDetail = useQuizDetail as ReturnType<typeof vi.fn>;
const mockUseSubmitAttempt = useSubmitAttempt as ReturnType<typeof vi.fn>;

// --- 샘플 데이터 ---
const q1: Question = {
  id: 1,
  quizId: 42,
  orderNum: 1,
  imageKey: null,
  imageUrl: null,
  answerImageKey: null,
  answerImageUrl: null,
  questionText: '첫 번째 문제',
  answer: '정답1',
};

const q2: Question = {
  id: 2,
  quizId: 42,
  orderNum: 2,
  imageKey: null,
  imageUrl: null,
  answerImageKey: null,
  answerImageUrl: null,
  questionText: '두 번째 문제',
  answer: '정답2',
};

const baseQuiz: Quiz & { questions: Question[] } = {
  id: 42,
  authorNickname: 'tester',
  title: '테스트 퀴즈',
  description: '설명',
  category: 'general',
  thumbnailKey: null,
  thumbnailUrl: null,
  playCount: 0,
  isPublic: true,
  createdAt: '2026-01-01T00:00:00Z',
  questions: [q1, q2],
};

const mockAttemptResponse: AttemptResponse = {
  id: 1,
  quizId: 42,
  score: 2,
  totalQuestions: 2,
  percent: 100,
  completedAt: '2026-01-01T00:01:00Z',
  results: [],
};

const DEFAULT_SUBMIT_RETURN = {
  submit: mockSubmit,
  isSubmitting: false,
  error: null,
  errorCode: null,
  clearError: vi.fn(),
};

// -------------------------------------------------------------------

describe('QuizPlayPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSubmitAttempt.mockReturnValue(DEFAULT_SUBMIT_RETURN);
    mockSubmit.mockResolvedValue(mockAttemptResponse);
  });

  // ── 로딩 분기 ──────────────────────────────────────────────────────────────
  describe('로딩 상태', () => {
    it('isLoading=true 이면 "로딩 중..." 텍스트를 노출한다', () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: true, quiz: undefined, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });
  });

  // ── 에러 분기 ──────────────────────────────────────────────────────────────
  describe('에러 / quiz 없음', () => {
    it('403 에러 시 비공개/존재하지 않는 퀴즈 메시지를 노출한다', () => {
      mockUseQuizDetail.mockReturnValue({
        isLoading: false,
        quiz: undefined,
        error: { response: { status: 403 } },
      });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByText('비공개 퀴즈이거나 존재하지 않는 퀴즈입니다.')).toBeInTheDocument();
    });

    it('404 에러 시 비공개/존재하지 않는 퀴즈 메시지를 노출한다', () => {
      mockUseQuizDetail.mockReturnValue({
        isLoading: false,
        quiz: undefined,
        error: { response: { status: 404 } },
      });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByText('비공개 퀴즈이거나 존재하지 않는 퀴즈입니다.')).toBeInTheDocument();
    });

    it('403/404 에러 시 "홈으로" 버튼을 노출한다', () => {
      mockUseQuizDetail.mockReturnValue({
        isLoading: false,
        quiz: undefined,
        error: { response: { status: 404 } },
      });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByRole('button', { name: '홈으로' })).toBeInTheDocument();
    });

    it('500 에러 시 일반 에러 메시지를 노출한다', () => {
      mockUseQuizDetail.mockReturnValue({
        isLoading: false,
        quiz: undefined,
        error: { response: { status: 500 } },
      });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByText('퀴즈를 불러오지 못했습니다.')).toBeInTheDocument();
    });

    it('error 없이 quiz 가 undefined 이면 일반 에러 메시지를 노출한다', () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: undefined, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByText('퀴즈를 불러오지 못했습니다.')).toBeInTheDocument();
    });

    it('홈으로 버튼 클릭 시 navigate("/") 를 호출한다', () => {
      mockUseQuizDetail.mockReturnValue({
        isLoading: false,
        quiz: undefined,
        error: { response: { status: 404 } },
      });
      renderWithTheme(<QuizPlayPage />);
      fireEvent.click(screen.getByRole('button', { name: '홈으로' }));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // ── 정상 렌더 ──────────────────────────────────────────────────────────────
  describe('정상 렌더', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
    });

    it('QuizProgress, QuizQuestion, QuizAnswer 가 마운트된다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByTestId('quiz-progress')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-question')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-answer-input')).toBeInTheDocument();
    });

    it('첫 번째 문제에서는 "다음 문제" 버튼이 노출된다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByRole('button', { name: '다음 문제' })).toBeInTheDocument();
    });
  });

  // ── incrementPlayCount 호출 안 됨 ──────────────────────────────────────────
  describe('incrementPlayCount 미호출', () => {
    it('mount 시 incrementPlayCount 를 호출하지 않는다', () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      // useSubmitAttempt.submit 은 마운트 시 호출되지 않아야 함
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  // ── gradeAnswer 호출 안 됨 ────────────────────────────────────────────────
  describe('gradeAnswer 미호출', () => {
    it('답 입력 후 다음 문제 버튼 클릭 시 submit 이 즉시 호출되지 않는다', () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답' } });
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      // 마지막 문제가 아니므로 submit 은 아직 호출되면 안 됨
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  // ── 버튼 disabled 조건 ─────────────────────────────────────────────────────
  describe('버튼 disabled 조건', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
    });

    it('입력값이 비어 있으면 "다음 문제" 버튼이 disabled 된다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByRole('button', { name: '다음 문제' })).toBeDisabled();
    });

    it('공백만 입력하면 "다음 문제" 버튼이 disabled 된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '   ' } });
      expect(screen.getByRole('button', { name: '다음 문제' })).toBeDisabled();
    });

    it('입력값이 있으면 "다음 문제" 버튼이 활성화된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답변' } });
      expect(screen.getByRole('button', { name: '다음 문제' })).not.toBeDisabled();
    });
  });

  // ── 다음 문제 전환 ─────────────────────────────────────────────────────────
  describe('다음 문제 전환', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
    });

    it('답 입력 후 "다음 문제" 클릭 시 마지막 문제로 넘어가면 "결과 보기" 버튼이 노출된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '첫 답변' } });
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      expect(screen.getByRole('button', { name: '결과 보기' })).toBeInTheDocument();
    });

    it('"다음 문제" 클릭 후 입력 필드가 초기화된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '첫 답변' } });
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      expect(screen.getByTestId('quiz-answer-input')).toHaveValue('');
    });
  });

  // ── 결과 보기 / submit 호출 ────────────────────────────────────────────────
  describe('마지막 문제에서 결과 보기 클릭', () => {
    const renderAtLastQuestion = () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      // 첫 번째 문제 답 입력 후 다음 문제로 이동
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '첫 답' } });
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      // 두 번째(마지막) 문제 답 입력
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '둘째 답' } });
    };

    it('"결과 보기" 클릭 시 useSubmitAttempt.submit 이 quizId 와 answers 배열로 1회 호출된다', async () => {
      renderAtLastQuestion();
      fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));
      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      expect(mockSubmit).toHaveBeenCalledWith(42, [
        { questionId: 1, userAnswer: '첫 답' },
        { questionId: 2, userAnswer: '둘째 답' },
      ]);
    });

    it('submit 성공 시 navigate(`/quiz/42/result`) 가 result 와 questions state 로 호출된다', async () => {
      renderAtLastQuestion();
      fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/quiz/42/result', {
          state: {
            result: mockAttemptResponse,
            questions: baseQuiz.questions,
          },
        }),
      );
    });

    it('submit 이 null 을 반환하면 navigate 가 호출되지 않는다', async () => {
      mockSubmit.mockResolvedValue(null);
      renderAtLastQuestion();
      fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));
      await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  // ── isSubmitting 상태 ──────────────────────────────────────────────────────
  describe('isSubmitting 상태', () => {
    it('isSubmitting=true 이면 마지막 문제 버튼 텍스트가 "채점 중..." 이 된다', () => {
      // 문제가 1개인 퀴즈 → 바로 마지막 문제
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({
        isLoading: false,
        quiz: singleQuiz,
        error: undefined,
      });
      mockUseSubmitAttempt.mockReturnValue({
        ...DEFAULT_SUBMIT_RETURN,
        isSubmitting: true,
      });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByRole('button', { name: '채점 중...' })).toBeInTheDocument();
    });

    it('isSubmitting=true 이면 "결과 보기/채점 중..." 버튼이 disabled 된다', () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({
        isLoading: false,
        quiz: singleQuiz,
        error: undefined,
      });
      mockUseSubmitAttempt.mockReturnValue({
        ...DEFAULT_SUBMIT_RETURN,
        isSubmitting: true,
      });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByRole('button', { name: '채점 중...' })).toBeDisabled();
    });
  });

  // ── submitError 노출 ───────────────────────────────────────────────────────
  describe('submitError 노출', () => {
    it('submitError 가 있으면 role=alert 로 에러 메시지가 노출된다', () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      mockUseSubmitAttempt.mockReturnValue({
        ...DEFAULT_SUBMIT_RETURN,
        error: '제출에 실패했어요. 잠시 후 다시 시도해주세요.',
      });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByRole('alert')).toHaveTextContent(
        '제출에 실패했어요. 잠시 후 다시 시도해주세요.',
      );
    });

    it('submitError 가 null 이면 alert 가 노출되지 않는다', () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
