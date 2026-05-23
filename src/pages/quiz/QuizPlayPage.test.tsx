import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, fireEvent, waitFor, act } from '@/test/renderWithTheme';
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

// 자식 컴포넌트 stub — QuizPlayPage 로직만 검증
vi.mock('@/features/quiz/play/QuizProgress', () => ({
  default: () => <div data-testid="quiz-progress" />,
}));

vi.mock('@/features/quiz/play/QuizQuestion', () => ({
  default: () => <div data-testid="quiz-question" />,
}));

// QuizAnswer stub: value/onChange/onSubmit/disabled 프롭 전달 노출
vi.mock('@/features/quiz/play/QuizAnswer', () => ({
  default: ({
    value,
    onChange,
    disabled,
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
      disabled={disabled}
    />
  ),
}));

// QuizFeedback stub: correct/answer/answerImageUrl 노출
vi.mock('@/features/quiz/play/QuizFeedback', () => ({
  default: ({
    correct,
    answer,
    answerImageUrl,
  }: {
    correct: boolean;
    answer: string;
    answerImageUrl?: string | null;
  }) => (
    <div
      data-testid="quiz-feedback"
      data-correct={String(correct)}
      data-answer={answer}
      data-answer-image-url={answerImageUrl ?? ''}
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
  answerImageUrl: 'https://example.com/answer.png',
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

  // ── 렌더 / 로딩 / 에러 ────────────────────────────────────────────────────
  describe('로딩 상태', () => {
    it('isLoading=true 이면 "로딩 중..." 텍스트를 노출한다', () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: true, quiz: undefined, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });
  });

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

    it('초기 phase=answering 에서 "제출" 버튼이 노출된다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByRole('button', { name: '제출' })).toBeInTheDocument();
    });

    it('마운트 시 submit 이 호출되지 않는다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('초기에 QuizFeedback 이 노출되지 않는다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.queryByTestId('quiz-feedback')).not.toBeInTheDocument();
    });
  });

  // ── 「제출」 버튼 — phase=answering ─────────────────────────────────────────
  describe('「제출」 버튼 (phase=answering)', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
    });

    it('입력값이 비어 있으면 "제출" 버튼이 disabled 된다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByRole('button', { name: '제출' })).toBeDisabled();
    });

    it('공백만 입력하면 "제출" 버튼이 disabled 된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '   ' } });
      expect(screen.getByRole('button', { name: '제출' })).toBeDisabled();
    });

    it('입력값이 있으면 "제출" 버튼이 활성화된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답변' } });
      expect(screen.getByRole('button', { name: '제출' })).not.toBeDisabled();
    });

    it('"제출" 클릭 시 phase=feedback 으로 전환되어 QuizFeedback 이 노출된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답변' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByTestId('quiz-feedback')).toBeInTheDocument();
    });

    it('"제출" 클릭 후 버튼 라벨이 "다음 문제" 로 바뀐다 (다음 문제 존재 시)', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답변' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByRole('button', { name: '다음 문제' })).toBeInTheDocument();
    });
  });

  // ── 로컬 채점 — 정답 ─────────────────────────────────────────────────────
  describe('로컬 채점 — 정답', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
    });

    it('입력=정답1, answer=정답1 → data-correct="true"', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '정답1' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-correct', 'true');
    });
  });

  // ── 로컬 채점 — 오답 ─────────────────────────────────────────────────────
  describe('로컬 채점 — 오답', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
    });

    it('입력=오답 → data-correct="false"', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '오답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-correct', 'false');
    });
  });

  // ── 로컬 채점 — normalize ────────────────────────────────────────────────
  describe('로컬 채점 — normalize', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
    });

    it('앞뒤 공백 + 대소문자 무시: "  ANSWER  " vs answer → 정답', () => {
      const singleQuiz = {
        ...baseQuiz,
        questions: [{ ...q1, answer: 'answer' }],
      };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), {
        target: { value: '  ANSWER  ' },
      });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-correct', 'true');
    });

    it('NFC normalize: 한글 동일 문자열 → 정답', () => {
      const koreanAnswer = '한글'.normalize('NFC');
      const singleQuiz = {
        ...baseQuiz,
        questions: [{ ...q1, answer: koreanAnswer }],
      };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      // NFD 분해 후 입력해도 normalize('NFC') 가 동일하게 처리됨
      fireEvent.change(screen.getByTestId('quiz-answer-input'), {
        target: { value: '한글'.normalize('NFD') },
      });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-correct', 'true');
    });
  });

  // ── 「다음 문제」 클릭 — phase=feedback → answering ──────────────────────
  describe('「다음 문제」 클릭', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
    });

    const submitFirstQuestion = () => {
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '첫 답변' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
    };

    it('"다음 문제" 클릭 시 phase=answering 으로 전환되어 "제출" 버튼이 노출된다', () => {
      renderWithTheme(<QuizPlayPage />);
      submitFirstQuestion();
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      expect(screen.getByRole('button', { name: '제출' })).toBeInTheDocument();
    });

    it('"다음 문제" 클릭 후 inputValue 가 초기화된다', () => {
      renderWithTheme(<QuizPlayPage />);
      submitFirstQuestion();
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      expect(screen.getByTestId('quiz-answer-input')).toHaveValue('');
    });

    it('"다음 문제" 클릭 후 QuizFeedback 이 사라진다', () => {
      renderWithTheme(<QuizPlayPage />);
      submitFirstQuestion();
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      expect(screen.queryByTestId('quiz-feedback')).not.toBeInTheDocument();
    });

    it('"다음 문제" 클릭 시 submit 이 호출되지 않는다', () => {
      renderWithTheme(<QuizPlayPage />);
      submitFirstQuestion();
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  // ── 마지막 문제 feedback ─────────────────────────────────────────────────
  describe('마지막 문제 — feedback 상태', () => {
    it('마지막 문제에서 「제출」 클릭 → 버튼 라벨 "결과 보기" 노출', () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '정답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByRole('button', { name: '결과 보기' })).toBeInTheDocument();
    });

    it('2문제 퀴즈: 첫 문제 제출 → 다음 문제 → 두 번째 문제 제출 → "결과 보기" 노출', () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '첫 답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '둘째 답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByRole('button', { name: '결과 보기' })).toBeInTheDocument();
    });
  });

  // ── 「결과 보기」 클릭 — submit 호출 + navigate ───────────────────────────
  describe('「결과 보기」 클릭', () => {
    const renderAtLastQuestionFeedback = () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      // 첫 번째 문제 답 입력 → 제출 → 다음 문제
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '첫 답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      // 두 번째(마지막) 문제 답 입력 → 제출
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '둘째 답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
    };

    it('"결과 보기" 클릭 시 submit 이 quizId 와 answers 배열로 1회 호출된다', async () => {
      renderAtLastQuestionFeedback();
      fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));
      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      expect(mockSubmit).toHaveBeenCalledWith(42, [
        { questionId: 1, userAnswer: '첫 답' },
        { questionId: 2, userAnswer: '둘째 답' },
      ]);
    });

    it('submit 성공 시 navigate(`/quiz/42/result`) 가 result 와 questions state 로 호출된다', async () => {
      renderAtLastQuestionFeedback();
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
      renderAtLastQuestionFeedback();
      fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));
      await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('1문제 퀴즈에서 "결과 보기" 클릭 시 payload 에 해당 questionId 가 포함된다', async () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '내 답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));
      await waitFor(() =>
        expect(mockSubmit).toHaveBeenCalledWith(42, [{ questionId: 1, userAnswer: '내 답' }]),
      );
    });
  });

  // ── isSubmitting 상태 ──────────────────────────────────────────────────────
  describe('isSubmitting 상태', () => {
    it('isSubmitting=true 이면 "제출" 버튼이 disabled 된다', () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      mockUseSubmitAttempt.mockReturnValue({ ...DEFAULT_SUBMIT_RETURN, isSubmitting: true });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByRole('button', { name: '제출' })).toBeDisabled();
    });

    it('isSubmitting=true 이면 QuizAnswer 가 disabled 된다', () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      mockUseSubmitAttempt.mockReturnValue({ ...DEFAULT_SUBMIT_RETURN, isSubmitting: true });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByTestId('quiz-answer-input')).toBeDisabled();
    });

    it('"채점 중..." 라벨이 노출되고 버튼이 disabled 된다', async () => {
      // "채점 중..." 은 phase=feedback && isLastQuestion && isSubmitting=true 일 때 노출.
      // React.memo 는 props 변경 없이 부모 재렌더로는 bail-out 하지만,
      // 컴포넌트 자신의 setState 가 호출되면 항상 재렌더한다.
      // 전략: "결과 보기" 클릭 후 disabled 된 input 에 fireEvent.change 를 날려
      // (fireEvent 는 disabled 를 무시) → onChange → setInputValue → 컴포넌트 재렌더.
      // 이 재렌더 시점에 mockReturnValue 를 isSubmitting=true 로 갱신해 두면 라벨이 바뀐다.
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      // 초기: isSubmitting=false (제출 버튼 활성화)
      mockUseSubmitAttempt.mockReturnValue({ ...DEFAULT_SUBMIT_RETURN, isSubmitting: false });

      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '내 답' } });
      // phase=answering → "제출" 클릭 → phase=feedback
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByRole('button', { name: '결과 보기' })).toBeInTheDocument();

      // "결과 보기" 클릭 (finalize 비동기 호출 시작)
      fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));

      // isSubmitting=true 로 갱신
      mockUseSubmitAttempt.mockReturnValue({ ...DEFAULT_SUBMIT_RETURN, isSubmitting: true });

      // fireEvent.change 로 setInputValue → 컴포넌트 재렌더 강제
      // (disabled input 에도 fireEvent 는 이벤트를 발생시킴)
      await act(async () => {
        fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '' } });
      });

      expect(screen.getByRole('button', { name: '채점 중...' })).toBeInTheDocument();
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

  // ── answerImageUrl 전달 ────────────────────────────────────────────────────
  describe('answerImageUrl → QuizFeedback 전달', () => {
    it('오답 제출 시 QuizFeedback 의 data-answer-image-url 에 answerImageUrl 이 전달된다', () => {
      // q2 에 answerImageUrl 있음
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      // 첫 번째 문제 제출 후 다음 문제로 이동 (q2 로)
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '첫 답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      // q2 에서 오답 제출
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '오답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute(
        'data-answer-image-url',
        'https://example.com/answer.png',
      );
    });

    it('answerImageUrl 이 null 이면 data-answer-image-url 이 빈 문자열이다', () => {
      // q1 에는 answerImageUrl=null
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '오답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-answer-image-url', '');
    });
  });

  // ── QuizAnswer disabled 조건 ──────────────────────────────────────────────
  describe('QuizAnswer disabled 조건', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
    });

    it('phase=answering 이면 QuizAnswer 가 enabled 된다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByTestId('quiz-answer-input')).not.toBeDisabled();
    });

    it('phase=feedback 이면 QuizAnswer 가 disabled 된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByTestId('quiz-answer-input')).toBeDisabled();
    });

    it('"다음 문제" 클릭 후 phase=answering 복귀 시 QuizAnswer 가 enabled 된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      expect(screen.getByTestId('quiz-answer-input')).not.toBeDisabled();
    });
  });

  // ── 전체 시나리오 — 2문제 정답 완주 ─────────────────────────────────────
  describe('전체 시나리오 — 2문제 정답 완주', () => {
    it('q1 정답 제출 → 다음 문제 → q2 정답 제출 → 결과 보기 → submit 호출', async () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);

      // q1: 정답 입력 후 제출
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '정답1' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-correct', 'true');

      // 다음 문제 클릭
      fireEvent.click(screen.getByRole('button', { name: '다음 문제' }));
      expect(screen.queryByTestId('quiz-feedback')).not.toBeInTheDocument();

      // q2: 정답 입력 후 제출
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '정답2' } });
      fireEvent.click(screen.getByRole('button', { name: '제출' }));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-correct', 'true');
      expect(screen.getByRole('button', { name: '결과 보기' })).toBeInTheDocument();

      // 결과 보기 클릭 → submit 호출
      fireEvent.click(screen.getByRole('button', { name: '결과 보기' }));
      await waitFor(() =>
        expect(mockSubmit).toHaveBeenCalledWith(42, [
          { questionId: 1, userAnswer: '정답1' },
          { questionId: 2, userAnswer: '정답2' },
        ]),
      );
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/quiz/42/result', {
          state: { result: mockAttemptResponse, questions: baseQuiz.questions },
        }),
      );
    });
  });
});
