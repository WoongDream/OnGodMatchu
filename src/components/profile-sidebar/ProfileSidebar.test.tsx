import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import ProfileSidebar from './ProfileSidebar';
import type { UserStats } from '@/types';

const MOCK_STATS: UserStats = {
  playCount: 50,
  correctRate: 80,
  createdQuizCount: 7,
};

const renderSidebar = (
  props: { isMe: boolean; userId?: number; stats?: UserStats },
  initialPath = '/profile',
) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialPath]}>
        <ProfileSidebar {...props} />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('ProfileSidebar', () => {
  describe('isMe=true 일 때', () => {
    it('메뉴 5개(내 정보, 만든 퀴즈, 푼 퀴즈, 환경설정, 계정)가 모두 렌더된다', () => {
      renderSidebar({ isMe: true });
      expect(screen.getByText('내 정보')).toBeInTheDocument();
      expect(screen.getByText('만든 퀴즈')).toBeInTheDocument();
      expect(screen.getByText('푼 퀴즈')).toBeInTheDocument();
      expect(screen.getByText('환경설정')).toBeInTheDocument();
      expect(screen.getByText('계정')).toBeInTheDocument();
    });
  });

  describe('isMe=false 일 때', () => {
    it('myOnly 메뉴(환경설정, 계정)가 숨겨지고 3개만 렌더된다', () => {
      renderSidebar({ isMe: false });
      expect(screen.getByText('내 정보')).toBeInTheDocument();
      expect(screen.getByText('만든 퀴즈')).toBeInTheDocument();
      expect(screen.getByText('푼 퀴즈')).toBeInTheDocument();
      expect(screen.queryByText('환경설정')).not.toBeInTheDocument();
      expect(screen.queryByText('계정')).not.toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(3);
    });
  });

  describe('stats 카운트', () => {
    it('stats 제공 시 만든 퀴즈 수가 옆에 표시된다', () => {
      renderSidebar({ isMe: true, stats: MOCK_STATS });
      // createdQuizCount = 7
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('stats 제공 시 푼 퀴즈(플레이) 수가 옆에 표시된다', () => {
      renderSidebar({ isMe: true, stats: MOCK_STATS });
      // playCount = 50
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('stats 없으면 카운트가 미렌더된다', () => {
      renderSidebar({ isMe: true });
      expect(screen.queryByText('7')).not.toBeInTheDocument();
      expect(screen.queryByText('50')).not.toBeInTheDocument();
    });
  });

  describe('userId 지정 시 링크 경로', () => {
    it('userId=42 이면 내 정보 링크가 /profile/42 이다', () => {
      renderSidebar({ isMe: false, userId: 42 });
      const infoLink = screen.getByText('내 정보').closest('a');
      expect(infoLink).toHaveAttribute('href', '/profile/42');
    });

    it('userId=42 이면 만든 퀴즈 링크가 /profile/42/quizzes-made 이다', () => {
      renderSidebar({ isMe: false, userId: 42 });
      const link = screen.getByText('만든 퀴즈').closest('a');
      expect(link).toHaveAttribute('href', '/profile/42/quizzes-made');
    });

    it('userId 없으면 내 정보 링크가 /profile 이다', () => {
      renderSidebar({ isMe: true });
      const infoLink = screen.getByText('내 정보').closest('a');
      expect(infoLink).toHaveAttribute('href', '/profile');
    });
  });

  describe('NavLink 활성 상태', () => {
    it('현재 경로와 일치하는 링크에 active 클래스가 포함된다', () => {
      renderSidebar({ isMe: true }, '/profile');
      const infoLink = screen.getByText('내 정보').closest('a');
      // React Router NavLink 는 active 상태일 때 className 에 "active" 를 추가한다
      expect(infoLink?.className).toContain('active');
    });
  });

  describe('memoization', () => {
    it('displayName 이 "ProfileSidebar" 이다', () => {
      expect(ProfileSidebar.displayName).toBe('ProfileSidebar');
    });
  });
});
