import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, fireEvent, waitFor } from '@/test/renderWithTheme';
import type { AttemptResponse } from '@/types/attempt';
import type { Comment, Quiz, Question, QuizScoreDistribution, User } from '@/types';
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

// --- hooks / store / toast mocks ---
vi.mock('@/hooks/useQuizDetail', () => ({ default: vi.fn() }));
vi.mock('@/hooks/useQuizScoreDistribution', () => ({ default: vi.fn() }));
vi.mock('@/hooks/useToggleStar', () => ({ default: vi.fn() }));
vi.mock('@/hooks/useShareQuiz', () => ({ default: vi.fn() }));
vi.mock('@/hooks/useComments', () => ({ default: vi.fn() }));
vi.mock('@/store/authStore', () => ({ default: vi.fn() }));

const mockToastSuccess = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());
const mockToastInfo = vi.hoisted(() => vi.fn());
const mockToastShow = vi.hoisted(() => vi.fn());

vi.mock('@/components/toast', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError,
    info: mockToastInfo,
    show: mockToastShow,
  }),
}));

// --- 자식 컴포넌트 stub ---
vi.mock('@/features/quiz/result/ResultHeader', () => ({
  default: ({
    score,
    totalQuestions,
    topPercentile,
  }: {
    score: number;
    totalQuestions: number;
    topPercentile: number | null;
  }) => (
    <div
      data-testid="result-header"
      data-score={score}
      data-total={totalQuestions}
      data-top-percentile={topPercentile === null ? 'null' : String(topPercentile)}
    >
      ResultHeader
    </div>
  ),
}));

vi.mock('@/features/quiz/result/ResultDistribution', () => ({
  default: ({
    data,
    myScore,
    topPercentile,
  }: {
    data: QuizScoreDistribution;
    myScore: number;
    topPercentile: number | null;
  }) => (
    <div
      data-testid="result-distribution"
      data-total-attempts={data.totalAttempts}
      data-my-score={myScore}
      data-top-percentile={topPercentile === null ? 'null' : String(topPercentile)}
    >
      ResultDistribution
    </div>
  ),
}));

vi.mock('@/features/quiz/result/ResultActions', () => ({
  default: ({
    starred,
    starCount,
    shareCount,
    starDisabled,
    onRetry,
    onStar,
    onShare,
  }: {
    starred: boolean;
    starCount: number;
    shareCount: number;
    starDisabled?: boolean;
    onRetry: () => void;
    onStar: () => void;
    onShare: () => void;
  }) => (
    <div
      data-testid="result-actions"
      data-starred={String(starred)}
      data-star-count={starCount}
      data-share-count={shareCount}
      data-star-disabled={String(!!starDisabled)}
    >
      <button onClick={onRetry}>다시 풀기</button>
      <button onClick={onStar}>스타</button>
      <button onClick={onShare}>공유</button>
    </div>
  ),
}));

vi.mock('@/features/quiz/comment', () => ({
  CommentForm: ({
    isLoggedIn,
    nickname,
    isSubmitting,
    errorMessage,
    onSubmit,
  }: {
    isLoggedIn: boolean;
    nickname?: string;
    profileImageUrl?: string | null;
    isSubmitting?: boolean;
    errorMessage?: string | null;
    onSubmit: (content: string) => Promise<void> | void;
  }) => (
    <div
      data-testid="comment-form"
      data-logged-in={String(isLoggedIn)}
      data-nickname={nickname ?? ''}
      data-submitting={String(!!isSubmitting)}
    >
      {errorMessage && <p data-testid="comment-form-error">{errorMessage}</p>}
      <button onClick={() => void onSubmit('hi from form')}>댓글 제출</button>
    </div>
  ),
  CommentList: ({
    comments,
    currentUserNickname,
    onDelete,
    isMutating,
  }: {
    comments: Comment[];
    currentUserNickname: string | null;
    onDelete: (commentId: number) => void;
    isMutating?: boolean;
  }) => (
    <div
      data-testid="comment-list"
      data-count={comments.length}
      data-current-nickname={currentUserNickname ?? ''}
      data-mutating={String(!!isMutating)}
    >
      {comments.map((c) => (
        <button key={c.id} onClick={() => onDelete(c.id)}>
          댓글삭제 {c.id}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('@/components/login-prompt-modal', () => ({
  default: ({
    isOpen,
    onClose,
    title,
    message,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
  }) =>
    isOpen ? (
      <div data-testid="login-prompt-modal" data-title={title} data-message={message}>
        <button onClick={onClose}>모달닫기</button>
      </div>
    ) : null,
}));

// --- hook handles ---
import useAuthStore from '@/store/authStore';
import useComments from '@/hooks/useComments';
import useQuizDetail from '@/hooks/useQuizDetail';
import useQuizScoreDistribution from '@/hooks/useQuizScoreDistribution';
import useShareQuiz from '@/hooks/useShareQuiz';
import useToggleStar from '@/hooks/useToggleStar';

const mockUseQuizDetail = useQuizDetail as unknown as ReturnType<typeof vi.fn>;
const mockUseQuizScoreDistribution = useQuizScoreDistribution as unknown as ReturnType<
  typeof vi.fn
>;
const mockUseToggleStar = useToggleStar as unknown as ReturnType<typeof vi.fn>;
const mockUseShareQuiz = useShareQuiz as unknown as ReturnType<typeof vi.fn>;
const mockUseComments = useComments as unknown as ReturnType<typeof vi.fn>;
const mockUseAuthStore = useAuthStore as unknown as ReturnType<typeof vi.fn>;

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

const baseQuiz: Quiz & { questions: Question[] } = {
  id: 5,
  authorNickname: 'author',
  title: '테스트 퀴즈',
  description: '설명',
  category: 'general',
  thumbnailKey: null,
  thumbnailUrl: null,
  playCount: 10,
  starCount: 7,
  commentCount: 2,
  shareCount: 3,
  isStarred: false,
  isPublic: true,
  createdAt: '2026-05-01T00:00:00Z',
  questions: [baseQuestion],
};

const baseResult: AttemptResponse = {
  id: 1,
  quizId: 5,
  score: 3,
  totalQuestions: 5,
  percent: 60,
  topPercentile: 25,
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

const baseUser: User = {
  id: 1,
  email: 'me@example.com',
  nickname: 'me',
  provider: 'GOOGLE',
  profileImageKey: null,
  profileImageUrl: null,
  isProfilePublic: true,
  createdAt: '2026-01-01T00:00:00Z',
};

const baseComments: Comment[] = [
  {
    id: 11,
    content: '첫 댓글',
    authorPublicId: 'uuid-a',
    authorNickname: 'someone',
    authorProfileImageUrl: null,
    createdAt: '2026-05-07T01:00:00Z',
    updatedAt: '2026-05-07T01:00:00Z',
  },
];

const distributionEmpty: QuizScoreDistribution = {
  totalAttempts: 0,
  averageScore: 0,
  distribution: [],
};

const distributionFilled: QuizScoreDistribution = {
  totalAttempts: 42,
  averageScore: 3.4,
  distribution: [
    { score: 0, count: 1 },
    { score: 1, count: 3 },
    { score: 2, count: 8 },
    { score: 3, count: 15 },
    { score: 4, count: 10 },
    { score: 5, count: 5 },
  ],
};

// 호출 인자 추적용
const mockToggleStarFn = vi.fn();
const mockShareFn = vi.fn();
const mockCreateComment = vi.fn();
const mockRemoveComment = vi.fn();

// 기본 상태 셋업
const setupDefaults = (overrides?: {
  isLoggedIn?: boolean;
  user?: User | null;
  quiz?: (Quiz & { questions: Question[] }) | undefined;
  distribution?: QuizScoreDistribution | undefined;
  pendingQuizId?: number | null;
  comments?: Comment[];
  totalElements?: number;
  isMutating?: boolean;
  mutationError?: string | null;
}) => {
  // `quiz` 키가 명시적으로 들어왔으면 (undefined 포함) 그대로 사용, 없으면 baseQuiz
  const quiz = overrides && 'quiz' in overrides ? overrides.quiz : baseQuiz;
  mockUseQuizDetail.mockReturnValue({
    quiz,
    isLoading: false,
    error: undefined,
  });
  mockUseQuizScoreDistribution.mockReturnValue({
    data: overrides?.distribution,
    isLoading: false,
    error: undefined,
  });
  mockUseToggleStar.mockReturnValue({
    toggle: mockToggleStarFn,
    pendingQuizId: overrides?.pendingQuizId ?? null,
    error: null,
  });
  mockUseShareQuiz.mockReturnValue({ share: mockShareFn });
  mockUseComments.mockReturnValue({
    comments: overrides?.comments ?? baseComments,
    totalElements: overrides?.totalElements ?? overrides?.comments?.length ?? baseComments.length,
    totalPages: 1,
    isLoading: false,
    error: null,
    create: mockCreateComment,
    remove: mockRemoveComment,
    isMutating: overrides?.isMutating ?? false,
    mutationError: overrides?.mutationError ?? null,
  });
  const loggedIn = overrides?.isLoggedIn ?? true;
  mockUseAuthStore.mockReturnValue({
    user: overrides?.user === undefined ? (loggedIn ? baseUser : null) : overrides.user,
    isLoggedIn: loggedIn,
  });
};

// -------------------------------------------------------------------

describe('QuizResultPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToggleStarFn.mockResolvedValue(undefined);
    mockShareFn.mockResolvedValue('copied');
    mockCreateComment.mockResolvedValue({ id: 999 });
    mockRemoveComment.mockResolvedValue(true);
  });

  // ── state 없음 → redirect ────────────────────────────────────────
  describe('router state 없음', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({ state: null, pathname: '/quiz/5/result' });
      setupDefaults();
    });

    it('navigate("/", { replace: true }) 를 호출한다', () => {
      renderWithTheme(<QuizResultPage />);
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('ResultHeader / ResultActions / 댓글 섹션을 렌더하지 않는다', () => {
      renderWithTheme(<QuizResultPage />);
      expect(screen.queryByTestId('result-header')).not.toBeInTheDocument();
      expect(screen.queryByTestId('result-actions')).not.toBeInTheDocument();
      expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument();
      expect(screen.queryByTestId('comment-list')).not.toBeInTheDocument();
    });
  });

  // ── 기본 마운트 ────────────────────────────────────────────────
  describe('router state 있음 — 기본 마운트', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        state: { result: baseResult, questions: [baseQuestion] },
        pathname: '/quiz/5/result',
      });
      setupDefaults();
    });

    it('navigate 를 호출하지 않는다', () => {
      renderWithTheme(<QuizResultPage />);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('ResultHeader / ResultActions / 댓글 폼·리스트가 마운트된다', () => {
      renderWithTheme(<QuizResultPage />);
      expect(screen.getByTestId('result-header')).toBeInTheDocument();
      expect(screen.getByTestId('result-actions')).toBeInTheDocument();
      expect(screen.getByTestId('comment-form')).toBeInTheDocument();
      expect(screen.getByTestId('comment-list')).toBeInTheDocument();
    });

    it('ResultHeader 에 score / totalQuestions / topPercentile 을 전달한다', () => {
      renderWithTheme(<QuizResultPage />);
      const header = screen.getByTestId('result-header');
      expect(header).toHaveAttribute('data-score', String(baseResult.score));
      expect(header).toHaveAttribute('data-total', String(baseResult.totalQuestions));
      expect(header).toHaveAttribute('data-top-percentile', String(baseResult.topPercentile));
    });

    it('ResultHeader 에 topPercentile=null 을 그대로 전달한다 (첫 응시자)', () => {
      mockUseLocation.mockReturnValue({
        state: {
          result: { ...baseResult, topPercentile: null },
          questions: [baseQuestion],
        },
        pathname: '/quiz/5/result',
      });
      renderWithTheme(<QuizResultPage />);
      expect(screen.getByTestId('result-header')).toHaveAttribute('data-top-percentile', 'null');
    });

    it('ResultActions 에 quiz 의 starred / starCount / shareCount 를 전달한다', () => {
      renderWithTheme(<QuizResultPage />);
      const actions = screen.getByTestId('result-actions');
      expect(actions).toHaveAttribute('data-starred', 'false');
      expect(actions).toHaveAttribute('data-star-count', String(baseQuiz.starCount));
      expect(actions).toHaveAttribute('data-share-count', String(baseQuiz.shareCount));
      expect(actions).toHaveAttribute('data-star-disabled', 'false');
    });

    it('pendingQuizId 가 현재 quizId 와 같으면 ResultActions 의 starDisabled=true', () => {
      setupDefaults({ pendingQuizId: 5 });
      renderWithTheme(<QuizResultPage />);
      expect(screen.getByTestId('result-actions')).toHaveAttribute('data-star-disabled', 'true');
    });

    it('quiz=undefined 일 때 starCount/shareCount 는 0 으로 폴백된다', () => {
      setupDefaults({ quiz: undefined });
      renderWithTheme(<QuizResultPage />);
      const actions = screen.getByTestId('result-actions');
      expect(actions).toHaveAttribute('data-star-count', '0');
      expect(actions).toHaveAttribute('data-share-count', '0');
      expect(actions).toHaveAttribute('data-starred', 'false');
    });
  });

  // ── ResultDistribution 조건부 마운트 ──────────────────────────────
  describe('ResultDistribution 조건부 마운트', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        state: { result: baseResult, questions: [baseQuestion] },
        pathname: '/quiz/5/result',
      });
    });

    it('distribution undefined (로딩 중) 이면 마운트되지 않는다', () => {
      setupDefaults({ distribution: undefined });
      renderWithTheme(<QuizResultPage />);
      expect(screen.queryByTestId('result-distribution')).not.toBeInTheDocument();
    });

    it('distribution.totalAttempts=0 이면 마운트되지 않는다', () => {
      setupDefaults({ distribution: distributionEmpty });
      renderWithTheme(<QuizResultPage />);
      expect(screen.queryByTestId('result-distribution')).not.toBeInTheDocument();
    });

    it('distribution.totalAttempts>0 이면 마운트되고 props 가 전달된다', () => {
      setupDefaults({ distribution: distributionFilled });
      renderWithTheme(<QuizResultPage />);
      const dist = screen.getByTestId('result-distribution');
      expect(dist).toHaveAttribute('data-total-attempts', String(distributionFilled.totalAttempts));
      expect(dist).toHaveAttribute('data-my-score', String(baseResult.score));
      expect(dist).toHaveAttribute('data-top-percentile', String(baseResult.topPercentile));
    });
  });

  // ── 다시 풀기 ────────────────────────────────────────────────────
  describe('다시 풀기 클릭', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        state: { result: baseResult, questions: [baseQuestion] },
        pathname: '/quiz/5/result',
      });
      setupDefaults();
    });

    it('navigate("/quiz/5") 를 호출한다', () => {
      renderWithTheme(<QuizResultPage />);
      fireEvent.click(screen.getByRole('button', { name: '다시 풀기' }));
      expect(mockNavigate).toHaveBeenCalledWith('/quiz/5');
    });
  });

  // ── 스타 클릭 ────────────────────────────────────────────────────
  describe('스타 클릭', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        state: { result: baseResult, questions: [baseQuestion] },
        pathname: '/quiz/5/result',
      });
    });

    it('비로그인 상태에서는 LoginPromptModal 이 열린다', () => {
      setupDefaults({ isLoggedIn: false, user: null });
      renderWithTheme(<QuizResultPage />);
      expect(screen.queryByTestId('login-prompt-modal')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '스타' }));
      expect(screen.getByTestId('login-prompt-modal')).toBeInTheDocument();
      expect(mockToggleStarFn).not.toHaveBeenCalled();
    });

    it('비로그인 상태 모달의 title/message 가 스타 안내 문구다', () => {
      setupDefaults({ isLoggedIn: false, user: null });
      renderWithTheme(<QuizResultPage />);
      fireEvent.click(screen.getByRole('button', { name: '스타' }));
      const modal = screen.getByTestId('login-prompt-modal');
      expect(modal).toHaveAttribute('data-title', '로그인이 필요해요');
      expect(modal).toHaveAttribute(
        'data-message',
        '로그인하고 스타를 눌러 좋아하는 퀴즈를 모아보세요.',
      );
    });

    it('로그인 상태에서는 toggleStar(quizId, isStarred) 를 호출한다', async () => {
      setupDefaults({ isLoggedIn: true, quiz: { ...baseQuiz, isStarred: false } });
      renderWithTheme(<QuizResultPage />);
      fireEvent.click(screen.getByRole('button', { name: '스타' }));
      await waitFor(() => expect(mockToggleStarFn).toHaveBeenCalledWith(5, false));
    });

    it('로그인 상태 + isStarred=true 이면 toggleStar(quizId, true) 를 호출한다', async () => {
      setupDefaults({ isLoggedIn: true, quiz: { ...baseQuiz, isStarred: true } });
      renderWithTheme(<QuizResultPage />);
      fireEvent.click(screen.getByRole('button', { name: '스타' }));
      await waitFor(() => expect(mockToggleStarFn).toHaveBeenCalledWith(5, true));
    });

    it('로그인 상태지만 quiz 가 아직 로드되지 않았다면 toggleStar 를 호출하지 않는다', () => {
      setupDefaults({ isLoggedIn: true, quiz: undefined });
      renderWithTheme(<QuizResultPage />);
      fireEvent.click(screen.getByRole('button', { name: '스타' }));
      expect(mockToggleStarFn).not.toHaveBeenCalled();
    });

    it('toggleStar reject 해도 페이지 자체는 throw 하지 않는다 (silent)', async () => {
      mockToggleStarFn.mockRejectedValueOnce(new Error('boom'));
      setupDefaults({ isLoggedIn: true });
      renderWithTheme(<QuizResultPage />);
      fireEvent.click(screen.getByRole('button', { name: '스타' }));
      await waitFor(() => expect(mockToggleStarFn).toHaveBeenCalled());
      // 페이지가 여전히 살아있는지
      expect(screen.getByTestId('result-actions')).toBeInTheDocument();
    });
  });

  // ── 공유 클릭 ────────────────────────────────────────────────────
  describe('공유 클릭', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        state: { result: baseResult, questions: [baseQuestion] },
        pathname: '/quiz/5/result',
      });
      setupDefaults();
    });

    it('share() resolve="copied" → toast.success("링크가 복사되었어요")', async () => {
      mockShareFn.mockResolvedValueOnce('copied');
      renderWithTheme(<QuizResultPage />);
      fireEvent.click(screen.getByRole('button', { name: '공유' }));
      await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledWith('링크가 복사되었어요'));
      expect(mockToastError).not.toHaveBeenCalled();
    });

    it('share() resolve="failed" → toast.error("링크 복사에 실패했어요")', async () => {
      mockShareFn.mockResolvedValueOnce('failed');
      renderWithTheme(<QuizResultPage />);
      fireEvent.click(screen.getByRole('button', { name: '공유' }));
      await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('링크 복사에 실패했어요'));
      expect(mockToastSuccess).not.toHaveBeenCalled();
    });
  });

  // ── 댓글 작성 / 삭제 ──────────────────────────────────────────────
  describe('댓글 작성 / 삭제', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        state: { result: baseResult, questions: [baseQuestion] },
        pathname: '/quiz/5/result',
      });
      setupDefaults();
    });

    it('CommentForm onSubmit → create(content) 호출', async () => {
      renderWithTheme(<QuizResultPage />);
      fireEvent.click(screen.getByRole('button', { name: '댓글 제출' }));
      await waitFor(() => expect(mockCreateComment).toHaveBeenCalledWith('hi from form'));
    });

    it('CommentList onDelete → remove(commentId) 호출', async () => {
      renderWithTheme(<QuizResultPage />);
      fireEvent.click(screen.getByRole('button', { name: '댓글삭제 11' }));
      await waitFor(() => expect(mockRemoveComment).toHaveBeenCalledWith(11));
    });

    it('CommentForm 에 로그인 / 닉네임 / isSubmitting 을 전달한다', () => {
      setupDefaults({ isLoggedIn: true, isMutating: true });
      renderWithTheme(<QuizResultPage />);
      const form = screen.getByTestId('comment-form');
      expect(form).toHaveAttribute('data-logged-in', 'true');
      expect(form).toHaveAttribute('data-nickname', baseUser.nickname);
      expect(form).toHaveAttribute('data-submitting', 'true');
    });

    it('CommentList 에 currentUserNickname / isMutating 을 전달한다', () => {
      setupDefaults({ isLoggedIn: true, isMutating: true });
      renderWithTheme(<QuizResultPage />);
      const list = screen.getByTestId('comment-list');
      expect(list).toHaveAttribute('data-current-nickname', baseUser.nickname);
      expect(list).toHaveAttribute('data-mutating', 'true');
      expect(list).toHaveAttribute('data-count', String(baseComments.length));
    });

    it('비로그인 상태에서는 CommentList 의 currentUserNickname 이 빈 문자열로 폴백된다', () => {
      setupDefaults({ isLoggedIn: false, user: null });
      renderWithTheme(<QuizResultPage />);
      expect(screen.getByTestId('comment-list')).toHaveAttribute('data-current-nickname', '');
      expect(screen.getByTestId('comment-form')).toHaveAttribute('data-logged-in', 'false');
    });
  });

  // ── mutationError 메시지 매핑 ────────────────────────────────────
  describe('mutationError → 에러 메시지 매핑', () => {
    beforeEach(() => {
      mockUseLocation.mockReturnValue({
        state: { result: baseResult, questions: [baseQuestion] },
        pathname: '/quiz/5/result',
      });
    });

    it('INVALID_COMMENT_FORMAT → 형식 안내 메시지', () => {
      setupDefaults({ mutationError: 'INVALID_COMMENT_FORMAT' });
      renderWithTheme(<QuizResultPage />);
      expect(screen.getByTestId('comment-form-error')).toHaveTextContent(
        '댓글 형식이 올바르지 않아요. 1~500자 이내로 입력해주세요.',
      );
    });

    it('UNAUTHORIZED → 로그인 필요 메시지', () => {
      setupDefaults({ mutationError: 'UNAUTHORIZED' });
      renderWithTheme(<QuizResultPage />);
      expect(screen.getByTestId('comment-form-error')).toHaveTextContent('로그인이 필요해요.');
    });

    it('NETWORK → 네트워크 오류 메시지', () => {
      setupDefaults({ mutationError: 'NETWORK' });
      renderWithTheme(<QuizResultPage />);
      expect(screen.getByTestId('comment-form-error')).toHaveTextContent(
        '네트워크 오류로 댓글을 작성하지 못했어요.',
      );
    });

    it('mutationError=null 이면 에러 메시지가 노출되지 않는다', () => {
      setupDefaults({ mutationError: null });
      renderWithTheme(<QuizResultPage />);
      expect(screen.queryByTestId('comment-form-error')).not.toBeInTheDocument();
    });
  });
});
