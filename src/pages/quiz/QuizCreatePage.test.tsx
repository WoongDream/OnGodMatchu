import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithTheme, screen, waitFor } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import QuizCreatePage from './QuizCreatePage';

const mockNavigate = vi.hoisted(() => vi.fn());
const mockSubmit = vi.hoisted(() => vi.fn());
const mockUseCreateQuiz = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
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

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByPlaceholderText('퀴즈 제목을 입력하세요'), '테스트 제목');
  await user.click(screen.getByRole('button', { name: '게임' }));
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

  it('저장 버튼은 입력 전 비활성', () => {
    renderPage();
    expect(screen.getByRole('button', { name: '퀴즈 저장' })).toBeDisabled();
  });

  it('필수 입력이 모두 채워지면 저장 버튼 활성', async () => {
    const user = userEvent.setup();
    renderPage();
    await fillForm(user);
    expect(screen.getByRole('button', { name: '퀴즈 저장' })).toBeEnabled();
  });

  it('저장 클릭 시 submit 을 올바른 페이로드로 호출', async () => {
    mockSubmit.mockResolvedValue({ id: 99 });
    const user = userEvent.setup();
    renderPage();
    await fillForm(user);

    await user.click(screen.getByRole('button', { name: '퀴즈 저장' }));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
    const payload = mockSubmit.mock.calls[0][0];
    expect(payload).toMatchObject({
      title: '테스트 제목',
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

  it('공개 설정 토글 — 기본값 비공개, 클릭 시 공개로 전환', async () => {
    const user = userEvent.setup();
    renderPage();
    const toggle = screen.getByRole('switch', { name: '공개 설정' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('공개 설정 토글 ON 후 저장 시 isPublic=true 로 submit', async () => {
    mockSubmit.mockResolvedValue({ id: 1 });
    const user = userEvent.setup();
    renderPage();
    await fillForm(user);
    await user.click(screen.getByRole('switch', { name: '공개 설정' }));
    await user.click(screen.getByRole('button', { name: '퀴즈 저장' }));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
    expect(mockSubmit.mock.calls[0][0]).toMatchObject({ isPublic: true });
  });

  it('성공 시 /quiz/{id} 로 navigate', async () => {
    mockSubmit.mockResolvedValue({ id: 7 });
    const user = userEvent.setup();
    renderPage();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: '퀴즈 저장' }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/quiz/7'));
  });

  it('실패 시 navigate 안 함', async () => {
    mockSubmit.mockResolvedValue(null);
    const user = userEvent.setup();
    renderPage();
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: '퀴즈 저장' }));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('isSubmitting=true 면 저장 버튼이 "저장 중..." 라벨 + 비활성', () => {
    mockUseCreateQuiz.mockReturnValue({
      submit: mockSubmit,
      clearError: vi.fn(),
      isSubmitting: true,
      error: null,
      errorCode: null,
    });
    renderPage();
    const button = screen.getByRole('button', { name: '저장 중...' });
    expect(button).toBeDisabled();
  });

  it('error 가 있으면 alert 배너 표시', () => {
    mockUseCreateQuiz.mockReturnValue({
      submit: mockSubmit,
      clearError: vi.fn(),
      isSubmitting: false,
      error: '입력값을 다시 확인해주세요.',
      errorCode: 'INVALID_INPUT',
    });
    renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent('입력값을 다시 확인해주세요.');
  });
});
