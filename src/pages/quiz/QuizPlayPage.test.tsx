import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, fireEvent } from '@/test/renderWithTheme';
import type { Quiz, Question } from '@/types';
import QuizPlayPage from './QuizPlayPage';

// --- hoisted mocks ---
const mockNavigate = vi.hoisted(() => vi.fn());

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

vi.mock('@/api/quiz', () => ({
  incrementPlayCount: vi.fn().mockResolvedValue(undefined),
  gradeAnswer: vi.fn(),
}));

// Isolate child feature components so this test only covers QuizPlayPage logic
vi.mock('@/features/quiz/play/QuizProgress', () => ({
  default: () => <div data-testid="quiz-progress" />,
}));
vi.mock('@/features/quiz/play/QuizQuestion', () => ({
  default: () => <div data-testid="quiz-question" />,
}));
vi.mock('@/features/quiz/play/QuizAnswer', () => ({
  default: () => <div data-testid="quiz-answer" />,
}));
vi.mock('@/features/quiz/play/QuizFeedback', () => ({
  default: () => <div data-testid="quiz-feedback" />,
}));

// --- helpers ---
import useQuizDetail from '@/hooks/useQuizDetail';

const mockUseQuizDetail = useQuizDetail as ReturnType<typeof vi.fn>;

const baseQuestion: Question = {
  id: 1,
  quizId: 42,
  orderNum: 1,
  imageKey: null,
  imageUrl: null,
  answerImageKey: null,
  answerImageUrl: null,
  questionText: '테스트 문제',
  answer: '정답',
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
  questions: [baseQuestion],
};

// -------------------------------------------------------------------

describe('QuizPlayPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('로딩 중일 때 "로딩 중..." 텍스트를 노출한다', () => {
    mockUseQuizDetail.mockReturnValue({ isLoading: true, quiz: undefined, error: undefined });
    renderWithTheme(<QuizPlayPage />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('403 에러 시 비공개/존재하지 않는 퀴즈 메시지와 홈으로 버튼을 노출한다', () => {
    mockUseQuizDetail.mockReturnValue({
      isLoading: false,
      quiz: undefined,
      error: { response: { status: 403 } },
    });
    renderWithTheme(<QuizPlayPage />);
    expect(screen.getByText('비공개 퀴즈이거나 존재하지 않는 퀴즈입니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '홈으로' })).toBeInTheDocument();
  });

  it('404 에러 시 비공개/존재하지 않는 퀴즈 메시지와 홈으로 버튼을 노출한다', () => {
    mockUseQuizDetail.mockReturnValue({
      isLoading: false,
      quiz: undefined,
      error: { response: { status: 404 } },
    });
    renderWithTheme(<QuizPlayPage />);
    expect(screen.getByText('비공개 퀴즈이거나 존재하지 않는 퀴즈입니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '홈으로' })).toBeInTheDocument();
  });

  it('500 에러 시 "퀴즈를 불러오지 못했습니다." 메시지와 홈으로 버튼을 노출한다', () => {
    mockUseQuizDetail.mockReturnValue({
      isLoading: false,
      quiz: undefined,
      error: { response: { status: 500 } },
    });
    renderWithTheme(<QuizPlayPage />);
    expect(screen.getByText('퀴즈를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '홈으로' })).toBeInTheDocument();
  });

  it('error 없이 quiz 가 undefined 일 때 "퀴즈를 불러오지 못했습니다." 메시지를 노출한다', () => {
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

  it('quiz 가 정상 반환될 때 QuizProgress, QuizQuestion, QuizAnswer 가 마운트된다', () => {
    mockUseQuizDetail.mockReturnValue({
      isLoading: false,
      quiz: baseQuiz,
      error: undefined,
    });
    renderWithTheme(<QuizPlayPage />);
    expect(screen.getByTestId('quiz-progress')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-question')).toBeInTheDocument();
    expect(screen.getByTestId('quiz-answer')).toBeInTheDocument();
  });
});
