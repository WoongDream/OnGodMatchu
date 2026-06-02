import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderWithTheme, screen, fireEvent, waitFor, act } from '@/test/renderWithTheme';
import type { Quiz, Question } from '@/types';
import type { AttemptResponse } from '@/types/attempt';
import type { StartOption } from '@/components/quiz-play-options';
import QuizPlayPage from './QuizPlayPage';

// --- hoisted mocks ---
const mockNavigate = vi.hoisted(() => vi.fn());
const mockSubmit = vi.hoisted(() => vi.fn());
const mockLocationState = vi.hoisted(() => ({ current: null as StartOption | null }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '42' }),
    useLocation: () => ({
      pathname: '/quiz/42/play',
      search: '',
      state: mockLocationState.current,
    }),
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
  // trailing slot 을 노출해 타이머 마운트 여부를 검증할 수 있게 한다
  default: ({ trailing }: { trailing?: React.ReactNode }) => (
    <div data-testid="quiz-progress">{trailing}</div>
  ),
}));

vi.mock('@/features/quiz/play/QuizQuestion', () => ({
  default: () => <div data-testid="quiz-question" />,
}));

// QuizAnswer stub: input + 「제출」 버튼 (실제 컴포넌트와 동일한 인터페이스)
// - value.trim() === '' 또는 disabled → submit 버튼 비활성화
vi.mock('@/features/quiz/play/QuizAnswer', () => ({
  default: ({
    value,
    onChange,
    onSubmit,
    disabled,
    focusKey,
  }: {
    value: string;
    onChange: (v: string) => void;
    onSubmit: () => void;
    disabled: boolean;
    focusKey?: string | number;
  }) => {
    const submitDisabled = disabled || value.trim() === '';
    return (
      <div data-testid="quiz-answer">
        <input
          data-testid="quiz-answer-input"
          data-focus-key={String(focusKey ?? '')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <button
          type="button"
          aria-label="제출"
          disabled={submitDisabled}
          onClick={() => {
            if (!submitDisabled) {
              onSubmit();
            }
          }}
        >
          제출
        </button>
      </div>
    );
  },
}));

// QuizFeedback stub: correct/answer/userAnswer/onNext/nextAriaLabel/nextDisabled 모두 노출
// - 「next」 버튼은 nextAriaLabel 을 그대로 aria-label 로 사용 (실제 컴포넌트와 동일)
vi.mock('@/features/quiz/play/QuizFeedback', () => ({
  default: ({
    correct,
    answer,
    userAnswer,
    answerImageUrl,
    onNext,
    nextAriaLabel,
    nextDisabled,
  }: {
    correct: boolean;
    answer: string;
    userAnswer?: string;
    answerImageUrl?: string | null;
    onNext: () => void;
    nextAriaLabel: string;
    nextDisabled?: boolean;
  }) => (
    <div
      data-testid="quiz-feedback"
      data-correct={String(correct)}
      data-answer={answer}
      data-user-answer={userAnswer ?? ''}
      data-answer-image-url={answerImageUrl ?? ''}
      data-next-aria-label={nextAriaLabel}
    >
      <button
        type="button"
        aria-label={nextAriaLabel}
        disabled={nextDisabled ?? false}
        onClick={onNext}
      >
        {nextAriaLabel}
      </button>
    </div>
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
  starCount: 0,
  commentCount: 0,
  shareCount: 0,
  isStarred: null,
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
  topPercentile: null,
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
    mockLocationState.current = null;
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

    it('초기 phase=answering 에서 QuizAnswer 의 "제출" 버튼이 노출된다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByLabelText('제출')).toBeInTheDocument();
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
      expect(screen.getByLabelText('제출')).toBeDisabled();
    });

    it('공백만 입력하면 "제출" 버튼이 disabled 된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '   ' } });
      expect(screen.getByLabelText('제출')).toBeDisabled();
    });

    it('입력값이 있으면 "제출" 버튼이 활성화된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답변' } });
      expect(screen.getByLabelText('제출')).not.toBeDisabled();
    });

    it('"제출" 클릭 시 phase=feedback 으로 전환되어 QuizFeedback 이 노출된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답변' } });
      fireEvent.click(screen.getByLabelText('제출'));
      expect(screen.getByTestId('quiz-feedback')).toBeInTheDocument();
    });

    it('"제출" 클릭 후 QuizFeedback 의 next 버튼 라벨이 "다음 문제" 가 된다 (다음 문제 존재 시)', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답변' } });
      fireEvent.click(screen.getByLabelText('제출'));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute(
        'data-next-aria-label',
        '다음 문제',
      );
      expect(screen.getByLabelText('다음 문제')).toBeInTheDocument();
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
      fireEvent.click(screen.getByLabelText('제출'));
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
      fireEvent.click(screen.getByLabelText('제출'));
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
      fireEvent.click(screen.getByLabelText('제출'));
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
      fireEvent.click(screen.getByLabelText('제출'));
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
      fireEvent.click(screen.getByLabelText('제출'));
    };

    it('"다음 문제" 클릭 시 phase=answering 으로 전환되어 QuizAnswer 의 "제출" 버튼이 노출된다', () => {
      renderWithTheme(<QuizPlayPage />);
      submitFirstQuestion();
      fireEvent.click(screen.getByLabelText('다음 문제'));
      expect(screen.getByLabelText('제출')).toBeInTheDocument();
      expect(screen.queryByTestId('quiz-feedback')).not.toBeInTheDocument();
    });

    it('"다음 문제" 클릭 후 inputValue 가 초기화된다', () => {
      renderWithTheme(<QuizPlayPage />);
      submitFirstQuestion();
      fireEvent.click(screen.getByLabelText('다음 문제'));
      expect(screen.getByTestId('quiz-answer-input')).toHaveValue('');
    });

    it('"다음 문제" 클릭 후 QuizFeedback 이 사라진다', () => {
      renderWithTheme(<QuizPlayPage />);
      submitFirstQuestion();
      fireEvent.click(screen.getByLabelText('다음 문제'));
      expect(screen.queryByTestId('quiz-feedback')).not.toBeInTheDocument();
    });

    it('"다음 문제" 클릭 시 submit 이 호출되지 않는다', () => {
      renderWithTheme(<QuizPlayPage />);
      submitFirstQuestion();
      fireEvent.click(screen.getByLabelText('다음 문제'));
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  // ── 마지막 문제 feedback ─────────────────────────────────────────────────
  describe('마지막 문제 — feedback 상태', () => {
    it('마지막 문제에서 「제출」 클릭 → next 버튼 라벨 "결과 보기" 노출', () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '정답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute(
        'data-next-aria-label',
        '결과 보기',
      );
      expect(screen.getByLabelText('결과 보기')).toBeInTheDocument();
    });

    it('2문제 퀴즈: 첫 문제 제출 → 다음 문제 → 두 번째 문제 제출 → "결과 보기" 노출', () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '첫 답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      fireEvent.click(screen.getByLabelText('다음 문제'));
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '둘째 답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      expect(screen.getByLabelText('결과 보기')).toBeInTheDocument();
    });
  });

  // ── 「결과 보기」 클릭 — submit 호출 + navigate ───────────────────────────
  describe('「결과 보기」 클릭', () => {
    const renderAtLastQuestionFeedback = () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      // 첫 번째 문제 답 입력 → 제출 → 다음 문제
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '첫 답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      fireEvent.click(screen.getByLabelText('다음 문제'));
      // 두 번째(마지막) 문제 답 입력 → 제출
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '둘째 답' } });
      fireEvent.click(screen.getByLabelText('제출'));
    };

    it('"결과 보기" 클릭 시 submit 이 quizId 와 answers 배열로 1회 호출된다', async () => {
      renderAtLastQuestionFeedback();
      fireEvent.click(screen.getByLabelText('결과 보기'));
      await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
      expect(mockSubmit).toHaveBeenCalledWith(
        42,
        [
          { questionId: 1, userAnswer: '첫 답' },
          { questionId: 2, userAnswer: '둘째 답' },
        ],
        null,
      );
    });

    it('submit 성공 시 navigate(`/quiz/42/result`) 가 result 와 questions state 로 호출된다', async () => {
      renderAtLastQuestionFeedback();
      fireEvent.click(screen.getByLabelText('결과 보기'));
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
      fireEvent.click(screen.getByLabelText('결과 보기'));
      await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('1문제 퀴즈에서 "결과 보기" 클릭 시 payload 에 해당 questionId 가 포함된다', async () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '내 답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      fireEvent.click(screen.getByLabelText('결과 보기'));
      await waitFor(() =>
        expect(mockSubmit).toHaveBeenCalledWith(42, [{ questionId: 1, userAnswer: '내 답' }], null),
      );
    });
  });

  // ── isSubmitting 상태 ──────────────────────────────────────────────────────
  describe('isSubmitting 상태', () => {
    it('isSubmitting=true 이면 phase=answering 에서 QuizAnswer 의 "제출" 버튼이 disabled 된다', () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      mockUseSubmitAttempt.mockReturnValue({ ...DEFAULT_SUBMIT_RETURN, isSubmitting: true });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByLabelText('제출')).toBeDisabled();
    });

    it('isSubmitting=true 이면 QuizAnswer input 이 disabled 된다', () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      mockUseSubmitAttempt.mockReturnValue({ ...DEFAULT_SUBMIT_RETURN, isSubmitting: true });
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByTestId('quiz-answer-input')).toBeDisabled();
    });

    it('feedback 진입 후 isSubmitting=true 가 반환되면 QuizFeedback 의 next 버튼이 disabled 된다', () => {
      // QuizPlayPage 가 isSubmitting 을 QuizFeedback 의 nextDisabled 로 그대로 전달하는지 검증.
      // 전략: phase 가 feedback 으로 바뀐 직후의 렌더부터만 isSubmitting=true 가 반영되도록
      //        가변 플래그로 hook 반환을 동적으로 제어.
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      let isSubmittingFlag = false;
      mockUseSubmitAttempt.mockImplementation(() => ({
        ...DEFAULT_SUBMIT_RETURN,
        isSubmitting: isSubmittingFlag,
      }));

      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '내 답' } });
      // 제출 클릭 직전에 isSubmitting=true 로 전환 → 제출 클릭 → 같은 batch 에서
      // setState(phase='feedback') + (다음 렌더에서) hook=true 반환 → nextDisabled=true
      isSubmittingFlag = true;
      fireEvent.click(screen.getByLabelText('제출'));

      expect(screen.getByLabelText('결과 보기')).toBeInTheDocument();
      expect(screen.getByLabelText('결과 보기')).toBeDisabled();
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

  // ── QuizFeedback props 전달 ────────────────────────────────────────────────
  describe('QuizFeedback props 전달', () => {
    it('오답 제출 시 QuizFeedback 의 data-user-answer 에 입력값이 전달된다', () => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '내 오답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-user-answer', '내 오답');
    });

    it('시간 초과(빈 답) 시 QuizFeedback 의 data-user-answer 가 빈 문자열이다', () => {
      vi.useFakeTimers();
      try {
        mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
        mockLocationState.current = { count: 10, timeLimitSec: 20, shuffle: false };
        renderWithTheme(<QuizPlayPage />);
        act(() => {
          vi.advanceTimersByTime(20_000);
        });
        expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-user-answer', '');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  // ── QuizAnswer disabled 조건 ──────────────────────────────────────────────
  describe('QuizAnswer disabled 조건', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
    });

    it('phase=answering 이면 QuizAnswer input 이 enabled 된다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByTestId('quiz-answer-input')).not.toBeDisabled();
    });

    it('phase=feedback 이면 QuizAnswer 가 언마운트된다', () => {
      // phase=feedback 에서는 QuizAnswer 가 렌더되지 않고 QuizFeedback 만 렌더됨
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      expect(screen.queryByTestId('quiz-answer')).not.toBeInTheDocument();
      expect(screen.getByTestId('quiz-feedback')).toBeInTheDocument();
    });

    it('"다음 문제" 클릭 후 phase=answering 복귀 시 QuizAnswer input 이 enabled 된다', () => {
      renderWithTheme(<QuizPlayPage />);
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      fireEvent.click(screen.getByLabelText('다음 문제'));
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
      fireEvent.click(screen.getByLabelText('제출'));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-correct', 'true');

      // 다음 문제 클릭
      fireEvent.click(screen.getByLabelText('다음 문제'));
      expect(screen.queryByTestId('quiz-feedback')).not.toBeInTheDocument();

      // q2: 정답 입력 후 제출
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '정답2' } });
      fireEvent.click(screen.getByLabelText('제출'));
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-correct', 'true');
      expect(screen.getByLabelText('결과 보기')).toBeInTheDocument();

      // 결과 보기 클릭 → submit 호출
      fireEvent.click(screen.getByLabelText('결과 보기'));
      await waitFor(() =>
        expect(mockSubmit).toHaveBeenCalledWith(
          42,
          [
            { questionId: 1, userAnswer: '정답1' },
            { questionId: 2, userAnswer: '정답2' },
          ],
          null,
        ),
      );
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/quiz/42/result', {
          state: { result: mockAttemptResponse, questions: baseQuiz.questions },
        }),
      );
    });
  });

  // ────────────────────────────────────────────────────────────────────────
  // ── 타이머 (StartOption.timeLimitSec) ────────────────────────────────────
  // ────────────────────────────────────────────────────────────────────────
  describe('QuizTimer — timeLimitSec 미설정', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
    });

    it('location.state 가 null 이면 QuizTimer 가 마운트되지 않는다 (role=timer 없음)', () => {
      mockLocationState.current = null;
      renderWithTheme(<QuizPlayPage />);
      expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    });

    it('timeLimitSec=null 이면 QuizTimer 가 마운트되지 않는다', () => {
      mockLocationState.current = { count: 10, timeLimitSec: null, shuffle: false };
      renderWithTheme(<QuizPlayPage />);
      expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    });
  });

  describe('QuizTimer — timeLimitSec 설정', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      mockLocationState.current = { count: 10, timeLimitSec: 20, shuffle: false };
    });

    it('timeLimitSec=20 이면 QuizTimer 가 마운트되고 초기 텍스트 "20" 이 노출된다', () => {
      renderWithTheme(<QuizPlayPage />);
      const timer = screen.getByRole('timer');
      expect(timer).toBeInTheDocument();
      expect(timer).toHaveTextContent('20');
    });

    it('phase=feedback 으로 전환되면 QuizTimer 가 언마운트된다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByRole('timer')).toBeInTheDocument();

      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답' } });
      fireEvent.click(screen.getByLabelText('제출'));

      expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    });

    it('다음 문제로 이동 시 remainingSec 이 timeLimitSec 으로 재설정된다', () => {
      vi.useFakeTimers();
      try {
        renderWithTheme(<QuizPlayPage />);

        // 5초 경과 → 15초
        act(() => {
          vi.advanceTimersByTime(5000);
        });
        expect(screen.getByRole('timer')).toHaveTextContent('15');

        // 수동 제출 → feedback (타이머 언마운트)
        fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답' } });
        fireEvent.click(screen.getByLabelText('제출'));

        // 다음 문제 → answering 복귀, remainingSec 재설정
        fireEvent.click(screen.getByLabelText('다음 문제'));
        expect(screen.getByRole('timer')).toHaveTextContent('20');
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('QuizTimer — 카운트다운 & 자동 채점', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      mockLocationState.current = { count: 10, timeLimitSec: 20, shuffle: false };
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('1초마다 remainingSec 이 감소한다 (20 → 15 → 10)', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.getByRole('timer')).toHaveTextContent('20');

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByRole('timer')).toHaveTextContent('15');

      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(screen.getByRole('timer')).toHaveTextContent('10');
    });

    it('0초 도달 시 자동으로 feedback phase 로 전환되고 빈 답이면 lastCorrect=false 가 된다', () => {
      renderWithTheme(<QuizPlayPage />);
      expect(screen.queryByTestId('quiz-feedback')).not.toBeInTheDocument();

      // 20초 + 한 사이클의 effect 처리를 위해 충분히 진행
      act(() => {
        vi.advanceTimersByTime(20_000);
      });

      // 입력 없이 시간 초과 → finalizeAnswer(true) → feedback 노출, 오답 처리
      expect(screen.getByTestId('quiz-feedback')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-correct', 'false');
      // 타이머는 언마운트
      expect(screen.queryByRole('timer')).not.toBeInTheDocument();
    });

    it('feedback phase 진입 후에는 인터벌이 정지된다 (추가 advance 가 영향 없음)', () => {
      renderWithTheme(<QuizPlayPage />);

      // 수동 제출 → feedback
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      expect(screen.queryByRole('timer')).not.toBeInTheDocument();

      // 인터벌이 정지되었는지 — feedback 상태에서 큰 시간 진행 후에도
      // 다음 문제로 넘어가지 않고 feedback 유지
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(screen.getByTestId('quiz-feedback')).toBeInTheDocument();
      expect(screen.getByLabelText('다음 문제')).toBeInTheDocument();
    });

    it('마지막 문항에서 시간 초과 → feedback → "결과 보기" 클릭 시 submit 이 호출된다', async () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });

      renderWithTheme(<QuizPlayPage />);
      // 시간 초과
      act(() => {
        vi.advanceTimersByTime(20_000);
      });

      expect(screen.getByTestId('quiz-feedback')).toBeInTheDocument();
      expect(screen.getByLabelText('결과 보기')).toBeInTheDocument();

      // 결과 보기 클릭 — 비동기 submit 처리를 위해 실제 타이머 복귀
      vi.useRealTimers();
      fireEvent.click(screen.getByLabelText('결과 보기'));
      await waitFor(() =>
        expect(mockSubmit).toHaveBeenCalledWith(42, [{ questionId: 1, userAnswer: '' }], 20),
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // ── 회귀 가드 — 시간 초과 → 다음 문제 진입 시 자동 finalizeAnswer 재호출 안 됨
  // ──────────────────────────────────────────────────────────────────────────
  describe('회귀 — 시간 초과 후 다음 문제 진입', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: baseQuiz, error: undefined });
      mockLocationState.current = { count: 10, timeLimitSec: 20, shuffle: false };
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('submit_시간초과후_다음문제_진입_정상_입력_가능 — 자동 finalizeAnswer 재호출되지 않는다', () => {
      renderWithTheme(<QuizPlayPage />);

      // 1) 시간 초과 → feedback
      act(() => {
        vi.advanceTimersByTime(20_000);
      });
      expect(screen.getByTestId('quiz-feedback')).toBeInTheDocument();
      expect(screen.getByLabelText('다음 문제')).toBeInTheDocument();

      // 2) 다음 문제 클릭 → answering 복귀
      act(() => {
        fireEvent.click(screen.getByLabelText('다음 문제'));
      });

      // 3) QuizAnswer 마운트, QuizFeedback 언마운트, 타이머 20 으로 reset
      expect(screen.getByTestId('quiz-answer-input')).toBeInTheDocument();
      expect(screen.queryByTestId('quiz-feedback')).not.toBeInTheDocument();
      expect(screen.getByRole('timer')).toHaveTextContent('20');

      // 4) 한 frame(0ms) 더 진행해 useEffect 들이 모두 실행되도록 함.
      //    버그가 있다면 stale remainingSec=0 으로 즉시 finalizeAnswer(true) 가 트리거됨.
      act(() => {
        vi.advanceTimersByTime(0);
      });
      // 여전히 answering — feedback 으로 자동 전환되지 않아야 함
      expect(screen.queryByTestId('quiz-feedback')).not.toBeInTheDocument();
      expect(screen.getByTestId('quiz-answer-input')).toBeInTheDocument();
      expect(screen.getByRole('timer')).toHaveTextContent('20');

      // 5) 사용자가 정상 입력 → 제출 → feedback 전환 가능 (정답2 입력 시 정답 처리)
      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '정답2' } });
      fireEvent.click(screen.getByLabelText('제출'));
      expect(screen.getByTestId('quiz-feedback')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-correct', 'true');
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-user-answer', '정답2');
    });

    it('submit_시간초과후_마지막문제_다음문제_결과보기_정상_submit_호출', async () => {
      // 1문항 퀴즈로 설정 → currentIndex=0 이 곧 isLastQuestion
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });

      renderWithTheme(<QuizPlayPage />);

      // 1) 시간 초과 → feedback (빈 답, 오답 처리)
      act(() => {
        vi.advanceTimersByTime(20_000);
      });
      expect(screen.getByTestId('quiz-feedback')).toBeInTheDocument();
      expect(screen.getByTestId('quiz-feedback')).toHaveAttribute('data-user-answer', '');
      // 마지막 문항이므로 next 버튼 라벨이 "결과 보기"
      expect(screen.getByLabelText('결과 보기')).toBeInTheDocument();

      // 2) "결과 보기" 클릭 → submit + navigate
      vi.useRealTimers();
      fireEvent.click(screen.getByLabelText('결과 보기'));
      await waitFor(() =>
        expect(mockSubmit).toHaveBeenCalledWith(42, [{ questionId: 1, userAnswer: '' }], 20),
      );
      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith('/quiz/42/result', {
          state: { result: mockAttemptResponse, questions: singleQuiz.questions },
        }),
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // ── submit 의 timeLimitSec 인자 전달 ──────────────────────────────────────
  // ──────────────────────────────────────────────────────────────────────────
  describe('submit timeLimitSec 인자 전달', () => {
    it('option.timeLimitSec 가 설정되면 결과 보기 시 submit 의 세 번째 인자로 전달된다', async () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      mockLocationState.current = { count: 10, timeLimitSec: 30, shuffle: false };
      renderWithTheme(<QuizPlayPage />);

      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '내 답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      fireEvent.click(screen.getByLabelText('결과 보기'));

      await waitFor(() =>
        expect(mockSubmit).toHaveBeenCalledWith(42, [{ questionId: 1, userAnswer: '내 답' }], 30),
      );
    });

    it('타이머가 없으면(timeLimitSec=null) submit 의 세 번째 인자가 null 이다', async () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      mockLocationState.current = { count: 10, timeLimitSec: null, shuffle: false };
      renderWithTheme(<QuizPlayPage />);

      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '내 답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      fireEvent.click(screen.getByLabelText('결과 보기'));

      await waitFor(() =>
        expect(mockSubmit).toHaveBeenCalledWith(42, [{ questionId: 1, userAnswer: '내 답' }], null),
      );
    });

    it('location.state 가 null 이면 submit 의 세 번째 인자가 null 이다', async () => {
      const singleQuiz = { ...baseQuiz, questions: [q1] };
      mockUseQuizDetail.mockReturnValue({ isLoading: false, quiz: singleQuiz, error: undefined });
      mockLocationState.current = null;
      renderWithTheme(<QuizPlayPage />);

      fireEvent.change(screen.getByTestId('quiz-answer-input'), { target: { value: '내 답' } });
      fireEvent.click(screen.getByLabelText('제출'));
      fireEvent.click(screen.getByLabelText('결과 보기'));

      await waitFor(() =>
        expect(mockSubmit).toHaveBeenCalledWith(42, [{ questionId: 1, userAnswer: '내 답' }], null),
      );
    });
  });
});
