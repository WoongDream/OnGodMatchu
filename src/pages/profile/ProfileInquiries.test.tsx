import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import type { InquiryListItem, UserNotification } from '@/types';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockUseOutletContext = vi.hoisted(() => vi.fn());
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useOutletContext: mockUseOutletContext,
    // ReceivedNotificationModal 이 useNavigate 를 사용하므로 안전한 stub 제공
    useNavigate: () => mockNavigate,
    Navigate: (props: { to: string }) => {
      mockNavigate(props.to);
      return <div data-testid="navigate" data-to={props.to} />;
    },
  };
});

// ── useToast mock ─────────────────────────────────────────────────────────────
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

// ── createInquiry mock ────────────────────────────────────────────────────────
const mockCreateInquiry = vi.hoisted(() => vi.fn());

vi.mock('@/api/inquiry', () => ({
  createInquiry: mockCreateInquiry,
}));

// ── useMyInquiries mock ───────────────────────────────────────────────────────
const mockUseMyInquiries = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useMyInquiries', () => ({
  default: mockUseMyInquiries,
}));

import ProfileInquiries from './ProfileInquiries';

// ── helpers ───────────────────────────────────────────────────────────────────
const makeAnswer = (overrides?: Partial<UserNotification>): UserNotification => ({
  id: 100,
  type: 'INFO',
  typeLabel: '안내',
  title: '답변드립니다',
  content: '문의 주셔서 감사합니다.',
  senderLabel: '운영팀',
  createdAt: '2026-06-02T09:00:00.000Z',
  ...overrides,
});

const makeInquiry = (overrides?: Partial<InquiryListItem>): InquiryListItem => ({
  id: 1,
  title: '로그인이 안돼요',
  content: '카카오 로그인이 실패합니다.',
  status: 'PENDING',
  statusLabel: '대기',
  createdAt: '2026-06-01T09:00:00.000Z',
  answers: [],
  ...overrides,
});

const refresh = vi.fn();
const loadMore = vi.fn();

const baseHook = {
  items: [] as InquiryListItem[],
  totalElements: 0,
  isLoading: false,
  isLoadingMore: false,
  hasNext: false,
  error: undefined as unknown,
  loadMore,
  refresh,
};

const setHook = (overrides: Partial<typeof baseHook>) => {
  mockUseMyInquiries.mockReturnValue({ ...baseHook, ...overrides });
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseOutletContext.mockReturnValue({ profile: { id: 'u1' }, isMe: true });
  mockCreateInquiry.mockResolvedValue(makeInquiry());
  setHook({});
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

describe('ProfileInquiries', () => {
  describe('접근 제어', () => {
    it('isMe=false 면 상위 경로로 redirect 한다', () => {
      mockUseOutletContext.mockReturnValue({ profile: { id: 'u1' }, isMe: false });
      renderWithTheme(<ProfileInquiries />);

      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '..');
      expect(mockNavigate).toHaveBeenCalledWith('..');
    });
  });

  describe('새 문의 폼', () => {
    it('제목/내용 글자수 카운터를 표시한다', () => {
      renderWithTheme(<ProfileInquiries />);

      expect(screen.getByText('0/50')).toBeInTheDocument();
      expect(screen.getByText('0/1000')).toBeInTheDocument();
    });

    it('title/content 가 비어 있으면 문의 접수 버튼이 disabled 다', () => {
      renderWithTheme(<ProfileInquiries />);
      expect(screen.getByRole('button', { name: '문의 접수' })).toBeDisabled();
    });

    it('title 만 입력하면 여전히 disabled 다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ProfileInquiries />);

      await user.type(screen.getByPlaceholderText('문의 제목을 입력하세요'), '제목만');

      expect(screen.getByRole('button', { name: '문의 접수' })).toBeDisabled();
    });

    it('title/content 모두 입력하면 버튼이 활성화되고 카운터가 갱신된다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ProfileInquiries />);

      await user.type(screen.getByPlaceholderText('문의 제목을 입력하세요'), '제목');
      await user.type(
        screen.getByPlaceholderText(/문의하실 내용을 자세히 적어주세요/),
        '내용입니다',
      );

      expect(screen.getByText('2/50')).toBeInTheDocument();
      expect(screen.getByText('5/1000')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '문의 접수' })).toBeEnabled();
    });

    it('접수 성공 시 createInquiry 호출·refresh·폼 초기화·성공 토스트를 실행한다', async () => {
      const user = userEvent.setup();
      renderWithTheme(<ProfileInquiries />);

      const titleInput = screen.getByPlaceholderText('문의 제목을 입력하세요');
      const contentInput = screen.getByPlaceholderText(/문의하실 내용을 자세히 적어주세요/);

      await user.type(titleInput, '  제목  ');
      await user.type(contentInput, '  내용  ');
      await user.click(screen.getByRole('button', { name: '문의 접수' }));

      await waitFor(() => {
        expect(mockCreateInquiry).toHaveBeenCalledTimes(1);
      });
      // trim 된 payload 로 호출
      expect(mockCreateInquiry).toHaveBeenCalledWith({ title: '제목', content: '내용' });
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(mockToastSuccess).toHaveBeenCalledWith('문의가 접수되었어요.');

      // 폼 초기화 → 버튼 다시 disabled, 카운터 0
      await waitFor(() => {
        expect(screen.getByText('0/50')).toBeInTheDocument();
      });
      expect((titleInput as HTMLInputElement).value).toBe('');
      expect(screen.getByRole('button', { name: '문의 접수' })).toBeDisabled();
    });

    it('접수 실패 시 에러 토스트를 띄우고 refresh 하지 않는다', async () => {
      const user = userEvent.setup();
      mockCreateInquiry.mockRejectedValueOnce(new Error('boom'));
      renderWithTheme(<ProfileInquiries />);

      await user.type(screen.getByPlaceholderText('문의 제목을 입력하세요'), '제목');
      await user.type(screen.getByPlaceholderText(/문의하실 내용을 자세히 적어주세요/), '내용');
      await user.click(screen.getByRole('button', { name: '문의 접수' }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('문의 접수에 실패했어요.');
      });
      expect(refresh).not.toHaveBeenCalled();
    });
  });

  describe('이전 문의 리스트', () => {
    it('전체 개수를 헤더에 렌더한다', () => {
      setHook({ totalElements: 3, items: [makeInquiry()] });
      renderWithTheme(<ProfileInquiries />);

      expect(screen.getByText('전체 3개')).toBeInTheDocument();
    });

    it('초기 로딩 중이면 "불러오는 중..." 을 보여준다', () => {
      setHook({ isLoading: true, items: [] });
      renderWithTheme(<ProfileInquiries />);

      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
    });

    it('error 가 있으면 에러 메시지를 보여준다', () => {
      setHook({ error: new Error('boom'), items: [] });
      renderWithTheme(<ProfileInquiries />);

      expect(screen.getByText('문의 내역을 불러오지 못했습니다.')).toBeInTheDocument();
    });

    it('빈 결과면 "아직 접수한 문의가 없어요." 를 보여준다', () => {
      setHook({ items: [], totalElements: 0 });
      renderWithTheme(<ProfileInquiries />);

      expect(screen.getByText('아직 접수한 문의가 없어요.')).toBeInTheDocument();
    });

    it('items 가 있으면 InquiryCard 리스트를 렌더한다', () => {
      setHook({
        items: [
          makeInquiry({ id: 1, title: '로그인 문의' }),
          makeInquiry({ id: 2, title: '결제 문의' }),
        ],
        totalElements: 2,
      });
      renderWithTheme(<ProfileInquiries />);

      expect(screen.getByText('로그인 문의')).toBeInTheDocument();
      expect(screen.getByText('결제 문의')).toBeInTheDocument();
    });
  });

  describe('받은 답변 → 모달', () => {
    it('답변 제목 행 클릭 시 ReceivedNotificationModal 이 열린다', () => {
      setHook({
        items: [
          makeInquiry({
            id: 1,
            title: '로그인 문의',
            status: 'DONE',
            answers: [makeAnswer({ title: '운영팀 답변', content: '확인했습니다.' })],
          }),
        ],
        totalElements: 1,
      });
      renderWithTheme(<ProfileInquiries />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByRole('button', { name: /운영팀 답변/ }));
      });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-label', '운영팀 답변');
      expect(screen.getAllByText('확인했습니다.').length).toBeGreaterThan(0);
    });
  });

  describe('memoization', () => {
    it('displayName 이 "ProfileInquiries" 이다', () => {
      expect(ProfileInquiries.displayName).toBe('ProfileInquiries');
    });
  });
});
