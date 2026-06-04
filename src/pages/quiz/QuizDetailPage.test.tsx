import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { renderWithTheme } from '@/test/renderWithTheme';
import type { Quiz, Question, Comment } from '@/types';
import QuizDetailPage from './QuizDetailPage';

// ── react-router-dom mock ─────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '99' }),
  };
});

// ── hooks mock ────────────────────────────────────────────────────────────────
const mockUseQuizDetail = vi.hoisted(() => vi.fn());
const mockUseComments = vi.hoisted(() => vi.fn());
const mockUseAuthStore = vi.hoisted(() => vi.fn());
const mockUseToggleStar = vi.hoisted(() => vi.fn());
const mockUseShareQuiz = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useQuizDetail', () => ({ default: mockUseQuizDetail }));
vi.mock('@/hooks/useComments', () => ({ default: mockUseComments }));
vi.mock('@/store/authStore', () => ({ default: mockUseAuthStore }));
vi.mock('@/hooks/useToggleStar', () => ({ default: mockUseToggleStar }));
vi.mock('@/hooks/useShareQuiz', () => ({ default: mockUseShareQuiz }));

// ── ProfileModal mock — publicId prop 전달 검증 (SWR fetch 회피) ────────────────
const mockProfileModal = vi.hoisted(() => vi.fn());

vi.mock('@/components/profile-modal', () => ({
  default: (props: { publicId: string | null; onClose: () => void }) => {
    mockProfileModal(props);
    return props.publicId != null ? (
      <div role="dialog" aria-label="프로필" data-public-id={props.publicId}>
        <button type="button" onClick={props.onClose}>
          닫기
        </button>
      </div>
    ) : null;
  },
}));

// ── CommentList mock — onAuthorClick 트리거용 ───────────────────────────────────
const mockCommentListAuthorClick = vi.hoisted(() => ({
  current: null as null | ((publicId: string) => void),
}));

vi.mock('@/features/quiz/comment', () => ({
  CommentList: ({ onAuthorClick }: { onAuthorClick?: (publicId: string) => void }) => {
    mockCommentListAuthorClick.current = onAuthorClick ?? null;
    return (
      <ul aria-label="댓글 목록">
        <li>
          <button type="button" onClick={() => onAuthorClick?.('comment-pub-456')}>
            댓글작성자 프로필 보기
          </button>
        </li>
      </ul>
    );
  },
  CommentForm: () => <div data-testid="comment-form" />,
}));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const MOCK_QUESTION: Question = {
  id: 11,
  quizId: 99,
  orderNum: 0,
  imageKey: null,
  imageUrl: null,
  answerImageKey: null,
  answerImageUrl: null,
  questionText: '1번 질문',
  answer: '정답1',
};

const MOCK_QUIZ: Quiz & { questions: Question[] } = {
  id: 99,
  publicId: 'quiz-pub-1',
  authorNickname: '만든이닉',
  authorPublicId: 'author-pub-123',
  authorProfileImageUrl: null,
  title: '테스트 퀴즈',
  description: '퀴즈 설명',
  category: 'general',
  thumbnailUrl: null,
  playCount: 10,
  starCount: 3,
  commentCount: 1,
  shareCount: 2,
  isStarred: false,
  isPublic: true,
  createdAt: '2026-01-01T00:00:00Z',
  questions: [MOCK_QUESTION],
};

const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    content: '좋아요',
    authorPublicId: 'comment-pub-456',
    authorNickname: '댓글러',
    authorProfileImageUrl: null,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
];

const renderPage = () =>
  renderWithTheme(
    <MemoryRouter>
      <QuizDetailPage />
    </MemoryRouter>,
  );

describe('QuizDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCommentListAuthorClick.current = null;
    mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    mockUseComments.mockReturnValue({
      comments: MOCK_COMMENTS,
      totalElements: 1,
      create: vi.fn(),
      remove: vi.fn(),
      isMutating: false,
      mutationError: null,
    });
    mockUseAuthStore.mockReturnValue({
      isLoggedIn: true,
      user: { nickname: '나', profileImageUrl: null },
    });
    mockUseToggleStar.mockReturnValue({ toggle: vi.fn(), pendingQuizId: null });
    mockUseShareQuiz.mockReturnValue({ share: vi.fn() });
  });

  describe('기본 렌더', () => {
    it('퀴즈 제목과 만든이 닉네임이 보인다', () => {
      renderPage();
      expect(screen.getByRole('heading', { level: 1, name: '테스트 퀴즈' })).toBeInTheDocument();
      expect(screen.getByText('만든이닉')).toBeInTheDocument();
    });

    it('초기에는 프로필 모달이 닫혀 있다 (publicId=null)', () => {
      renderPage();
      expect(screen.queryByRole('dialog', { name: '프로필' })).not.toBeInTheDocument();
      expect(mockProfileModal).toHaveBeenCalledWith(expect.objectContaining({ publicId: null }));
    });
  });

  describe('만든이 프로필 모달', () => {
    it('만든이 프로필 버튼 클릭 시 ProfileModal 이 quiz.authorPublicId 로 열린다', async () => {
      renderPage();
      await userEvent.click(screen.getByRole('button', { name: '만든이닉 프로필 보기' }));

      const dialog = screen.getByRole('dialog', { name: '프로필' });
      expect(dialog).toHaveAttribute('data-public-id', 'author-pub-123');
      expect(mockProfileModal).toHaveBeenLastCalledWith(
        expect.objectContaining({ publicId: 'author-pub-123' }),
      );
    });

    it('authorPublicId 가 없으면 만든이 버튼이 disabled 라 모달이 열리지 않는다', async () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: { ...MOCK_QUIZ, authorPublicId: undefined },
        isLoading: false,
        error: null,
      });
      renderPage();
      const btn = screen.getByRole('button', { name: '만든이닉 프로필 보기' });
      expect(btn).toBeDisabled();
      await userEvent.click(btn);
      expect(screen.queryByRole('dialog', { name: '프로필' })).not.toBeInTheDocument();
    });
  });

  describe('댓글 작성자 프로필 모달', () => {
    it('댓글 작성자 클릭 시 ProfileModal 이 댓글 작성자 publicId 로 열린다', async () => {
      renderPage();
      await userEvent.click(screen.getByRole('button', { name: '댓글작성자 프로필 보기' }));

      const dialog = screen.getByRole('dialog', { name: '프로필' });
      expect(dialog).toHaveAttribute('data-public-id', 'comment-pub-456');
      expect(mockProfileModal).toHaveBeenLastCalledWith(
        expect.objectContaining({ publicId: 'comment-pub-456' }),
      );
    });

    it('CommentList 에 onAuthorClick 핸들러가 전달된다', () => {
      renderPage();
      expect(mockCommentListAuthorClick.current).toBeTypeOf('function');
    });
  });

  describe('로딩 / 에러', () => {
    it('isLoading=true 이면 "로딩 중..." 이 보인다', () => {
      mockUseQuizDetail.mockReturnValue({ quiz: undefined, isLoading: true, error: null });
      renderPage();
      expect(screen.getByText('로딩 중...')).toBeInTheDocument();
    });

    it('quiz 없음(error=null) 이면 안내 문구가 보인다', () => {
      mockUseQuizDetail.mockReturnValue({ quiz: undefined, isLoading: false, error: null });
      renderPage();
      expect(screen.getByText('퀴즈를 불러오지 못했습니다.')).toBeInTheDocument();
    });
  });
});
