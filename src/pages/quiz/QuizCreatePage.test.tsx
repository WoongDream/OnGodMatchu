import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, waitFor } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import QuizCreatePage from './QuizCreatePage';

const mockNavigate = vi.hoisted(() => vi.fn());
const mockSubmit = vi.hoisted(() => vi.fn());
const mockUseCreateQuiz = vi.hoisted(() => vi.fn());
const mockMutate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  return {
    ...actual,
    useSWRConfig: () => ({ mutate: mockMutate }),
  };
});

vi.mock('@/hooks/useCreateQuiz', () => ({
  default: () => mockUseCreateQuiz(),
}));

const renderPage = () =>
  renderWithTheme(
    <MemoryRouter>
      <QuizCreatePage />
    </MemoryRouter>,
  );

const fillInfo = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByPlaceholderText('퀴즈 제목을 입력하세요'), '테스트 제목');
  await user.type(screen.getByPlaceholderText('퀴즈에 대한 설명을 입력하세요'), '설명');
  await user.click(screen.getByRole('button', { name: '게임' }));
};

const goToQuestions = async (user: ReturnType<typeof userEvent.setup>) => {
  await fillInfo(user);
  await user.click(screen.getByRole('button', { name: '문제 목록 ›' }));
};

const fillFirstQuestion = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByPlaceholderText('문제를 입력하세요'), '문제1');
  await user.type(screen.getByPlaceholderText('정답을 입력하세요'), '정답1');
};

describe('QuizCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCreateQuiz.mockReturnValue({
      submit: mockSubmit,
      clearError: vi.fn(),
      isSubmitting: false,
      error: null,
      errorCode: null,
    });
  });

  describe('초기 진입 (STEP 1 / info)', () => {
    it('Stepper 노출 + "문제 목록 ›" 버튼 노출 + "퀴즈 완성 ✓" 미노출', () => {
      renderPage();
      // Stepper
      expect(screen.getByRole('navigation', { name: '퀴즈 만들기 진행' })).toBeInTheDocument();
      // info step 의 footer 버튼들
      expect(screen.getByRole('button', { name: '문제 목록 ›' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      // questions step 의 버튼은 노출되지 않음
      expect(screen.queryByRole('button', { name: /퀴즈 완성/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '‹ 퀴즈 정보' })).not.toBeInTheDocument();
    });
  });

  describe('STEP 1 → STEP 2 전환', () => {
    it('빈 폼에서 "문제 목록 ›" 클릭 → 에러 메시지 3종 노출 + step 유지', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(screen.getByRole('button', { name: '문제 목록 ›' }));

      expect(screen.getByText('퀴즈 제목을 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText('퀴즈 설명을 입력해주세요')).toBeInTheDocument();
      expect(screen.getByText('카테고리를 1개 이상 선택해주세요')).toBeInTheDocument();

      // 여전히 step='info' — "퀴즈 완성" 미노출
      expect(screen.queryByRole('button', { name: /퀴즈 완성/ })).not.toBeInTheDocument();
    });

    it('fillInfo 후 "문제 목록 ›" 클릭 → step="questions" 전환', async () => {
      const user = userEvent.setup();
      renderPage();
      await fillInfo(user);
      await user.click(screen.getByRole('button', { name: '문제 목록 ›' }));

      // step='questions' 의 footer 버튼들
      expect(screen.getByRole('button', { name: /퀴즈 완성/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '‹ 퀴즈 정보' })).toBeInTheDocument();
      // info step 의 footer "문제 목록 ›" 은 사라짐
      expect(screen.queryByRole('button', { name: '문제 목록 ›' })).not.toBeInTheDocument();
      // 첫 진입 시 빈 문제 1개 + selected → 우측 패널에 placeholder 노출
      expect(screen.getByPlaceholderText('문제를 입력하세요')).toBeInTheDocument();
    });
  });

  describe('STEP 2 → STEP 1 복귀', () => {
    it('"‹ 퀴즈 정보" → step="info" 복귀, 폼 데이터 보존', async () => {
      const user = userEvent.setup();
      renderPage();
      await goToQuestions(user);

      await user.click(screen.getByRole('button', { name: '‹ 퀴즈 정보' }));

      // info step 다시 노출
      const titleInput = screen.getByPlaceholderText('퀴즈 제목을 입력하세요') as HTMLInputElement;
      expect(titleInput.value).toBe('테스트 제목');
      expect(screen.getByRole('button', { name: '문제 목록 ›' })).toBeInTheDocument();
    });
  });

  describe('문제 validation', () => {
    it('STEP 2 에서 빈 문제일 때 "퀴즈 완성 ✓" 은 disabled + submit 미호출', async () => {
      const user = userEvent.setup();
      renderPage();
      await goToQuestions(user);

      const completeBtn = screen.getByRole('button', { name: /퀴즈 완성/ });
      expect(completeBtn).toBeDisabled();

      await user.click(completeBtn);
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('"+ 문제 추가" 카드 클릭 시 빈 문제는 검증 에러 노출 ("이미지 또는 문제..." / "정답을...")', async () => {
      const user = userEvent.setup();
      renderPage();
      await goToQuestions(user);

      await user.click(screen.getByRole('button', { name: '문제 추가' }));

      // 메시지는 Input.error 와 별도 span 두 곳에 나타날 수 있음
      expect(
        screen.getAllByText('이미지 또는 문제 텍스트를 입력해주세요').length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('정답을 입력해주세요').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('제출 (submit)', () => {
    it('전부 채운 뒤 "퀴즈 완성 ✓" → submit 호출 + payload 검증', async () => {
      mockSubmit.mockResolvedValue({ id: 99 });
      const user = userEvent.setup();
      renderPage();
      await goToQuestions(user);
      await fillFirstQuestion(user);

      await user.click(screen.getByRole('button', { name: /퀴즈 완성/ }));

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
      const payload = mockSubmit.mock.calls[0][0];
      expect(payload).toMatchObject({
        title: '테스트 제목',
        description: '설명',
        category: 'game',
        thumbnailFile: null,
        isPublic: false,
        questions: [
          expect.objectContaining({
            imageFile: null,
            questionText: '문제1',
            answer: '정답1',
          }),
        ],
      });
    });

    it('성공 시 my-quizzes 캐시 invalidate + navigate("/profile/quizzes-made")', async () => {
      mockSubmit.mockResolvedValue({ id: 7 });
      const user = userEvent.setup();
      renderPage();
      await goToQuestions(user);
      await fillFirstQuestion(user);

      await user.click(screen.getByRole('button', { name: /퀴즈 완성/ }));

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/profile/quizzes-made'));
      expect(mockMutate).toHaveBeenCalledOnce();
      const predicate = mockMutate.mock.calls[0][0] as (key: unknown) => boolean;
      expect(predicate(['my-quizzes', { page: 0 }])).toBe(true);
      expect(predicate(['my-quizzes-aggregate'])).toBe(true);
      expect(predicate(['other-key'])).toBe(false);
      expect(predicate('my-quizzes')).toBe(false);
    });

    it('실패 (submit returns null) 시 navigate/mutate 미호출', async () => {
      mockSubmit.mockResolvedValue(null);
      const user = userEvent.setup();
      renderPage();
      await goToQuestions(user);
      await fillFirstQuestion(user);

      await user.click(screen.getByRole('button', { name: /퀴즈 완성/ }));

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  describe('상태별 UI', () => {
    it('isSubmitting=true → 버튼 라벨 "저장 중..." + disabled', async () => {
      mockUseCreateQuiz.mockReturnValue({
        submit: mockSubmit,
        clearError: vi.fn(),
        isSubmitting: true,
        error: null,
        errorCode: null,
      });
      const user = userEvent.setup();
      renderPage();
      await goToQuestions(user);
      await fillFirstQuestion(user);

      const saving = screen.getByRole('button', { name: '저장 중...' });
      expect(saving).toBeDisabled();
    });

    it('error 있을 때 step="questions" 에서 alert 배너 노출', async () => {
      mockUseCreateQuiz.mockReturnValue({
        submit: mockSubmit,
        clearError: vi.fn(),
        isSubmitting: false,
        error: '입력값을 다시 확인해주세요.',
        errorCode: 'INVALID_INPUT',
      });
      const user = userEvent.setup();
      renderPage();
      await goToQuestions(user);

      expect(screen.getByRole('alert')).toHaveTextContent('입력값을 다시 확인해주세요.');
    });
  });

  describe('공개 설정 토글', () => {
    it('기본값은 false, 클릭 후 submit 시 isPublic=true 로 전달', async () => {
      mockSubmit.mockResolvedValue({ id: 1 });
      const user = userEvent.setup();
      renderPage();

      const toggle = screen.getByRole('switch', { name: '공개 설정' });
      expect(toggle).toHaveAttribute('aria-checked', 'false');
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'true');

      await goToQuestions(user);
      await fillFirstQuestion(user);
      await user.click(screen.getByRole('button', { name: /퀴즈 완성/ }));

      await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
      expect(mockSubmit.mock.calls[0][0]).toMatchObject({ isPublic: true });
    });
  });

  describe('취소', () => {
    it('"취소" 클릭 → navigate(-1)', async () => {
      const user = userEvent.setup();
      renderPage();
      await user.click(screen.getByRole('button', { name: '취소' }));
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });
});
