import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { render } from '@testing-library/react';
import { theme } from '@/styles/theme';
import type { User } from '@/types';
import ProfileAccount from './ProfileAccount';

// ── react-router-dom mock ────────────────────────────────────────────────────
const mockNavigate = vi.hoisted(() => vi.fn());
const mockUseOutletContext = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) =>
    React.createElement('div', {
      'data-testid': 'navigate',
      'data-to': to,
      'data-replace': String(replace ?? false),
    }),
  useNavigate: () => mockNavigate,
  useOutletContext: mockUseOutletContext,
}));

// ── authStore mock ────────────────────────────────────────────────────────────
const mockLogout = vi.hoisted(() => vi.fn());

vi.mock('@/store/authStore', () => ({
  default: (selector: (state: { logout: () => void }) => unknown) =>
    selector({ logout: mockLogout }),
}));

// ── getActivityDays mock ──────────────────────────────────────────────────────
const mockGetActivityDays = vi.hoisted(() =>
  vi.fn().mockReturnValue({ days: 100, joinedDate: '2025-01-01' }),
);

vi.mock('@/lib/time/activity', () => ({
  getActivityDays: mockGetActivityDays,
}));

// ── device mock ───────────────────────────────────────────────────────────────
vi.mock('@/lib/device', () => ({
  parseUserAgent: vi.fn().mockReturnValue({ browser: 'Chrome', os: 'macOS' }),
  formatDeviceLabel: vi.fn().mockReturnValue('Chrome · macOS'),
}));

// ── PasswordChangeModal mock ──────────────────────────────────────────────────
vi.mock('@/components/password-change-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? React.createElement('div', { 'data-testid': 'password-change-modal' }) : null,
}));

// ── WithdrawConfirmModal mock ─────────────────────────────────────────────────
vi.mock('@/components/withdraw-confirm-modal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? React.createElement('div', { 'data-testid': 'withdraw-confirm-modal' }) : null,
}));

// ── 샘플 User fixture ─────────────────────────────────────────────────────────
const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  email: 'test@example.com',
  nickname: 'testuser',
  provider: 'local',
  profileImageUrl: 'https://example.com/avatar.png',
  bio: '안녕',
  isProfilePublic: true,
  createdAt: '2025-01-01T00:00:00Z',
  stats: {
    playCount: 30,
    correctRate: 75,
    createdQuizCount: 12,
  },
  ...overrides,
});

// ── render 헬퍼 ───────────────────────────────────────────────────────────────
const renderProfileAccount = (overrides: { profile?: Partial<User>; isMe?: boolean } = {}) => {
  const profile = makeUser(overrides.profile);
  const isMe = overrides.isMe ?? true;

  mockUseOutletContext.mockReturnValue({ profile, isMe });

  return render(
    <ThemeProvider theme={theme}>
      <ProfileAccount />
    </ThemeProvider>,
  );
};

// ── 테스트 ────────────────────────────────────────────────────────────────────
describe('ProfileAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetActivityDays.mockReturnValue({ days: 100, joinedDate: '2025-01-01' });
  });

  describe('displayName', () => {
    it('displayName 이 "ProfileAccount" 이다', () => {
      expect(ProfileAccount.displayName).toBe('ProfileAccount');
    });
  });

  describe('접근 제어', () => {
    it('isMe=false 이면 Navigate 를 렌더하고 계정 페이지 내용은 미렌더된다', () => {
      renderProfileAccount({ isMe: false });
      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '..');
      expect(screen.queryByRole('heading', { name: '계정' })).not.toBeInTheDocument();
    });

    it('isMe=false 에서 Navigate 의 replace 속성이 true 다', () => {
      renderProfileAccount({ isMe: false });
      expect(screen.getByTestId('navigate')).toHaveAttribute('data-replace', 'true');
    });

    it('isMe=true 이면 Navigate 없이 계정 페이지를 렌더한다', () => {
      renderProfileAccount({ isMe: true });
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: '계정' })).toBeInTheDocument();
    });
  });

  describe('활동 표시', () => {
    it('getActivityDays 반환값으로 "활동한지 N일째" 텍스트를 렌더한다', () => {
      mockGetActivityDays.mockReturnValue({ days: 42, joinedDate: '2025-03-01' });
      renderProfileAccount();
      expect(screen.getByText('42일')).toBeInTheDocument();
      expect(screen.getByText(/활동한지/)).toBeInTheDocument();
    });

    it('가입일이 "가입일 YYYY-MM-DD" 형식으로 표시된다', () => {
      mockGetActivityDays.mockReturnValue({ days: 42, joinedDate: '2025-03-01' });
      renderProfileAccount();
      expect(screen.getByText('가입일 2025-03-01')).toBeInTheDocument();
    });

    it('getActivityDays 가 null 을 반환하면 활동 섹션이 미렌더된다', () => {
      mockGetActivityDays.mockReturnValue(null);
      renderProfileAccount();
      expect(screen.queryByText(/활동한지/)).not.toBeInTheDocument();
    });
  });

  describe('이메일 표시', () => {
    it('profile.email 이 렌더된다', () => {
      renderProfileAccount({ profile: { email: 'woong@test.com' } });
      expect(screen.getByText('woong@test.com')).toBeInTheDocument();
    });
  });

  describe('local provider — 비밀번호 카드', () => {
    it('provider="local" 이면 비밀번호 카드가 렌더된다', () => {
      renderProfileAccount({ profile: { provider: 'local' } });
      expect(screen.getByText('비밀번호')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '비밀번호 변경' })).toBeInTheDocument();
    });

    it('provider="local" 이면 이메일 서브텍스트가 "변경할 수 없어요" 다', () => {
      renderProfileAccount({ profile: { provider: 'local' } });
      expect(screen.getByText('변경할 수 없어요')).toBeInTheDocument();
    });

    it('provider="local" 이면 이메일 옆에 provider 배지가 미렌더된다', () => {
      renderProfileAccount({ profile: { provider: 'local' } });
      expect(screen.queryByText('Google')).not.toBeInTheDocument();
      expect(screen.queryByText('Naver')).not.toBeInTheDocument();
      expect(screen.queryByText('Kakao')).not.toBeInTheDocument();
    });
  });

  describe('OAuth provider — 이메일 배지 & 서브텍스트', () => {
    it('provider="google" 이면 비밀번호 카드가 미렌더된다', () => {
      renderProfileAccount({ profile: { provider: 'google' } });
      expect(screen.queryByText('비밀번호')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '비밀번호 변경' })).not.toBeInTheDocument();
    });

    it('provider="google" 이면 이메일 옆 "Google" 배지가 렌더된다', () => {
      renderProfileAccount({ profile: { provider: 'google' } });
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    it('provider="google" 이면 서브텍스트가 "소셜 로그인 계정 (Google)" 이다', () => {
      renderProfileAccount({ profile: { provider: 'google' } });
      expect(screen.getByText('소셜 로그인 계정 (Google)')).toBeInTheDocument();
    });

    it('provider="naver" 이면 "Naver" 배지와 서브텍스트가 렌더된다', () => {
      renderProfileAccount({ profile: { provider: 'naver' } });
      expect(screen.getByText('Naver')).toBeInTheDocument();
      expect(screen.getByText('소셜 로그인 계정 (Naver)')).toBeInTheDocument();
    });

    it('provider="kakao" 이면 "Kakao" 배지와 서브텍스트가 렌더된다', () => {
      renderProfileAccount({ profile: { provider: 'kakao' } });
      expect(screen.getByText('Kakao')).toBeInTheDocument();
      expect(screen.getByText('소셜 로그인 계정 (Kakao)')).toBeInTheDocument();
    });
  });

  describe('현재 세션', () => {
    it('"이 기기에 로그인됨" 텍스트가 렌더된다', () => {
      renderProfileAccount();
      expect(screen.getByText('이 기기에 로그인됨')).toBeInTheDocument();
    });

    it('deviceLabel 이 있으면 서브텍스트로 렌더된다', () => {
      renderProfileAccount();
      expect(screen.getByText('Chrome · macOS')).toBeInTheDocument();
    });
  });

  describe('로그아웃', () => {
    it('"로그아웃" 버튼이 렌더된다', () => {
      renderProfileAccount();
      expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
    });

    it('"로그아웃" 클릭 시 authStore.logout 이 호출된다', () => {
      renderProfileAccount();
      fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('"로그아웃" 클릭 시 navigate("/login", { replace: true }) 가 호출된다', () => {
      renderProfileAccount();
      fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });
  });

  describe('비밀번호 변경 모달', () => {
    it('provider="local" 에서 "비밀번호 변경" 버튼 클릭 전 PasswordChangeModal 미노출', () => {
      renderProfileAccount({ profile: { provider: 'local' } });
      expect(screen.queryByTestId('password-change-modal')).not.toBeInTheDocument();
    });

    it('"비밀번호 변경" 버튼 클릭 시 PasswordChangeModal 이 열린다', async () => {
      renderProfileAccount({ profile: { provider: 'local' } });
      fireEvent.click(screen.getByRole('button', { name: '비밀번호 변경' }));
      await waitFor(() => expect(screen.getByTestId('password-change-modal')).toBeInTheDocument());
    });
  });

  describe('회원 탈퇴 카드', () => {
    it('"회원 탈퇴" 섹션 제목이 렌더된다', () => {
      renderProfileAccount();
      expect(screen.getByRole('region', { name: '회원 탈퇴' })).toBeInTheDocument();
    });

    it('"회원 탈퇴" 버튼 클릭 전 WithdrawConfirmModal 미노출', () => {
      renderProfileAccount();
      expect(screen.queryByTestId('withdraw-confirm-modal')).not.toBeInTheDocument();
    });

    it('"회원 탈퇴" 버튼 클릭 시 WithdrawConfirmModal 이 열린다', async () => {
      renderProfileAccount();
      fireEvent.click(screen.getByRole('button', { name: '회원 탈퇴' }));
      await waitFor(() => expect(screen.getByTestId('withdraw-confirm-modal')).toBeInTheDocument());
    });
  });

  describe('전체 레이아웃 — isMe=true + local', () => {
    it('활동 / 이메일 / 비밀번호 / 현재 세션 / 회원 탈퇴 카드가 모두 렌더된다', () => {
      mockGetActivityDays.mockReturnValue({ days: 100, joinedDate: '2025-01-01' });
      renderProfileAccount({ profile: { provider: 'local' } });

      expect(screen.getByText(/활동한지/)).toBeInTheDocument();
      expect(screen.getByText('이메일')).toBeInTheDocument();
      expect(screen.getByText('비밀번호')).toBeInTheDocument();
      expect(screen.getByText('현재 세션')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: '회원 탈퇴' })).toBeInTheDocument();
    });

    it('isMe=true + google provider — 비밀번호 카드 제외 나머지 모두 렌더된다', () => {
      mockGetActivityDays.mockReturnValue({ days: 100, joinedDate: '2025-01-01' });
      renderProfileAccount({ profile: { provider: 'google' } });

      expect(screen.getByText(/활동한지/)).toBeInTheDocument();
      expect(screen.getByText('이메일')).toBeInTheDocument();
      expect(screen.queryByText('비밀번호')).not.toBeInTheDocument();
      expect(screen.getByText('현재 세션')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: '회원 탈퇴' })).toBeInTheDocument();
    });
  });
});
