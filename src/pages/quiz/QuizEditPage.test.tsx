import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, waitFor, fireEvent } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import type { Quiz, Question, User } from '@/types';
import QuizEditPage from './QuizEditPage';
import { EMPTY_SLOT } from '@/lib/image/imageSlot';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseParams = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
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

// ── swr mock ──────────────────────────────────────────────────────────────────
const mockMutate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  return {
    ...actual,
    useSWRConfig: () => ({ mutate: mockMutate }),
  };
});

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
  starCount: 0,
  commentCount: 0,
  shareCount: 0,
  isStarred: null,
  isPublic: true,
  createdAt: '2025-01-01T00:00:00Z',
  questions: [
    {
      id: 11,
      quizId: 99,
      orderNum: 0,
      imageKey: null,
      imageUrl: null,
      answerImageKey: null,
      answerImageUrl: null,
      questionText: '1번 질문',
      answer: '정답1',
    },
  ],
};

const TWO_QUESTIONS_QUIZ: Quiz & { questions: Question[] } = {
  ...MOCK_QUIZ,
  questions: [
    {
      id: 11,
      quizId: 99,
      orderNum: 0,
      imageKey: 'qkey-1',
      imageUrl: 'https://cdn/q1.png',
      answerImageKey: 'qkey-1',
      answerImageUrl: 'https://cdn/q1.png',
      questionText: '첫 번째 문제 텍스트',
      answer: '정답1',
    },
    {
      id: 12,
      quizId: 99,
      orderNum: 1,
      imageKey: null,
      imageUrl: null,
      answerImageKey: null,
      answerImageUrl: null,
      questionText: '두 번째 문제 텍스트',
      answer: '정답2',
    },
  ],
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
  renderWithTheme(
    <MemoryRouter>
      <QuizEditPage />
    </MemoryRouter>,
  );

const goToQuestionsStep = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: '문제 목록 ›' }));
};

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('QuizEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '99' });
    mockUseUpdateQuiz.mockReturnValue(DEFAULT_UPDATE_RETURN);
    mockSubmit.mockResolvedValue(MOCK_QUIZ);
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

    it('로딩 중에는 Stepper / QuizForm 이 렌더되지 않는다', () => {
      mockUseQuizDetail.mockReturnValue({ quiz: undefined, isLoading: true, error: null });
      renderPage();
      expect(
        screen.queryByRole('navigation', { name: '퀴즈 만들기 진행' }),
      ).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '문제 목록 ›' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '변경 사항 저장' })).not.toBeInTheDocument();
    });
  });

  describe('로드 에러 / quiz 없음', () => {
    it('error 있으면 "퀴즈를 불러오지 못했습니다." + "목록으로" 링크가 보인다', () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: undefined,
        isLoading: false,
        error: new Error('404'),
      });
      renderPage();
      expect(screen.getByText('퀴즈를 불러오지 못했습니다.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '목록으로' })).toBeInTheDocument();
    });

    it('quiz=undefined && error=null 이어도 "퀴즈를 불러오지 못했습니다." 가 보인다', () => {
      mockUseQuizDetail.mockReturnValue({ quiz: undefined, isLoading: false, error: null });
      renderPage();
      expect(screen.getByText('퀴즈를 불러오지 못했습니다.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '목록으로' })).toBeInTheDocument();
    });
  });

  describe('권한 없는 사용자', () => {
    it('me.nickname !== quiz.authorNickname 이면 권한 안내가 보인다', () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: { ...MOCK_QUIZ, authorNickname: 'anotherUser' },
        isLoading: false,
        error: null,
      });
      renderPage();
      expect(screen.getByText(/편집할 권한이 없습니다\./)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '목록으로' })).toBeInTheDocument();
    });

    it('me=null(비로그인)이면 권한 안내가 보인다', () => {
      mockUseAuthStore.mockImplementation((selector: (s: { user: User | null }) => unknown) =>
        selector({ user: null }),
      );
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
      renderPage();
      expect(screen.getByText(/편집할 권한이 없습니다\./)).toBeInTheDocument();
    });
  });

  describe('초기 진입 (STEP 1 / info)', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('Stepper + "문제 목록 ›" 버튼 노출, "변경 사항 저장" 버튼은 미노출', () => {
      renderPage();
      expect(screen.getByRole('navigation', { name: '퀴즈 만들기 진행' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문제 목록 ›' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '변경 사항 저장' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '‹ 퀴즈 정보' })).not.toBeInTheDocument();
    });

    it('제목/설명 input 이 quiz 값으로 prefill 된다', () => {
      renderPage();
      expect(screen.getByPlaceholderText('퀴즈 제목을 입력하세요')).toHaveValue('테스트 퀴즈');
      expect(screen.getByPlaceholderText('퀴즈에 대한 설명을 입력하세요')).toHaveValue('퀴즈 설명');
    });

    it('isPublic=true 이면 공개 설정 토글이 checked, false 이면 unchecked', () => {
      renderPage();
      expect(screen.getByRole('switch', { name: '공개 설정' })).toHaveAttribute(
        'aria-checked',
        'true',
      );
    });

    it('isPublic=false prefill 시 토글 unchecked', () => {
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

  describe('STEP 1 → STEP 2 전환', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('"문제 목록 ›" 클릭 시 "변경 사항 저장" + "‹ 퀴즈 정보" 버튼 노출', async () => {
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);

      expect(screen.getByRole('button', { name: '변경 사항 저장' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '‹ 퀴즈 정보' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '문제 목록 ›' })).not.toBeInTheDocument();
    });
  });

  describe('STEP 2 → STEP 1 복귀', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('"‹ 퀴즈 정보" 클릭 → step=info 복귀, 데이터 보존', async () => {
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);
      await user.click(screen.getByRole('button', { name: '‹ 퀴즈 정보' }));

      const titleInput = screen.getByPlaceholderText('퀴즈 제목을 입력하세요') as HTMLInputElement;
      expect(titleInput.value).toBe('테스트 퀴즈');
      expect(screen.getByRole('button', { name: '문제 목록 ›' })).toBeInTheDocument();
    });
  });

  describe('저장 클릭', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('"변경 사항 저장" 클릭 시 submit(quizId, payload) 호출 — payload 검증', async () => {
      mockSubmit.mockResolvedValue(MOCK_QUIZ);
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);
      await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
      const [quizId, payload] = mockSubmit.mock.calls[0];
      expect(quizId).toBe(99);
      expect(payload).toMatchObject({
        title: '테스트 퀴즈',
        description: '퀴즈 설명',
        category: 'general',
        isPublic: true,
        thumbnail: EMPTY_SLOT,
      });
      expect(Array.isArray(payload.questions)).toBe(true);
      expect(payload.questions).toHaveLength(1);
      expect(payload.questions[0]).toEqual(
        expect.objectContaining({
          serverId: 11,
          questionText: '1번 질문',
          answer: '정답1',
        }),
      );
    });
  });

  describe('저장 성공', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('submit 성공(truthy) → mutate(predicate) + navigate("/profile/quizzes-made")', async () => {
      mockSubmit.mockResolvedValue(MOCK_QUIZ);
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);
      await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/profile/quizzes-made'));
      expect(mockMutate).toHaveBeenCalledOnce();
      const predicate = mockMutate.mock.calls[0][0] as (key: unknown) => boolean;
      expect(predicate(['my-quizzes', { page: 0 }])).toBe(true);
      expect(predicate(['my-quizzes-aggregate'])).toBe(true);
      expect(predicate(['other-key'])).toBe(false);
      expect(predicate('my-quizzes')).toBe(false);
    });
  });

  describe('저장 실패', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('submit 이 null 반환하면 navigate / mutate 가 호출되지 않는다', async () => {
      mockSubmit.mockResolvedValue(null);
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);
      await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));

      await waitFor(() => expect(mockSubmit).toHaveBeenCalled());
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('isSubmitting / submit 에러', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('isSubmitting=true → 라벨 "저장 중..." + disabled', async () => {
      mockUseUpdateQuiz.mockReturnValue({ ...DEFAULT_UPDATE_RETURN, isSubmitting: true });
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);

      const saving = screen.getByRole('button', { name: '저장 중...' });
      expect(saving).toBeDisabled();
    });

    it('useUpdateQuiz.error 존재 시 STEP 2 에서 role="alert" 배너 노출', async () => {
      mockUseUpdateQuiz.mockReturnValue({
        ...DEFAULT_UPDATE_RETURN,
        error: '퀴즈를 찾을 수 없어요.',
      });
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);

      expect(screen.getByRole('alert')).toHaveTextContent('퀴즈를 찾을 수 없어요.');
    });

    it('error=null 이면 STEP 2 에서도 alert 배너가 보이지 않는다', async () => {
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('취소', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('STEP 1 "취소" 클릭 → navigate(-1)', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole('button', { name: '취소' }));
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('공개 설정 토글', () => {
    beforeEach(() => {
      mockUseQuizDetail.mockReturnValue({ quiz: MOCK_QUIZ, isLoading: false, error: null });
    });

    it('토글 클릭 시 isPublic 반전, 저장 시 payload.isPublic 반영', async () => {
      mockSubmit.mockResolvedValue(MOCK_QUIZ);
      const user = userEvent.setup();
      renderPage();

      const toggle = screen.getByRole('switch', { name: '공개 설정' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      await goToQuestionsStep(user);
      await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
      expect(mockSubmit.mock.calls[0][1]).toMatchObject({ isPublic: false });
    });
  });

  describe('questions 편집 (STEP 2)', () => {
    it('prefill: quiz.questions 가 카드로 렌더 + 첫 카드 선택 → 우측 패널에 첫 문항 input 노출', async () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: TWO_QUESTIONS_QUIZ,
        isLoading: false,
        error: null,
      });
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);

      expect(screen.getByRole('button', { name: '문제 1 카드' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문제 2 카드' })).toBeInTheDocument();
      expect(screen.getByDisplayValue('첫 번째 문제 텍스트')).toBeInTheDocument();
      expect(screen.getByDisplayValue('정답1')).toBeInTheDocument();
    });

    it('카드 클릭 → 해당 문항이 우측 패널에 표시', async () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: TWO_QUESTIONS_QUIZ,
        isLoading: false,
        error: null,
      });
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);

      await user.click(screen.getByRole('button', { name: '문제 2 카드' }));
      expect(screen.getByDisplayValue('두 번째 문제 텍스트')).toBeInTheDocument();
      expect(screen.getByDisplayValue('정답2')).toBeInTheDocument();
    });

    it('"+ 문제 추가" 카드 클릭 → 빈 문항 추가 + 자동 선택 (현재 선택 문항이 valid 일 때)', async () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: TWO_QUESTIONS_QUIZ,
        isLoading: false,
        error: null,
      });
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);

      // 현재는 2개 카드 + 추가 카드
      expect(screen.queryByRole('button', { name: '문제 3 카드' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '문제 추가' }));

      // 새 빈 문항 추가됨 + 자동 선택 (placeholder=빈)
      expect(screen.getByRole('button', { name: '문제 3 카드' })).toBeInTheDocument();
      const questionInput = screen.getByPlaceholderText('문제를 입력하세요') as HTMLInputElement;
      expect(questionInput.value).toBe('');
    });

    it('현재 선택 문항이 invalid 일 때 "+ 문제 추가" → 추가 안 됨 (검증 실패)', async () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: TWO_QUESTIONS_QUIZ,
        isLoading: false,
        error: null,
      });
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);

      // 첫 문항의 정답을 비워 invalid 로 만든다
      const answerInput = screen.getByDisplayValue('정답1');
      fireEvent.change(answerInput, { target: { value: '' } });

      await user.click(screen.getByRole('button', { name: '문제 추가' }));

      // 추가 안 됨 — 여전히 카드 2개
      expect(screen.queryByRole('button', { name: '문제 3 카드' })).not.toBeInTheDocument();
    });

    it('텍스트 / 정답 input 수정 → 저장 시 payload.questions[i] 에 반영, serverId 보존', async () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: TWO_QUESTIONS_QUIZ,
        isLoading: false,
        error: null,
      });
      mockSubmit.mockResolvedValue(TWO_QUESTIONS_QUIZ);
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);

      const questionInput = screen.getByDisplayValue('첫 번째 문제 텍스트');
      fireEvent.change(questionInput, { target: { value: '수정된 문제' } });

      const answerInput = screen.getByDisplayValue('정답1');
      fireEvent.change(answerInput, { target: { value: '수정된 정답' } });

      await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));
      await waitFor(() => expect(mockSubmit).toHaveBeenCalled());

      const payload = mockSubmit.mock.calls[0][1];
      expect(payload.questions[0].questionText).toBe('수정된 문제');
      expect(payload.questions[0].answer).toBe('수정된 정답');
      expect(payload.questions[0].serverId).toBe(11);
      expect(payload.questions[1].serverId).toBe(12);
    });

    it('삭제 버튼 → 해당 문항 빠짐 → 저장 시 페이로드에서 제외', async () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: TWO_QUESTIONS_QUIZ,
        isLoading: false,
        error: null,
      });
      mockSubmit.mockResolvedValue(TWO_QUESTIONS_QUIZ);
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);

      // 우측 패널의 삭제 버튼 (선택된 첫 번째 문항 삭제)
      await user.click(screen.getByRole('button', { name: '삭제' }));

      // 남은 카드 1개
      expect(screen.queryByRole('button', { name: '문제 2 카드' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문제 1 카드' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '변경 사항 저장' }));
      await waitFor(() => expect(mockSubmit).toHaveBeenCalled());

      const payload = mockSubmit.mock.calls[0][1];
      expect(payload.questions).toHaveLength(1);
      expect(payload.questions[0].serverId).toBe(12);
    });

    it('hydrate 시 imageKey === answerImageKey 면 "문제 이미지와 동일하게 사용" 체크박스 checked', async () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: TWO_QUESTIONS_QUIZ,
        isLoading: false,
        error: null,
      });
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);

      // 첫 문항: imageKey === answerImageKey === 'qkey-1' → checked
      const checkbox = screen.getByRole('checkbox', {
        name: /문제 이미지와 동일하게 사용/,
      }) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);

      // 두 번째 문항: imageKey=null, answerImageKey=null → unchecked
      await user.click(screen.getByRole('button', { name: '문제 2 카드' }));
      const checkbox2 = screen.getByRole('checkbox', {
        name: /문제 이미지와 동일하게 사용/,
      }) as HTMLInputElement;
      expect(checkbox2.checked).toBe(false);
    });

    it('questions 가 empty 이면 변경 사항 저장 버튼이 disabled', async () => {
      mockUseQuizDetail.mockReturnValue({
        quiz: { ...MOCK_QUIZ, questions: [] },
        isLoading: false,
        error: null,
      });
      const user = userEvent.setup();
      renderPage();
      await goToQuestionsStep(user);

      expect(screen.getByRole('button', { name: '변경 사항 저장' })).toBeDisabled();
    });
  });
});
