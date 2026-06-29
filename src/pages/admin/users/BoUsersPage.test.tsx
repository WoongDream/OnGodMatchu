import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { AdminUser, AdminUserSummary } from '@/api/admin';
import BoUsersPage from './BoUsersPage';

// ── IntersectionObserver polyfill (happy-dom 미구현) ─────────────────────────
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
    },
  );
});

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ── useDebouncedValue mock — 즉시 pass-through ─────────────────────────────────
vi.mock('@/hooks/useDebouncedValue', () => ({ default: (v: unknown) => v }));

// ── useAdminUsers mock ───────────────────────────────────────────────────────
const mockUseAdminUsers = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useAdminUsers', () => ({ default: mockUseAdminUsers }));

// ── useAdminUserSummary mock ─────────────────────────────────────────────────
const mockUseAdminUserSummary = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useAdminUserSummary', () => ({ default: mockUseAdminUserSummary }));

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

// ── @/api/admin mock ─────────────────────────────────────────────────────────
const mockSendUserNotification = vi.hoisted(() => vi.fn());
const mockMapAdminError = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  sendUserNotification: mockSendUserNotification,
  mapAdminError: mockMapAdminError,
}));

// ── MonthlyUserStatsModal mock — 의존 SWR 회피, isOpen 만 노출 ──────────────────
vi.mock('@/features/admin/users/MonthlyUserStatsModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="monthly-stats-modal" /> : null,
}));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const MOCK_SUMMARY: AdminUserSummary = {
  totalUsers: 1234,
  ownerCount: 1,
  adminCount: 5,
  userCount: 1228,
  suspendedCount: 3,
  newThisMonth: 42,
};

const makeUser = (id: string, overrides: Partial<AdminUser> = {}): AdminUser => ({
  userId: id,
  nickname: `유저${id}`,
  email: `user${id}@example.com`,
  profileImageUrl: null,
  role: 'USER',
  status: 'ACTIVE',
  suspendedUntil: null,
  provider: 'GOOGLE',
  createdAt: '2025-03-15T09:00:00Z',
  withdrawnAt: null,
  ...overrides,
});

const DEFAULT_USERS_RETURN = {
  items: [] as AdminUser[],
  totalElements: 0,
  isLoading: false,
  isLoadingMore: false,
  hasNext: false,
  error: null,
  loadMore: vi.fn(),
  refresh: vi.fn(),
};

const DEFAULT_SUMMARY_RETURN = {
  summary: MOCK_SUMMARY,
  isLoading: false,
  error: null,
  refresh: vi.fn(),
};

const renderPage = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <BoUsersPage />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('BoUsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdminUsers.mockReturnValue(DEFAULT_USERS_RETURN);
    mockUseAdminUserSummary.mockReturnValue(DEFAULT_SUMMARY_RETURN);
    mockSendUserNotification.mockResolvedValue(undefined);
    mockMapAdminError.mockReturnValue('UNKNOWN');
  });

  describe('렌더', () => {
    it('제목과 OWNER 안내 배너가 표시된다', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: '유저 관리' })).toBeInTheDocument();
      expect(
        screen.getByText(/OWNER · ADMIN 임명\/해제는 OWNER만 할 수 있어요/),
      ).toBeInTheDocument();
    });
  });

  describe('통계 카드', () => {
    it('stats 카드 5개 값(전체/OWNER/ADMIN/USER/정지)이 표시된다', () => {
      renderPage();
      expect(screen.getByText('전체 유저')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument(); // totalUsers
      expect(screen.getByText('+42 이번 달')).toBeInTheDocument(); // newThisMonth
      expect(screen.getByText('1,228')).toBeInTheDocument(); // userCount
      // OWNER/ADMIN/USER/정지 라벨 — OWNER/ADMIN/USER 는 탭에도 있어 복수
      expect(screen.getAllByText('OWNER').length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText('정지').length).toBeGreaterThanOrEqual(2);
    });

    it('summary 가 undefined 면 0 으로 표시된다', () => {
      mockUseAdminUserSummary.mockReturnValue({ ...DEFAULT_SUMMARY_RETURN, summary: undefined });
      renderPage();
      // 5개 카드 값 + 이번 달 0
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(5);
      expect(screen.getByText('+0 이번 달')).toBeInTheDocument();
    });
  });

  describe('필터 탭', () => {
    it('필터 탭 6개가 렌더된다', () => {
      renderPage();
      expect(screen.getByRole('button', { name: '전체' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'OWNER' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ADMIN' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'USER' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '정지' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '탈퇴' })).toBeInTheDocument();
    });

    it('초기에는 role/status 없이 useAdminUsers 가 호출된다', () => {
      renderPage();
      const lastCall = mockUseAdminUsers.mock.calls[mockUseAdminUsers.mock.calls.length - 1][0];
      expect(lastCall.role).toBeUndefined();
      expect(lastCall.status).toBeUndefined();
    });

    it('"ADMIN" 탭 클릭 시 role=ADMIN 으로 재호출된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));
      const lastCall = mockUseAdminUsers.mock.calls[mockUseAdminUsers.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ role: 'ADMIN' });
    });

    it('"정지" 탭 클릭 시 status=SUSPENDED 로 재호출된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '정지' }));
      const lastCall = mockUseAdminUsers.mock.calls[mockUseAdminUsers.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ status: 'SUSPENDED' });
    });

    it('"탈퇴" 탭 클릭 시 status=WITHDRAWN 로 재호출된다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '탈퇴' }));
      const lastCall = mockUseAdminUsers.mock.calls[mockUseAdminUsers.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ status: 'WITHDRAWN' });
    });
  });

  describe('검색', () => {
    it('검색어 입력 시 query 로 useAdminUsers 가 재호출된다', () => {
      renderPage();
      fireEvent.change(screen.getByPlaceholderText('닉네임 · 이메일 검색'), {
        target: { value: 'hong' },
      });
      const lastCall = mockUseAdminUsers.mock.calls[mockUseAdminUsers.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({ query: 'hong' });
    });
  });

  describe('목록 행', () => {
    it('items 가 있으면 닉네임·가입일이 표시된다', () => {
      mockUseAdminUsers.mockReturnValue({
        ...DEFAULT_USERS_RETURN,
        items: [makeUser('1')],
        totalElements: 1,
      });
      renderPage();
      expect(screen.getByText('유저1')).toBeInTheDocument();
      expect(screen.getByText('2025-03-15')).toBeInTheDocument(); // createdAt slice(0,10)
    });

    it('행 클릭 시 navigate(`/admin/users/{id}`) 호출', () => {
      mockUseAdminUsers.mockReturnValue({
        ...DEFAULT_USERS_RETURN,
        items: [makeUser('abc-42')],
        totalElements: 1,
      });
      renderPage();
      fireEvent.click(screen.getByText('유저abc-42'));
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users/abc-42');
    });

    it('"알림 보내기" 클릭은 행 navigate 를 막고 모달만 연다', () => {
      mockUseAdminUsers.mockReturnValue({
        ...DEFAULT_USERS_RETURN,
        items: [makeUser('1')],
        totalElements: 1,
      });
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '알림 보내기' }));
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByText(/받는 사람 · 유저1/)).toBeInTheDocument();
    });

    it('탈퇴 유저 행에는 "알림 보내기" 버튼이 없다', () => {
      mockUseAdminUsers.mockReturnValue({
        ...DEFAULT_USERS_RETURN,
        items: [makeUser('1', { status: 'WITHDRAWN', withdrawnAt: '2025-04-01T00:00:00Z' })],
        totalElements: 1,
      });
      renderPage();
      expect(screen.getByText('탈퇴한 유저 정보 삭제됨')).toBeInTheDocument();
      expect(screen.queryByText('유저1')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '알림 보내기' })).not.toBeInTheDocument();
    });
  });

  describe('알림 발송 플로우', () => {
    const openComposeFor = (user: AdminUser) => {
      mockUseAdminUsers.mockReturnValue({
        ...DEFAULT_USERS_RETURN,
        items: [user],
        totalElements: 1,
      });
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: '알림 보내기' }));
    };

    it('제목·내용 입력 후 발송 시 sendUserNotification + 성공 토스트', async () => {
      openComposeFor(makeUser('1'));
      fireEvent.change(screen.getByPlaceholderText('알림 제목'), {
        target: { value: '안녕하세요' },
      });
      fireEvent.change(screen.getByPlaceholderText('사용자에게 전할 내용을 입력해주세요.'), {
        target: { value: '본문 내용' },
      });

      // 행에도 "알림 보내기" 버튼이 있어 모달 푸터(마지막) 버튼을 선택
      const sendButtons = screen.getAllByRole('button', { name: '알림 보내기' });
      const sendBtn = sendButtons[sendButtons.length - 1];
      expect(sendBtn).toBeEnabled();
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(mockSendUserNotification).toHaveBeenCalledWith('1', {
          type: 'INFO',
          title: '안녕하세요',
          content: '본문 내용',
        });
        expect(mockToastSuccess).toHaveBeenCalledWith('알림을 보냈어요.');
      });
    });

    it('발송 실패(TARGET_INVALID) 시 탈퇴 사용자 안내 토스트', async () => {
      mockSendUserNotification.mockRejectedValue(new Error('fail'));
      mockMapAdminError.mockReturnValue('TARGET_INVALID');
      openComposeFor(makeUser('1'));
      fireEvent.change(screen.getByPlaceholderText('알림 제목'), { target: { value: '제목' } });
      fireEvent.change(screen.getByPlaceholderText('사용자에게 전할 내용을 입력해주세요.'), {
        target: { value: '내용' },
      });
      const sendButtons = screen.getAllByRole('button', { name: '알림 보내기' });
      fireEvent.click(sendButtons[sendButtons.length - 1]);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('탈퇴한 사용자에게는 보낼 수 없어요.');
      });
    });
  });

  describe('월별 통계 모달', () => {
    it('"전체 유저" 카드 클릭 시 MonthlyUserStatsModal 이 열린다', () => {
      renderPage();
      expect(screen.queryByTestId('monthly-stats-modal')).not.toBeInTheDocument();
      fireEvent.click(screen.getByText('전체 유저').closest('button') as HTMLElement);
      expect(screen.getByTestId('monthly-stats-modal')).toBeInTheDocument();
    });
  });

  describe('빈 상태', () => {
    it('items=[] && isLoading=false && error=null 이면 "조건에 맞는 유저가 없어요." 가 보인다', () => {
      renderPage();
      expect(screen.getByText('조건에 맞는 유저가 없어요.')).toBeInTheDocument();
    });

    it('error 있으면 "목록을 불러오지 못했어요." 가 보인다', () => {
      mockUseAdminUsers.mockReturnValue({
        ...DEFAULT_USERS_RETURN,
        error: new Error('서버 에러'),
      });
      renderPage();
      expect(screen.getByText('목록을 불러오지 못했어요.')).toBeInTheDocument();
    });
  });

  describe('로딩 상태', () => {
    it('isLoading=true && items=[] 이면 빈/에러 메시지가 보이지 않는다', () => {
      mockUseAdminUsers.mockReturnValue({
        ...DEFAULT_USERS_RETURN,
        isLoading: true,
      });
      renderPage();
      expect(screen.queryByText('조건에 맞는 유저가 없어요.')).not.toBeInTheDocument();
      expect(screen.queryByText('목록을 불러오지 못했어요.')).not.toBeInTheDocument();
    });
  });
});
