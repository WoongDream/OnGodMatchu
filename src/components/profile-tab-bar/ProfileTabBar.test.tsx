import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import ProfileTabBar from './ProfileTabBar';
import type { UserStats } from '@/types';

const MOCK_STATS: UserStats = {
  playCount: 30,
  correctRate: 75,
  createdQuizCount: 5,
};

const renderTabBar = (
  props: { isMe: boolean; userId?: number; stats?: UserStats },
  initialPath = '/profile',
) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[initialPath]}>
        <ProfileTabBar {...props} />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('ProfileTabBar', () => {
  describe('isMe=true 일 때', () => {
    it('메뉴 4개가 모두 렌더된다 (환경설정 제외)', () => {
      renderTabBar({ isMe: true });
      expect(screen.getByText('내 정보')).toBeInTheDocument();
      expect(screen.getByText('내가 만든 퀴즈')).toBeInTheDocument();
      expect(screen.getByText('내가 푼 퀴즈')).toBeInTheDocument();
      expect(screen.getByText('계정')).toBeInTheDocument();
      expect(screen.queryByText('환경설정')).not.toBeInTheDocument();
    });
  });

  describe('isMe=false 일 때', () => {
    it('계정이 숨겨지고 링크 3개만 렌더된다', () => {
      renderTabBar({ isMe: false });
      expect(screen.queryByText('계정')).not.toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(3);
    });
  });

  describe('stats 카운트', () => {
    it('stats 제공 시 createdQuizCount 가 표시된다', () => {
      renderTabBar({ isMe: true, stats: MOCK_STATS });
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('stats 제공 시 playCount 가 표시된다', () => {
      renderTabBar({ isMe: true, stats: MOCK_STATS });
      expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('stats 없으면 카운트가 미렌더된다', () => {
      renderTabBar({ isMe: true });
      expect(screen.queryByText('5')).not.toBeInTheDocument();
      expect(screen.queryByText('30')).not.toBeInTheDocument();
    });
  });

  describe('userId 지정 시 링크 경로', () => {
    it('userId=42 이면 내가 만든 퀴즈 링크가 /profile/42/quizzes-made 이다', () => {
      renderTabBar({ isMe: false, userId: 42 });
      const link = screen.getByText('내가 만든 퀴즈').closest('a');
      expect(link).toHaveAttribute('href', '/profile/42/quizzes-made');
    });

    it('userId=42 이면 내가 푼 퀴즈 링크가 /profile/42/quizzes-played 이다', () => {
      renderTabBar({ isMe: false, userId: 42 });
      const link = screen.getByText('내가 푼 퀴즈').closest('a');
      expect(link).toHaveAttribute('href', '/profile/42/quizzes-played');
    });
  });

  describe('memoization', () => {
    it('displayName 이 "ProfileTabBar" 이다', () => {
      expect(ProfileTabBar.displayName).toBe('ProfileTabBar');
    });
  });
});
