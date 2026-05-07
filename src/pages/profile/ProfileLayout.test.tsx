import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import ProfileLayout from './ProfileLayout';
import type { User } from '@/types';

// ── mock useProfile ──────────────────────────────────────────────────────────
const mockUseProfile = vi.hoisted(() => vi.fn());

vi.mock('@/hooks/useProfile', () => ({
  default: mockUseProfile,
}));

// ── mock child components ────────────────────────────────────────────────────
vi.mock('@/components/profile-card', () => ({
  default: ({
    nickname,
    imageUrl,
    bio,
    isProfilePublic,
    stats,
  }: {
    nickname: string;
    imageUrl?: string | null;
    bio?: string;
    isProfilePublic: boolean;
    stats?: object;
  }) => (
    <div
      data-testid="profile-card"
      data-nickname={nickname}
      data-image-url={imageUrl ?? ''}
      data-bio={bio ?? ''}
      data-is-public={String(isProfilePublic)}
      data-has-stats={stats ? 'true' : 'false'}
    />
  ),
}));

vi.mock('@/components/profile-sidebar', () => ({
  default: ({ isMe, userId }: { isMe: boolean; userId?: number }) => (
    <div data-testid="profile-sidebar" data-is-me={String(isMe)} data-user-id={userId ?? ''} />
  ),
  PROFILE_MENU_ITEMS: [],
  buildBaseTo: (userId?: number) => (userId === undefined ? '/profile' : `/profile/${userId}`),
  resolveTo: (base: string, item: { to: string }) => (item.to === '' ? base : `${base}/${item.to}`),
}));

vi.mock('@/components/profile-tab-bar', () => ({
  default: ({ isMe, userId }: { isMe: boolean; userId?: number }) => (
    <div data-testid="profile-tab-bar" data-is-me={String(isMe)} data-user-id={userId ?? ''} />
  ),
}));

// ── helpers ──────────────────────────────────────────────────────────────────
const MOCK_PROFILE: User = {
  id: 1,
  email: 'test@example.com',
  nickname: '테스트유저',
  provider: 'GOOGLE',
  profileImageUrl: 'https://example.com/avatar.png',
  bio: '안녕하세요',
  isProfilePublic: true,
  createdAt: '2025-01-01T00:00:00Z',
  stats: { playCount: 10, correctRate: 80, createdQuizCount: 3 },
};

const renderLayout = (path = '/profile') =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          {/* userId 없는 경우 */}
          <Route path="/profile" element={<ProfileLayout />}>
            <Route index element={<div data-testid="outlet-child">Outlet 내용</div>} />
          </Route>
          {/* userId 있는 경우 */}
          <Route path="/profile/:userId" element={<ProfileLayout />}>
            <Route index element={<div data-testid="outlet-child">Outlet 내용</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('ProfileLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('로딩 상태', () => {
    it('isLoading=true 이면 "프로필을 불러오는 중..." 텍스트가 보인다', () => {
      mockUseProfile.mockReturnValue({
        profile: undefined,
        isLoading: true,
        error: null,
        isMe: false,
        mutate: vi.fn(),
      });

      renderLayout();
      expect(screen.getByText('프로필을 불러오는 중...')).toBeInTheDocument();
    });

    it('로딩 중에는 ProfileCard 가 렌더되지 않는다', () => {
      mockUseProfile.mockReturnValue({
        profile: undefined,
        isLoading: true,
        error: null,
        isMe: false,
        mutate: vi.fn(),
      });

      renderLayout();
      expect(screen.queryByTestId('profile-card')).not.toBeInTheDocument();
    });
  });

  describe('에러 / 프로필 없음', () => {
    it('error 발생 시 "프로필을 불러오지 못했습니다." 안내 메시지가 보인다', () => {
      mockUseProfile.mockReturnValue({
        profile: undefined,
        isLoading: false,
        error: new Error('서버 에러'),
        isMe: false,
        mutate: vi.fn(),
      });

      renderLayout();
      expect(screen.getByText('프로필을 불러오지 못했습니다.')).toBeInTheDocument();
    });

    it('에러 시 홈 링크가 렌더된다', () => {
      mockUseProfile.mockReturnValue({
        profile: undefined,
        isLoading: false,
        error: new Error('서버 에러'),
        isMe: false,
        mutate: vi.fn(),
      });

      renderLayout();
      expect(screen.getByText('홈으로')).toBeInTheDocument();
    });

    it('profile=undefined(error 없음)일 때도 안내 메시지가 보인다', () => {
      mockUseProfile.mockReturnValue({
        profile: undefined,
        isLoading: false,
        error: null,
        isMe: false,
        mutate: vi.fn(),
      });

      renderLayout();
      expect(screen.getByText('프로필을 불러오지 못했습니다.')).toBeInTheDocument();
    });
  });

  describe('비공개 프로필', () => {
    it('isMe=false && profile.isProfilePublic=false 이면 "비공개 프로필입니다." 안내가 보인다', () => {
      mockUseProfile.mockReturnValue({
        profile: { ...MOCK_PROFILE, isProfilePublic: false },
        isLoading: false,
        error: null,
        isMe: false,
        mutate: vi.fn(),
      });

      renderLayout('/profile/42');
      expect(screen.getByText('비공개 프로필입니다.')).toBeInTheDocument();
    });

    it('비공개 안내 시 홈 링크가 렌더된다', () => {
      mockUseProfile.mockReturnValue({
        profile: { ...MOCK_PROFILE, isProfilePublic: false },
        isLoading: false,
        error: null,
        isMe: false,
        mutate: vi.fn(),
      });

      renderLayout('/profile/42');
      expect(screen.getByText('홈으로')).toBeInTheDocument();
    });

    it('isMe=true && profile.isProfilePublic=false 이면 본인이므로 정상 렌더된다', () => {
      mockUseProfile.mockReturnValue({
        profile: { ...MOCK_PROFILE, isProfilePublic: false },
        isLoading: false,
        error: null,
        isMe: true,
        mutate: vi.fn(),
      });

      renderLayout();
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
      expect(screen.queryByText('비공개 프로필입니다.')).not.toBeInTheDocument();
    });
  });

  describe('정상 렌더 (공개 프로필)', () => {
    beforeEach(() => {
      mockUseProfile.mockReturnValue({
        profile: MOCK_PROFILE,
        isLoading: false,
        error: null,
        isMe: false,
        mutate: vi.fn(),
      });
    });

    it('ProfileCard 가 렌더된다', () => {
      renderLayout('/profile/1');
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
    });

    it('ProfileSidebar 가 렌더된다', () => {
      renderLayout('/profile/1');
      expect(screen.getByTestId('profile-sidebar')).toBeInTheDocument();
    });

    it('ProfileTabBar 가 렌더된다', () => {
      renderLayout('/profile/1');
      expect(screen.getByTestId('profile-tab-bar')).toBeInTheDocument();
    });

    it('Outlet 영역이 렌더된다 (자식 라우트)', () => {
      renderLayout('/profile/1');
      expect(screen.getByTestId('outlet-child')).toBeInTheDocument();
    });
  });

  describe('ProfileCard props 전달', () => {
    it('nickname, imageUrl, bio, isProfilePublic, stats 가 ProfileCard 에 전달된다', () => {
      mockUseProfile.mockReturnValue({
        profile: MOCK_PROFILE,
        isLoading: false,
        error: null,
        isMe: true,
        mutate: vi.fn(),
      });

      renderLayout();
      const card = screen.getByTestId('profile-card');

      expect(card).toHaveAttribute('data-nickname', MOCK_PROFILE.nickname);
      expect(card).toHaveAttribute('data-image-url', MOCK_PROFILE.profileImageUrl);
      expect(card).toHaveAttribute('data-bio', MOCK_PROFILE.bio);
      expect(card).toHaveAttribute('data-is-public', 'true');
      expect(card).toHaveAttribute('data-has-stats', 'true');
    });
  });

  describe('isMe=true 본인 공개 프로필', () => {
    it('ProfileCard, ProfileSidebar, ProfileTabBar 모두 마운트된다', () => {
      mockUseProfile.mockReturnValue({
        profile: MOCK_PROFILE,
        isLoading: false,
        error: null,
        isMe: true,
        mutate: vi.fn(),
      });

      renderLayout();
      expect(screen.getByTestId('profile-card')).toBeInTheDocument();
      expect(screen.getByTestId('profile-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('profile-tab-bar')).toBeInTheDocument();
    });
  });

  describe('memoization', () => {
    it('displayName 이 "ProfileLayout" 이다', () => {
      expect(ProfileLayout.displayName).toBe('ProfileLayout');
    });
  });
});
