import { describe, it, expect } from 'vitest';
import { screen, render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
    it('내 정보 / 퀴즈(그룹 헤더) / 환경설정 / 계정이 렌더된다', () => {
      renderSidebar({ isMe: true });
      expect(screen.getByText('내 정보')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /퀴즈/ })).toBeInTheDocument();
      expect(screen.getByText('환경설정')).toBeInTheDocument();
      expect(screen.getByText('계정')).toBeInTheDocument();
    });

    it('퀴즈 그룹은 기본적으로 닫혀 있어 자식 항목이 보이지 않는다', () => {
      renderSidebar({ isMe: true });
      expect(screen.queryByText('내가 만든')).not.toBeInTheDocument();
      expect(screen.queryByText('내가 푼')).not.toBeInTheDocument();
    });

    it('퀴즈 그룹 헤더 클릭 시 자식 항목이 펼쳐진다', () => {
      renderSidebar({ isMe: true });
      fireEvent.click(screen.getByRole('button', { name: /퀴즈/ }));
      expect(screen.getByText('내가 만든')).toBeInTheDocument();
      expect(screen.getByText('내가 푼')).toBeInTheDocument();
    });
  });

  describe('isMe=false 일 때', () => {
    it('myOnly 메뉴(환경설정, 계정)가 숨겨진다', () => {
      renderSidebar({ isMe: false });
      expect(screen.getByText('내 정보')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /퀴즈/ })).toBeInTheDocument();
      expect(screen.queryByText('환경설정')).not.toBeInTheDocument();
      expect(screen.queryByText('계정')).not.toBeInTheDocument();
    });
  });

  describe('자식 라우트 진입 시 자동 펼침', () => {
    it('initialPath 가 /profile/quizzes-made 이면 퀴즈 그룹이 펼쳐진 상태로 렌더된다', () => {
      renderSidebar({ isMe: true }, '/profile/quizzes-made');
      expect(screen.getByText('내가 만든')).toBeInTheDocument();
      expect(screen.getByText('내가 푼')).toBeInTheDocument();
    });

    it('initialPath 가 /profile/quizzes-played 이면 퀴즈 그룹이 펼쳐진다', () => {
      renderSidebar({ isMe: true }, '/profile/quizzes-played');
      expect(screen.getByText('내가 만든')).toBeInTheDocument();
      expect(screen.getByText('내가 푼')).toBeInTheDocument();
    });

    it('자식 active 인 경우 그룹 헤더 aria-expanded=true', () => {
      renderSidebar({ isMe: true }, '/profile/quizzes-made');
      expect(screen.getByRole('button', { name: /퀴즈/ })).toHaveAttribute('aria-expanded', 'true');
    });
  });

  describe('stats 카운트', () => {
    it('퀴즈 그룹 펼친 뒤 만든 퀴즈 수가 표시된다', () => {
      renderSidebar({ isMe: true, stats: MOCK_STATS }, '/profile/quizzes-made');
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('퀴즈 그룹 펼친 뒤 푼 퀴즈 수가 표시된다', () => {
      renderSidebar({ isMe: true, stats: MOCK_STATS }, '/profile/quizzes-made');
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('stats 없으면 카운트가 미렌더된다', () => {
      renderSidebar({ isMe: true }, '/profile/quizzes-made');
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

    it('userId=42 + 자식 active 이면 자식 링크가 /profile/42/quizzes-made 이다', () => {
      renderSidebar({ isMe: false, userId: 42 }, '/profile/42/quizzes-made');
      const link = screen.getByText('내가 만든').closest('a');
      expect(link).toHaveAttribute('href', '/profile/42/quizzes-made');
    });

    it('userId 없으면 내 정보 링크가 /profile 이다', () => {
      renderSidebar({ isMe: true });
      const infoLink = screen.getByText('내 정보').closest('a');
      expect(infoLink).toHaveAttribute('href', '/profile');
    });
  });

  describe('NavLink 활성 상태', () => {
    it('현재 경로(/profile)와 일치하는 「내 정보」 링크에 active 클래스가 포함된다', () => {
      renderSidebar({ isMe: true }, '/profile');
      const infoLink = screen.getByText('내 정보').closest('a');
      expect(infoLink?.className).toContain('active');
    });

    it('자식 라우트 active 시 자식 NavLink 에 active 클래스', () => {
      renderSidebar({ isMe: true }, '/profile/quizzes-made');
      const link = screen.getByText('내가 만든').closest('a');
      expect(link?.className).toContain('active');
    });
  });

  describe('memoization', () => {
    it('displayName 이 "ProfileSidebar" 이다', () => {
      expect(ProfileSidebar.displayName).toBe('ProfileSidebar');
    });
  });
});
