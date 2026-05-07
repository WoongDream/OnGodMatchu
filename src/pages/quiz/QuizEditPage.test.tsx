import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { Quiz, Question, User } from '@/types';
import QuizEditPage from './QuizEditPage';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseParams = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams,
  };
});

// ── useQuizDetail mock ────────────────────────────────────────────────────────
const mockUseQuizDetail = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useQuizDetail', () => ({
  default: mockUseQuizDetail,
}));

// ── useUpdateQuiz mock ────────────────────────────────────────────────────────
const mockSubmit = vi.hoisted(() => vi.fn());
const mockUseUpdateQuiz = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useUpdateQuiz', () => ({
  default: mockUseUpdateQuiz,
}));

// ── useAuthStore mock ─────────────────────────────────────────────────────────
const mockUseAuthStore = vi.hoisted(() => vi.fn());

vi.mock('@/store/authStore', () => ({
  default: (selector: (s: { user: User | null }) => unknown) => mockUseAuthStore(selector),
}));

// ── child components mock ─────────────────────────────────────────────────────
vi.mock('@/features/quiz/create/QuizInfoForm', () => ({
  default: ({
    title,
    description,
    category,
    onTitleChange,
    onDescriptionChange,
    onCategoryChange,
    belowTitleSlot,
  }: {
    title: string;
    description: string;
    category: string | null;
    thumbnailPreviewUrl: string | null;
    onTitleChange: (v: string) => void;
    onDescriptionChange: (v: string) => void;
    onCategoryChange: (v: string) => void;
    onThumbnailChange: (file: File, url: string) => void;
    onThumbnailRemove: () => void;
    belowTitleSlot?: React.ReactNode;
  }) =>
    React.createElement(
      'div',
      { 'data-testid': 'quiz-info-form' },
      React.createElement('input', {
        'aria-label': '제목 입력',
        value: title,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value),
      }),
      belowTitleSlot,
      React.createElement('input', {
        'aria-label': '설명 입력',
        value: description,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => onDescriptionChange(e.target.value),
      }),
      React.createElement('span', { 'data-testid': 'category-value' }, category ?? ''),
      React.createElement('button', { onClick: () => onCategoryChange('movie') }, '카테고리 변경'),
    ),
}));

vi.mock('@/components/toggle', () => ({
  default: ({
    checked,
    onChange,
    ariaLabel,
  }: {
    checked: boolean;
    onChange: (next: boolean) => void;
    ariaLabel: string;
  }) =>
    React.createElement('button', {
      role: 'switch',
      'aria-label': ariaLabel,
      'aria-checked': String(checked),
      onClick: () => onChange(!checked),
    }),
}));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const MOCK_USER: User = {
  id: 1,
  email: 'author@example.com',
  nickname: 'authorNick',
  provider: 'LOCAL',
  isProfilePublic: true,
  createdAt: '2025-01-01T00:00:00Z',
};

const MOCK_QUIZ: Quiz & { questions: Question[] } = {
  id: 99,
  authorNickname: 'authorNick',
  title: '테스트 퀴즈',
  description: '퀴즈 설명',
  category: 'general',
  thumbnailUrl: null,
  playCount: 0,
  isPublic: true,
  createdAt: '2025-01-01T00:00:00Z',
  questions: [],
};

const DEFAULT_UPDATE_RETURN = {
  submit: mockSubmit,
  isSubmitting: false,
  error: null,
  errorCode: null,
  clearError: vi.fn(),
};

// ── render 헬퍼 ───────────────────────────────────────────────────────────────
const renderPage = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <QuizEditPage />
      </MemoryRouter>
    </ThemeProvider>,
  );

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('QuizEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '99' });
    mockUseUpdateQuiz.mockReturnValue(DEFAULT_UPDATE_RETURN);
    mockSubmit.mockResolvedValue(MOCK_QUIZ);
    // authStore selector — user 반환
    mockUseAuthStore.mockImplementation((selector: (s: { user: User | null }) => unknown) =>
      selector({ user: MOCK_USER }),
    );
  });

  describe('로딩 상태', () => {
    it('isLoading=true 이면 "퀴즈를 불러오는 중..." 이 보인다', () => {
      mockUseQuizDetail.mockReturnValue({ quiz: undefined, isLoading: true, error: null });
      renderPage();
      expect(screen.getByText('퀴즈를 불러오는 중...')).toBeInTheDocument();
    });

    it('로딩 중에는 QuizInfoForm 이 렌더되지 않는다', () => {
      mockUseQuizDetail.mockReturnValue({ quiz: undefined, isLoading: true, error: null });
      renderPage();
      expect(screen.queryByTestId('quiz-info-form')).not.toBeInTheDocument();
    });
  });

  describe('로드 에러 / quiz 없음', () => {
    it('error 있으면 "퀴즈를 불러오지 못했습니다." 가 보인다', () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: undefined,
        isLoading: false,
        error: new Error('404'),
      });
      renderPage();
      expect(screen.getByText('퀴즈를 불러오지 못했습니다.')).toBeInTheDocument();
    });

    it('에러 시 "목록으로" 링크가 렌더된다', () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: undefined,
        isLoading: false,
        error: new Error('404'),
      });
      renderPage();
      expect(screen.getByRole('link', { name: '목록으로' })).toBeInTheDocument();
    });

    it('quiz=undefined && error=null 이면 "퀴즈를 불러오지 못했습니다." 가 보인다', () => {
      mockUseQuizDetail.mockReturnValue({ quiz: undefined, isLoading: false, error: null });
      renderPage();
      expect(screen.getByText('퀴즈를 불러오지 못했습니다.')).toBeInTheDocument();
    });
  });

  describe('권한 없는 사용자', () => {
    it('me.nickname !== quiz.authorNickname 이면 "편집할 권한이 없습니다." 가 보인다', () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: { ...MOCK_QUIZ, authorNickname: 'anotherUser' },
        isLoading: false,
        error: null,
      });
      renderPage();
      expect(screen.getByText(/편집할 권한이 없습니다\./)).toBeInTheDocument();
    });

    it('권한 없는 경우 "목록으로" 링크가 렌더된다', () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: { ...MOCK_QUIZ, authorNickname: 'anotherUser' },
        isLoading: false,
        error: null,
      });
      renderPage();
      expect(screen.getByRole('link', { name: '목록으로' })).toBeInTheDocument();
    });

    it('me=null(비로그인)이면 권한 없음 안내가 보인다', () => {
      mockUseAuthStore.mockImplementation((selector: (s: { user: User | null }) => unknown) =>
        selector({ user: null }),
      );
      mockUseQuizDetail.mockReturnValue({
        quiz: MOCK_QUIZ,
        isLoading: false,
        error: null,
      });
      renderPage();
      expect(screen.getByText(/편집할 권한이 없습니다\./)).toBeInTheDocument();
    });
  });

  describe('폼 prefill (작성자 본인)', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('제목 input 이 quiz.title 로 초기화된다', () => {
      renderPage();
      expect(screen.getByRole('textbox', { name: '제목 입력' })).toHaveValue('테스트 퀴즈');
    });

    it('설명 input 이 quiz.description 으로 초기화된다', () => {
      renderPage();
      expect(screen.getByRole('textbox', { name: '설명 입력' })).toHaveValue('퀴즈 설명');
    });

    it('카테고리가 quiz.category 로 초기화된다', () => {
      renderPage();
      expect(screen.getByTestId('category-value')).toHaveTextContent('general');
    });

    it('isPublic=true 이면 공개 설정 토글이 checked 다', () => {
      renderPage();
      expect(screen.getByRole('switch', { name: '공개 설정' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });

    it('isPublic=false 이면 공개 설정 토글이 unchecked 다', () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: { ...MOCK_QUIZ, isPublic: false },
        isLoading: false,
        error: null,
      });
      renderPage();
      expect(screen.getByRole('switch', { name: '공개 설정' })).toHaveAttribute(
        'aria-checked',
        'false',
      );
    });
  });

  describe('저장 버튼 활성 조건', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('제목이 있으면 저장 버튼이 활성화된다', () => {
      renderPage();
      const saveBtn = screen.getByRole('button', { name: '변경 사항 저장' });
      expect(saveBtn).not.toBeDisabled();
    });

    it('제목을 비우면 저장 버튼이 disabled 된다', () => {
      renderPage();
      fireEvent.change(screen.getByRole('textbox', { name: '제목 입력' }), {
        target: { value: '' },
      });
      expect(screen.getByRole('button', { name: '변경 사항 저장' })).toBeDisabled();
    });

    it('isSubmitting=true 이면 저장 버튼이 disabled 된다', () => {
      mockUseUpdateQuiz.mockReturnValue({
        ...DEFAULT_UPDATE_RETURN,
        isSubmitting: true,
      });
      renderPage();
      expect(screen.getByRole('button', { name: '저장 중...' })).toBeDisabled();
    });
  });

  describe('저장 버튼 클릭', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('저장 클릭 시 submit 이 올바른 인자로 호출된다', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '변경 사항 저장' }));
      await waitFor(() =>
        expect(mockSubmit).toHaveBeenCalledWith(
          99,
          expect.objectContaining({ title: '테스트 퀴즈' }),
        ),
      );
    });

    it('submit 성공 시 navigate("/quiz/99") 가 호출된다', async () => {
      mockSubmit.mockResolvedValue(MOCK_QUIZ);
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '변경 사항 저장' }));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/quiz/99'));
    });

    it('submit 이 null 을 반환하면(실패) navigate 가 호출되지 않는다', async () => {
      mockSubmit.mockResolvedValue(null);
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '변경 사항 저장' }));
      await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('취소 버튼', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('취소 버튼 클릭 시 navigate(-1) 이 호출된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '취소' }));
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('submit 에러 배너', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('useUpdateQuiz.error 가 있으면 role=alert 로 에러 배너가 보인다', () => {
      mockUseUpdateQuiz.mockReturnValue({
        ...DEFAULT_UPDATE_RETURN,
        error: '퀴즈를 찾을 수 없어요.',
      });
      renderPage();
      expect(screen.getByRole('alert')).toHaveTextContent('퀴즈를 찾을 수 없어요.');
    });

    it('error=null 이면 에러 배너가 보이지 않는다', () => {
      renderPage();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('공개 설정 토글 상호작용', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('토글 클릭 시 isPublic 상태가 반전된다', () => {
      renderPage();
      const toggle = screen.getByRole('switch', { name: '공개 설정' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });
  });
});
