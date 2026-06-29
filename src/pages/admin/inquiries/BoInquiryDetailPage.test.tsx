import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { BoInquiry } from '@/types';
import BoInquiryDetailPage from './BoInquiryDetailPage';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockUseParams = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams(),
  };
});

// ── useBoInquiry mock ────────────────────────────────────────────────────────
const mockUseBoInquiry = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useBoInquiry', () => ({ default: mockUseBoInquiry }));

// ── useToast mock ────────────────────────────────────────────────────────────
const mockToastSuccess = vi.hoisted(() => vi.fn());
const mockToastError = vi.hoisted(() => vi.fn());

vi.mock('@/components/toast', () => ({
  useToast: () => ({
    show: vi.fn(),
    success: mockToastSuccess,
    info: vi.fn(),
    error: mockToastError,
  }),
}));

// ── @/api/inquiry mock ───────────────────────────────────────────────────────
const mockChangeInquiryStatus = vi.hoisted(() => vi.fn());
const mockAnswerInquiry = vi.hoisted(() => vi.fn());

vi.mock('@/api/inquiry', () => ({
  changeInquiryStatus: mockChangeInquiryStatus,
  answerInquiry: mockAnswerInquiry,
}));

// ── NotificationComposeModal mock — onSend 트리거만 노출 ───────────────────────
vi.mock('@/features/admin/users/NotificationComposeModal', () => ({
  default: ({
    isOpen,
    onSend,
    recipient,
  }: {
    isOpen: boolean;
    onSend: (d: { type: string; title: string; content: string }) => void;
    recipient: { nickname: string };
  }) =>
    isOpen ? (
      <div data-testid="compose-modal">
        <span>받는 사람 · {recipient.nickname}</span>
        <button
          type="button"
          onClick={() => onSend({ type: 'INFO', title: '답변 제목', content: '답변 내용' })}
        >
          mock-send
        </button>
      </div>
    ) : null,
}));

// ── ProfileModal mock — publicId 노출 ─────────────────────────────────────────
vi.mock('@/components/profile-modal/ProfileModal', () => ({
  default: ({ publicId }: { publicId: string }) => (
    <div data-testid="profile-modal">profile:{publicId}</div>
  ),
}));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const MOCK_INQUIRY: BoInquiry = {
  id: 7,
  title: '로그인이 안돼요',
  content: '구글 로그인 시 에러가 납니다.',
  author: {
    publicId: 'pub-1',
    nickname: '홍길동',
    profileImageUrl: null,
  },
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2025-03-15T08:30:00Z',
  answers: [],
};

const DEFAULT_INQUIRY_RETURN = {
  inquiry: MOCK_INQUIRY,
  isLoading: false,
  error: null,
  refresh: vi.fn(),
};

const renderPage = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <BoInquiryDetailPage />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('BoInquiryDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ id: '7' });
    mockUseBoInquiry.mockReturnValue(DEFAULT_INQUIRY_RETURN);
    mockChangeInquiryStatus.mockResolvedValue(undefined);
    mockAnswerInquiry.mockResolvedValue(undefined);
  });

  describe('로딩 / 미존재', () => {
    it('isLoading=true 면 "불러오는 중..." 이 보인다', () => {
      mockUseBoInquiry.mockReturnValue({
        ...DEFAULT_INQUIRY_RETURN,
        inquiry: undefined,
        isLoading: true,
      });
      renderPage();
      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
    });

    it('inquiry 없음 && isLoading=false 면 "문의를 찾을 수 없어요." 가 보인다', () => {
      mockUseBoInquiry.mockReturnValue({
        ...DEFAULT_INQUIRY_RETURN,
        inquiry: undefined,
        isLoading: false,
      });
      renderPage();
      expect(screen.getByText('문의를 찾을 수 없어요.')).toBeInTheDocument();
    });

    it('error 가 있으면 "문의를 찾을 수 없어요." 가 보인다', () => {
      mockUseBoInquiry.mockReturnValue({
        ...DEFAULT_INQUIRY_RETURN,
        inquiry: undefined,
        error: new Error('boom'),
      });
      renderPage();
      expect(screen.getByText('문의를 찾을 수 없어요.')).toBeInTheDocument();
    });
  });

  describe('렌더', () => {
    it('제목/내용/작성자/접수일이 표시된다', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: '로그인이 안돼요' })).toBeInTheDocument();
      expect(screen.getByText('구글 로그인 시 에러가 납니다.')).toBeInTheDocument();
      expect(screen.getByText('홍길동')).toBeInTheDocument();
      expect(screen.getByText('접수일 2025-03-15')).toBeInTheDocument();
    });

    it('보낸 답변이 있으면 답변 섹션과 건수가 표시된다', () => {
      mockUseBoInquiry.mockReturnValue({
        ...DEFAULT_INQUIRY_RETURN,
        inquiry: {
          ...MOCK_INQUIRY,
          answers: [
            {
              id: 1,
              type: 'INFO',
              typeLabel: '안내',
              title: '답변드립니다',
              content: '확인했어요',
              senderLabel: '운영팀',
              createdAt: '2025-03-16T10:00:00Z',
            },
          ],
        },
      });
      renderPage();
      expect(screen.getByText('보낸 답변 1건')).toBeInTheDocument();
      expect(screen.getByText('답변드립니다')).toBeInTheDocument();
      expect(screen.getByText('확인했어요')).toBeInTheDocument();
    });
  });

  describe('상태 토글 / 저장', () => {
    it('변경 전에는 "저장" 버튼이 비활성이다', () => {
      renderPage();
      expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
    });

    it('상태 토글 변경 시 "저장" 버튼이 활성화된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '처리중' }));
      expect(screen.getByRole('button', { name: '저장' })).toBeEnabled();
    });

    it('상태 변경 후 저장 시 changeInquiryStatus 호출 + 성공 토스트', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '처리중' }));
      fireEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockChangeInquiryStatus).toHaveBeenCalledWith(7, 'IN_PROGRESS');
        expect(mockToastSuccess).toHaveBeenCalledWith('처리 상태가 저장되었어요.');
      });
    });

    it('저장 실패 시 에러 토스트', async () => {
      mockChangeInquiryStatus.mockRejectedValue(new Error('fail'));
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '완료' }));
      fireEvent.click(screen.getByRole('button', { name: '저장' }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('처리 상태 저장에 실패했어요.');
      });
    });
  });

  describe('알림 보내기 플로우', () => {
    it('"알림 보내기" 클릭 시 NotificationComposeModal 이 열린다', () => {
      renderPage();
      expect(screen.queryByTestId('compose-modal')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '알림 보내기' }));
      expect(screen.getByTestId('compose-modal')).toBeInTheDocument();
      expect(screen.getByText(/받는 사람 · 홍길동/)).toBeInTheDocument();
    });

    it('모달 onSend 시 answerInquiry 호출 + 성공 토스트 + 모달 닫힘', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '알림 보내기' }));
      fireEvent.click(screen.getByRole('button', { name: 'mock-send' }));

      await waitFor(() => {
        expect(mockAnswerInquiry).toHaveBeenCalledWith(7, {
          type: 'INFO',
          title: '답변 제목',
          content: '답변 내용',
        });
        expect(mockToastSuccess).toHaveBeenCalledWith('답변을 보냈어요.');
      });
      await waitFor(() => {
        expect(screen.queryByTestId('compose-modal')).not.toBeInTheDocument();
      });
    });

    it('answerInquiry 실패 시 에러 토스트', async () => {
      mockAnswerInquiry.mockRejectedValue(new Error('fail'));
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '알림 보내기' }));
      fireEvent.click(screen.getByRole('button', { name: 'mock-send' }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          '답변 전송에 실패했어요. (탈퇴한 사용자일 수 있어요)',
        );
      });
    });
  });

  describe('작성자 프로필 모달', () => {
    it('작성자 클릭 시 ProfileModal 이 publicId 로 열린다', () => {
      renderPage();
      expect(screen.queryByTestId('profile-modal')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /홍길동/ }));
      expect(screen.getByTestId('profile-modal')).toHaveTextContent('profile:pub-1');
    });

    it('탈퇴 사용자(publicId=null) 면 작성자 버튼이 비활성이고 클릭해도 모달이 안 열린다', () => {
      mockUseBoInquiry.mockReturnValue({
        ...DEFAULT_INQUIRY_RETURN,
        inquiry: {
          ...MOCK_INQUIRY,
          author: { publicId: null, nickname: '탈퇴유저', profileImageUrl: null },
        },
      });
      renderPage();
      const authorBtn = screen.getByRole('button', { name: /탈퇴유저/ });
      expect(authorBtn).toBeDisabled();
      fireEvent.click(authorBtn);
      expect(screen.queryByTestId('profile-modal')).not.toBeInTheDocument();
    });
  });
});
