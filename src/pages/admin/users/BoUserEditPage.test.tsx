import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import type { AdminUserDetail, AdminUserHistory } from '@/api/admin';
import type { Role } from '@/types';
import BoUserEditPage from './BoUserEditPage';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseParams = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

// ── useAuthStore mock (selector 형태) ─────────────────────────────────────────
const { useAuthStoreMock } = vi.hoisted(() => ({
  useAuthStoreMock: vi.fn(),
}));
vi.mock('@/store/authStore', () => ({ default: useAuthStoreMock }));

const mockAuth = (state: { role?: Role; userId?: string }) => {
  useAuthStoreMock.mockImplementation((sel: (st: unknown) => unknown) =>
    sel({ user: { role: state.role ?? 'USER', userId: state.userId } }),
  );
};

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

// ── useAdminUserDetail mock ──────────────────────────────────────────────────
const mockUseAdminUserDetail = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useAdminUserDetail', () => ({ default: mockUseAdminUserDetail }));

// ── useAdminUserHistories mock ───────────────────────────────────────────────
const mockUseAdminUserHistories = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useAdminUserHistories', () => ({ default: mockUseAdminUserHistories }));

// ── @/api/admin mock ─────────────────────────────────────────────────────────
const mockUpdateAdminUser = vi.hoisted(() => vi.fn());
const mockMapAdminError = vi.hoisted(() => vi.fn());

vi.mock('@/api/admin', () => ({
  updateAdminUser: mockUpdateAdminUser,
  mapAdminError: mockMapAdminError,
}));

// ── 샘플 데이터 ────────────────────────────────────────────────────────────────
const MOCK_USER: AdminUserDetail = {
  userId: 'u-1',
  nickname: '홍길동',
  email: 'hong@example.com',
  profileImageUrl: 'https://img/profile.png',
  bio: '안녕하세요 자기소개입니다',
  role: 'USER',
  status: 'ACTIVE',
  suspendedUntil: null,
  provider: 'GOOGLE',
  createdAt: '2025-01-10T09:00:00Z',
  solvedCount: 12,
  avgSolveRate: 84.6,
  quizCount: 3,
  totalPlayCount: 99,
  totalStarCount: 7,
};

const makeHistory = (id: number, overrides: Partial<AdminUserHistory> = {}): AdminUserHistory => ({
  id,
  actorId: 'admin-1',
  actorNickname: '관리자',
  actorRole: 'OWNER',
  changeType: 'ROLE',
  changeTypeLabel: '역할 변경',
  detail: 'USER → ADMIN',
  notification: null,
  createdAt: '2025-02-01T12:30:00Z',
  ...overrides,
});

const DEFAULT_DETAIL_RETURN = {
  user: MOCK_USER,
  isLoading: false,
  error: null,
  refresh: vi.fn(),
};

const DEFAULT_HISTORIES_RETURN = {
  items: [] as AdminUserHistory[],
  totalElements: 0,
  isLoading: false,
  isLoadingMore: false,
  hasNext: false,
  error: null,
  loadMore: vi.fn(),
  refresh: vi.fn(),
};

const renderPage = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <BoUserEditPage />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('BoUserEditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseParams.mockReturnValue({ publicId: 'u-1' });
    mockAuth({ role: 'OWNER', userId: 'me' });
    mockUseAdminUserDetail.mockReturnValue(DEFAULT_DETAIL_RETURN);
    mockUseAdminUserHistories.mockReturnValue(DEFAULT_HISTORIES_RETURN);
    mockUpdateAdminUser.mockResolvedValue(undefined);
    mockMapAdminError.mockReturnValue('UNKNOWN');
  });

  describe('렌더', () => {
    it('제목과 프로필/stats 가 표시된다', () => {
      renderPage();
      expect(screen.getByRole('heading', { name: '유저 수정' })).toBeInTheDocument();
      expect(screen.getByText('hong@example.com')).toBeInTheDocument();
      expect(screen.getByText('2025-01-10')).toBeInTheDocument(); // createdAt slice
      expect(screen.getByText('12')).toBeInTheDocument(); // solvedCount
      expect(screen.getByText('85%')).toBeInTheDocument(); // avgSolveRate 반올림
      expect(screen.getByText('풀어봄')).toBeInTheDocument();
    });

    it('avgSolveRate 가 null 이면 "—" 로 표시된다', () => {
      mockUseAdminUserDetail.mockReturnValue({
        ...DEFAULT_DETAIL_RETURN,
        user: { ...MOCK_USER, avgSolveRate: null },
      });
      renderPage();
      expect(screen.getByText('—')).toBeInTheDocument();
    });
  });

  describe('로딩 / 미존재', () => {
    it('isLoading=true 면 "불러오는 중..." 이 보인다', () => {
      mockUseAdminUserDetail.mockReturnValue({
        ...DEFAULT_DETAIL_RETURN,
        user: undefined,
        isLoading: true,
      });
      renderPage();
      expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
    });

    it('user 없음 && isLoading=false 면 "유저를 찾을 수 없어요." 가 보인다', () => {
      mockUseAdminUserDetail.mockReturnValue({
        ...DEFAULT_DETAIL_RETURN,
        user: undefined,
        isLoading: false,
      });
      renderPage();
      expect(screen.getByText('유저를 찾을 수 없어요.')).toBeInTheDocument();
    });
  });

  describe('역할 토글 권한', () => {
    it('OWNER actor + 타인 대상이면 역할 토글이 활성화된다', () => {
      mockAuth({ role: 'OWNER', userId: 'me' });
      renderPage();
      expect(screen.getByRole('button', { name: 'ADMIN' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'OWNER' })).toBeEnabled();
    });

    it('ADMIN actor 면 역할 토글이 비활성 + "OWNER만 변경 가능" 힌트', () => {
      mockAuth({ role: 'ADMIN', userId: 'me' });
      renderPage();
      expect(screen.getByText('OWNER만 변경 가능')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'ADMIN' })).toBeDisabled();
    });

    it('OWNER actor 라도 본인 대상이면 역할 토글이 비활성이다', () => {
      mockAuth({ role: 'OWNER', userId: 'u-1' }); // 대상 userId 와 동일
      renderPage();
      expect(screen.getByRole('button', { name: 'ADMIN' })).toBeDisabled();
    });
  });

  describe('초기화 버튼', () => {
    it('bio 가 있으면 "초기화" 버튼이 활성, 없으면 비활성', () => {
      renderPage();
      expect(screen.getByRole('button', { name: '초기화' })).toBeEnabled();
    });

    it('bio 가 없으면 "초기화" 버튼이 비활성이다', () => {
      mockUseAdminUserDetail.mockReturnValue({
        ...DEFAULT_DETAIL_RETURN,
        user: { ...MOCK_USER, bio: null },
      });
      renderPage();
      expect(screen.getByRole('button', { name: '초기화' })).toBeDisabled();
    });
  });

  describe('변경 / 저장 플로우', () => {
    it('변경 전에는 "변경사항 저장" 버튼이 비활성이다', () => {
      renderPage();
      expect(screen.getByRole('button', { name: '변경사항 저장' })).toBeDisabled();
    });

    it('역할 변경 후 저장 클릭 시 알림 작성 모달이 열린다', () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));
      const saveBtn = screen.getByRole('button', { name: '변경사항 저장' });
      expect(saveBtn).toBeEnabled();
      fireEvent.click(saveBtn);
      // 모달 변경 요약 + 받는 사람 노출
      expect(screen.getByText('이번에 저장되는 변경사항')).toBeInTheDocument();
      expect(screen.getByText('USER → ADMIN')).toBeInTheDocument();
      expect(screen.getByText(/받는 사람 · 홍길동/)).toBeInTheDocument();
    });

    it('"알림 없이 수정 저장" 시 notification 없이 updateAdminUser 호출', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));
      fireEvent.click(screen.getByRole('button', { name: '변경사항 저장' }));
      fireEvent.click(screen.getByRole('button', { name: '알림 없이 수정 저장' }));

      await waitFor(() => {
        expect(mockUpdateAdminUser).toHaveBeenCalledWith(
          'u-1',
          expect.objectContaining({ role: 'ADMIN', notification: undefined }),
        );
        expect(mockToastSuccess).toHaveBeenCalledWith('변경사항을 저장했어요.');
      });
    });

    it('알림 작성 후 "알림 보내고 수정 저장" 시 notification 포함 updateAdminUser 호출', async () => {
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));
      fireEvent.click(screen.getByRole('button', { name: '변경사항 저장' }));

      fireEvent.change(screen.getByPlaceholderText('알림 제목'), { target: { value: '안내' } });
      fireEvent.change(screen.getByPlaceholderText('사용자에게 전할 내용을 입력해주세요.'), {
        target: { value: '역할이 변경됐어요' },
      });
      fireEvent.click(screen.getByRole('button', { name: '알림 보내고 수정 저장' }));

      await waitFor(() => {
        expect(mockUpdateAdminUser).toHaveBeenCalledWith(
          'u-1',
          expect.objectContaining({
            role: 'ADMIN',
            notification: { type: 'INFO', title: '안내', content: '역할이 변경됐어요' },
          }),
        );
      });
    });

    it('저장 실패(FORBIDDEN) 시 권한 없음 토스트', async () => {
      mockUpdateAdminUser.mockRejectedValue(new Error('fail'));
      mockMapAdminError.mockReturnValue('FORBIDDEN');
      renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));
      fireEvent.click(screen.getByRole('button', { name: '변경사항 저장' }));
      fireEvent.click(screen.getByRole('button', { name: '알림 없이 수정 저장' }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('권한이 없어요.');
      });
    });
  });

  describe('상태 토글', () => {
    it('"정지" 클릭 시 정지 종료일 입력이 노출된다', () => {
      renderPage();
      expect(screen.queryByText('정지 종료일')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: '정지' }));
      expect(screen.getByText('정지 종료일')).toBeInTheDocument();
    });
  });

  describe('수정 이력', () => {
    it('이력이 없으면 "아직 수정 내역이 없어요." 가 보인다', () => {
      renderPage();
      expect(screen.getByText('아직 수정 내역이 없어요.')).toBeInTheDocument();
    });

    it('이력이 있으면 행과 총 건수가 표시된다', () => {
      mockUseAdminUserHistories.mockReturnValue({
        ...DEFAULT_HISTORIES_RETURN,
        items: [makeHistory(1)],
        totalElements: 1,
      });
      renderPage();
      expect(screen.getByText('관리자')).toBeInTheDocument();
      expect(screen.getByText('역할 변경')).toBeInTheDocument();
      expect(screen.getByText('총 1건')).toBeInTheDocument();
    });
  });

  describe('탈퇴 유저 읽기전용', () => {
    beforeEach(() => {
      mockUseAdminUserDetail.mockReturnValue({
        ...DEFAULT_DETAIL_RETURN,
        user: { ...MOCK_USER, status: 'WITHDRAWN' },
      });
    });

    it('탈퇴 안내 문구가 보이고 토글/저장이 비활성이다', () => {
      renderPage();
      expect(screen.getByText('탈퇴한 유저는 수정할 수 없어요.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '정지' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '초기화' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '변경사항 저장' })).toBeDisabled();
    });
  });
});
