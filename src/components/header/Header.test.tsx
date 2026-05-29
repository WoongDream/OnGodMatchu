import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithTheme, screen } from '@/test/renderWithTheme';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import useAuthStore from '@/store/authStore';
import useVisitorSummary from '@/hooks/useVisitorSummary';
import * as router from 'react-router-dom';
import type { User } from '@/types';

const renderHeader = (path = '/') =>
  renderWithTheme(
    <MemoryRouter initialEntries={[path]}>
      <Header />
    </MemoryRouter>,
  );

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock authStore
vi.mock('@/store/authStore', () => ({
  default: vi.fn(),
}));

// Mock useVisitorSummary — 기본은 data undefined 라 VisitorBlock 미마운트 (기존 케이스 무영향)
vi.mock('@/hooks/useVisitorSummary', () => ({
  default: vi.fn(() => ({ data: undefined, isLoading: false, error: null })),
}));

// Mock ProfileImage to keep tests focused on Header behavior
vi.mock('@/components/profile-image', () => ({
  default: ({ nickname, imageUrl }: { nickname: string; imageUrl?: string | null }) => (
    <span data-testid="profile-image" data-nickname={nickname} data-image-url={imageUrl ?? ''}>
      {nickname}
    </span>
  ),
}));

const MOCK_USER: User = {
  id: 1,
  email: 'test@example.com',
  nickname: '우진',
  provider: 'GOOGLE',
  profileImageUrl: 'https://example.com/avatar.png',
  isProfilePublic: true,
  createdAt: '2025-01-01T00:00:00Z',
};

describe('Header', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (router.useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  describe('logo rendering and navigation', () => {
    it('renders the logo image with alt "OnGodMatchu"', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: false,
        user: null,
      });

      renderHeader();
      const logo = screen.getByRole('img', { name: 'OnGodMatchu' });

      expect(logo).toBeInTheDocument();
      expect(logo.tagName).toBe('IMG');
    });

    it('navigates to "/" when logo is clicked', async () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: false,
        user: null,
      });

      const user = userEvent.setup();
      renderHeader();
      const logo = screen.getByRole('img', { name: 'OnGodMatchu' });

      await user.click(logo);

      expect(mockNavigate).toHaveBeenCalledWith('/');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('when not logged in', () => {
    beforeEach(() => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: false,
        user: null,
      });
    });

    it('shows the "로그인" button', () => {
      renderHeader();
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
    });

    it('does not show the "퀴즈 만들기" button', () => {
      renderHeader();
      expect(screen.queryByRole('button', { name: '퀴즈 만들기' })).not.toBeInTheDocument();
    });

    it('does not show the "프로필" button', () => {
      renderHeader();
      expect(screen.queryByRole('button', { name: '프로필' })).not.toBeInTheDocument();
    });

    it('navigates to "/login" when login button is clicked', async () => {
      const user = userEvent.setup();
      renderHeader();
      await user.click(screen.getByRole('button', { name: '로그인' }));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('when logged in', () => {
    beforeEach(() => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: true,
        user: MOCK_USER,
      });
    });

    it('does not show the "퀴즈 만들기" button (헤더에서 제거)', () => {
      renderHeader();
      expect(screen.queryByRole('button', { name: '퀴즈 만들기' })).not.toBeInTheDocument();
    });

    it('shows the "프로필" button (aria-label)', () => {
      renderHeader();
      expect(screen.getByRole('button', { name: '프로필' })).toBeInTheDocument();
    });

    it('does not show the "로그인" button', () => {
      renderHeader();
      expect(screen.queryByRole('button', { name: '로그인' })).not.toBeInTheDocument();
    });

    it('does not show a "로그아웃" button', () => {
      renderHeader();
      expect(screen.queryByRole('button', { name: '로그아웃' })).not.toBeInTheDocument();
    });

    it('navigates to "/profile" when profile button is clicked', async () => {
      const user = userEvent.setup();
      renderHeader();
      await user.click(screen.getByRole('button', { name: '프로필' }));

      expect(mockNavigate).toHaveBeenCalledWith('/profile');
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    it('profile button contains the ProfileImage mock', () => {
      renderHeader();
      const profileButton = screen.getByRole('button', { name: '프로필' });
      expect(profileButton.querySelector('[data-testid="profile-image"]')).toBeInTheDocument();
    });

    it('passes user.nickname to ProfileImage', () => {
      renderHeader();
      const profileImage = screen.getByTestId('profile-image');
      expect(profileImage).toHaveAttribute('data-nickname', MOCK_USER.nickname);
    });

    it('passes user.profileImageUrl to ProfileImage', () => {
      renderHeader();
      const profileImage = screen.getByTestId('profile-image');
      expect(profileImage).toHaveAttribute('data-image-url', MOCK_USER.profileImageUrl);
    });
  });

  describe('when logged in with user=null (defensive)', () => {
    it('renders without error and passes empty string as nickname to ProfileImage', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: true,
        user: null,
      });

      renderHeader();
      const profileImage = screen.getByTestId('profile-image');
      expect(profileImage).toHaveAttribute('data-nickname', '');
    });
  });

  describe('authentication state transitions', () => {
    it('shows login button when not logged in and profile button when logged in (separate renders)', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: false,
        user: null,
      });
      const { unmount } = renderHeader();
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
      unmount();

      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: true,
        user: MOCK_USER,
      });
      renderHeader();
      expect(screen.getByRole('button', { name: '프로필' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '로그인' })).not.toBeInTheDocument();
    });
  });

  describe('인증 부트스트랩 중 (status=bootstrapping)', () => {
    it('비로그인 + bootstrapping 이면 로그인/프로필 버튼 없이 스켈레톤만 노출', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: false,
        user: null,
        status: 'bootstrapping',
      });

      renderHeader();
      expect(screen.queryByRole('button', { name: '로그인' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '프로필' })).not.toBeInTheDocument();
      expect(screen.getByTestId('header-auth-placeholder')).toBeInTheDocument();
    });

    it('isLoggedIn=true 여도 bootstrapping 이면 프로필 버튼 대신 스켈레톤만 노출', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: true,
        user: MOCK_USER,
        status: 'bootstrapping',
      });

      renderHeader();
      expect(screen.queryByRole('button', { name: '로그인' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '프로필' })).not.toBeInTheDocument();
      expect(screen.getByTestId('header-auth-placeholder')).toBeInTheDocument();
    });

    it('status=ready + 비로그인 이면 로그인 버튼 노출 (스켈레톤 없음)', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: false,
        user: null,
        status: 'ready',
      });

      renderHeader();
      expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
      expect(screen.queryByTestId('header-auth-placeholder')).not.toBeInTheDocument();
    });

    it('status=ready + 로그인 이면 프로필 버튼 노출 (스켈레톤 없음)', () => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: true,
        user: MOCK_USER,
        status: 'ready',
      });

      renderHeader();
      expect(screen.getByRole('button', { name: '프로필' })).toBeInTheDocument();
      expect(screen.queryByTestId('header-auth-placeholder')).not.toBeInTheDocument();
    });
  });

  describe('memoization', () => {
    it('has displayName "Header"', () => {
      expect(Header.displayName).toBe('Header');
    });
  });

  describe('VisitorBlock 마운트 회귀', () => {
    beforeEach(() => {
      (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoggedIn: false,
        user: null,
      });
    });

    it('useVisitorSummary 가 data 를 반환하면 VisitorBlock 이 마운트된다 (TODAY 노출)', () => {
      (useVisitorSummary as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: {
          today: 63,
          total: 7_600_000,
          daily: [
            { date: '2026-05-22', visitorCount: 1 },
            { date: '2026-05-23', visitorCount: 2 },
            { date: '2026-05-24', visitorCount: 3 },
            { date: '2026-05-25', visitorCount: 4 },
            { date: '2026-05-26', visitorCount: 5 },
            { date: '2026-05-27', visitorCount: 6 },
            { date: '2026-05-28', visitorCount: 63 },
          ],
        },
        isLoading: false,
        error: null,
      });

      renderHeader();
      expect(screen.getByLabelText('방문자 통계')).toBeInTheDocument();
      expect(screen.getByText('TODAY')).toBeInTheDocument();
      expect(screen.getByText('63')).toBeInTheDocument();
    });

    it('useVisitorSummary 가 data undefined 면 VisitorBlock 미마운트', () => {
      (useVisitorSummary as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      renderHeader();
      expect(screen.queryByLabelText('방문자 통계')).not.toBeInTheDocument();
      expect(screen.queryByText('TODAY')).not.toBeInTheDocument();
    });
  });
});
