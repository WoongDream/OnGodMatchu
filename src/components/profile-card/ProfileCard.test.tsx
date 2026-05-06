import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '@/test/renderWithTheme';
import ProfileCard from './ProfileCard';
import type { UserStats } from '@/types';

vi.mock('@/components/profile-image', () => ({
  default: ({ nickname, imageUrl }: { nickname: string; imageUrl?: string | null }) => (
    <div data-testid="profile-image" data-nickname={nickname} data-image-url={imageUrl ?? ''} />
  ),
}));

vi.mock('@/components/badge', () => ({
  default: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant ?? ''}>
      {children}
    </span>
  ),
}));

const MOCK_STATS: UserStats = {
  playCount: 348,
  correctRate: 63.6,
  createdQuizCount: 12,
};

describe('ProfileCard', () => {
  describe('닉네임', () => {
    it('nickname 텍스트가 렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isPublic={false} />);
      expect(screen.getByText('테스트유저')).toBeInTheDocument();
    });
  });

  describe('bio', () => {
    it('bio 가 있으면 렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" bio="안녕하세요" isPublic={false} />);
      expect(screen.getByText('안녕하세요')).toBeInTheDocument();
    });

    it('bio 가 없으면 미렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isPublic={false} />);
      // bio 영역 자체가 없어야 함
      expect(screen.queryByText('안녕하세요')).not.toBeInTheDocument();
    });
  });

  describe('isPublic Badge', () => {
    it('isPublic=true 이면 "공개" Badge 가 렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isPublic={true} />);
      const badge = screen.getByTestId('badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('공개');
    });

    it('isPublic=false 이면 Badge 가 없다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isPublic={false} />);
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
    });
  });

  describe('stats', () => {
    it('stats 가 있으면 플레이수가 표시된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isPublic={false} stats={MOCK_STATS} />);
      expect(screen.getByText('348')).toBeInTheDocument();
    });

    it('stats 가 있으면 정답률이 Math.round 적용돼 표시된다 (63.6 → 64%)', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isPublic={false} stats={MOCK_STATS} />);
      expect(screen.getByText('64%')).toBeInTheDocument();
    });

    it('stats 가 있으면 만든 퀴즈 수가 표시된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isPublic={false} stats={MOCK_STATS} />);
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('stats 가 없으면 통계 영역이 미렌더된다', () => {
      renderWithTheme(<ProfileCard nickname="테스트유저" isPublic={false} />);
      expect(screen.queryByText('플레이')).not.toBeInTheDocument();
      expect(screen.queryByText('정답률')).not.toBeInTheDocument();
      expect(screen.queryByText('만든 퀴즈')).not.toBeInTheDocument();
    });
  });

  describe('ProfileImage', () => {
    it('ProfileImage 에 nickname 이 전달된다', () => {
      renderWithTheme(<ProfileCard nickname="프로필유저" isPublic={false} />);
      expect(screen.getByTestId('profile-image')).toHaveAttribute('data-nickname', '프로필유저');
    });

    it('ProfileImage 에 imageUrl 이 전달된다', () => {
      renderWithTheme(
        <ProfileCard
          nickname="프로필유저"
          imageUrl="https://example.com/avatar.png"
          isPublic={false}
        />,
      );
      expect(screen.getByTestId('profile-image')).toHaveAttribute(
        'data-image-url',
        'https://example.com/avatar.png',
      );
    });
  });

  describe('memoization', () => {
    it('displayName 이 "ProfileCard" 이다', () => {
      expect(ProfileCard.displayName).toBe('ProfileCard');
    });
  });
});
